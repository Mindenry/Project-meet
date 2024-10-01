const express = require("express");
const oracledb = require("oracledb");
const dotenv = require("dotenv");
const cors = require("cors");
const nodemailer = require("nodemailer");
const validator = require("email-validator");
const bcrypt = require("bcrypt");

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Initialize Oracle client
try {
  oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_PATH });
  console.log("Oracle Instant Client initialized successfully");
} catch (err) {
  console.error("Error initializing Oracle Instant Client:", err);
  process.exit(1);
}

// Initialize database connection pool
async function initializeDb() {
  try {
    await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTSTRING,
      poolMax: 10,
      poolMin: 2,
      poolIncrement: 2,
      poolTimeout: 60,
    });
    console.log("Oracle connection pool initialized successfully");
  } catch (err) {
    console.error("Failed to create connection pool:", err);
    process.exit(1);
  }
}

// Helper function to execute database queries
async function executeQuery(query, params = [], options = {}) {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(query, params, options);
    return result;
  } catch (err) {
    console.error("Database query error:", err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Routes

// Members
app.get("/members", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT e.SSN, e.FNAME, e.LNAME, e.EMAIL, d.Dname, p.Pname, s.STATUSEMPNAME, e.DNO, e.PNO, e.STUEMP
       FROM EMPLOYEEMN e
       JOIN DEPARTMENTMN d ON e.DNO = d.Dnumber
       JOIN POSITIONMN p ON e.PNO = p.Pnumber
       JOIN STATUSEMP s ON e.STUEMP = s.STATUSEMPID`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching members", details: err.message });
  }
});

app.get("/departments", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT DNUMBER, DNAME FROM DEPARTMENTMN`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching departments", details: err.message });
  }
});

app.get("/positions", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT PNUMBER, PNAME FROM POSITIONMN`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching positions", details: err.message });
  }
});

app.get("/statusemps", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT STATUSEMPID, STATUSEMPNAME FROM STATUSEMP`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching statusemps", details: err.message });
  }
});

app.post("/addmembers", async (req, res) => {
  const { SSN, FNAME, LNAME, EMAIL, DNO, PNO, STUEMP, PW } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(PW, 10);
    await executeQuery(
      `INSERT INTO EMPLOYEEMN (SSN, FNAME, LNAME, EMAIL, DNO, PNO, STUEMP, PW)
       VALUES (:1, :2, :3, :4, :5, :6, :7, :8)`,
      [SSN, FNAME, LNAME, EMAIL, DNO, PNO, STUEMP, hashedPassword],
      { autoCommit: true }
    );
    res.status(201).json({ message: "Member added successfully", SSN: SSN });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error adding member", details: err.message });
  }
});

app.put("/updatemembers/:id", async (req, res) => {
  const { id } = req.params;
  const { FNAME, LNAME, EMAIL, DNO, PNO, STUEMP, PW } = req.body;
  try {
    let updateQuery = `UPDATE EMPLOYEEMN SET FNAME = :1, LNAME = :2, EMAIL = :3, DNO = :4, PNO = :5, STUEMP = :6`;
    let params = [FNAME, LNAME, EMAIL, DNO, PNO, STUEMP];

    if (PW && PW.trim() !== "") {
      const hashedPassword = await bcrypt.hash(PW, 10);
      updateQuery += `, PW = :7`;
      params.push(hashedPassword);
    }

    updateQuery += ` WHERE SSN = :${params.length + 1}`;
    params.push(id);

    const result = await executeQuery(updateQuery, params, {
      autoCommit: true,
    });

    if (result.rowsAffected && result.rowsAffected > 0) {
      // Fetch the updated member data
      const updatedMember = await executeQuery(
        `SELECT e.SSN, e.FNAME, e.LNAME, e.EMAIL, d.Dname, p.Pname, s.STATUSEMPNAME, e.DNO, e.PNO, e.STUEMP
         FROM EMPLOYEEMN e
         JOIN DEPARTMENTMN d ON e.DNO = d.Dnumber
         JOIN POSITIONMN p ON e.PNO = p.Pnumber
         JOIN STATUSEMP s ON e.STUEMP = s.STATUSEMPID
         WHERE e.SSN = :1`,
        [id],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      res.json({
        message: "Member updated successfully",
        updatedMember: updatedMember.rows[0],
      });
    } else {
      res.status(404).json({ error: "Member not found or no changes made" });
    }
  } catch (err) {
    console.error("Error updating member:", err);
    res
      .status(500)
      .json({ error: "Error updating member", details: err.message });
  }
});

app.delete("/deletemembers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await executeQuery("DELETE FROM EMPLOYEEMN WHERE SSN = :1", [id], {
      autoCommit: true,
    });
    res.json({ message: "Member deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error deleting member", details: err.message });
  }
});

// Rooms
app.get("/room", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT c.CFRNUMBER, c.CFRNAME, b.BDNAME, f.FLNAME, r.RTNAME, s.STATUSROOMNAME, c.CAPACITY, c.BDNUM, c.FLNUM, c.RTNUM, c.STUROOM
       FROM CONFERENCEROOM c
       JOIN ROOMTYPE r ON c.RTNUM = r.Rtnumber
       JOIN FLOOR f ON c.FLNUM = f.Flnumber
       JOIN BUILDING b ON c.BDNUM = b.Bdnumber
       JOIN STATUSROOM s ON c.STUROOM = s.STATUSROOMID`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching rooms", details: err.message });
  }
});

app.get("/buildings", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT BDNUMBER, BDNAME FROM BUILDING`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching buildings", details: err.message });
  }
});

app.get("/floors", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT FLNUMBER, FLNAME FROM FLOOR`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching floors", details: err.message });
  }
});

app.get("/roomtypes", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT RTNUMBER, RTNAME FROM ROOMTYPE`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching roomtypes", details: err.message });
  }
});

app.get("/statusrooms", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT STATUSROOMID, STATUSROOMNAME FROM STATUSROOM`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching statusrooms", details: err.message });
  }
});

app.post("/addroom", async (req, res) => {
  const { CFRNUMBER, CFRNAME, BDNUM, FLNUM, RTNUM, STUROOM, CAPACITY } =
    req.body;
  try {
    await executeQuery(
      `INSERT INTO CONFERENCEROOM (CFRNUMBER, CFRNAME, BDNUM, FLNUM, RTNUM, STUROOM, CAPACITY)
       VALUES (:1, :2, :3, :4, :5, :6, :7)`,
      [CFRNUMBER, CFRNAME, BDNUM, FLNUM, RTNUM, STUROOM, CAPACITY],
      { autoCommit: true }
    );
    res.status(201).json({ message: "Room added successfully", CFRNUMBER });
  } catch (err) {
    res.status(500).json({ error: "Error adding room", details: err.message });
  }
});

app.put("/updateroom/:id", async (req, res) => {
  const { id } = req.params;
  const { CFRNAME, BDNUM, FLNUM, RTNUM, STUROOM, CAPACITY } = req.body;
  try {
    await executeQuery(
      `UPDATE CONFERENCEROOM SET CFRNAME = :1, BDNUM = :2, FLNUM = :3, RTNUM = :4, STUROOM = :5, CAPACITY = :6 WHERE CFRNUMBER = :7`,
      [CFRNAME, BDNUM, FLNUM, RTNUM, STUROOM, CAPACITY, id],
      { autoCommit: true }
    );
    res.json({ message: "Room updated successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error updating room", details: err.message });
  }
});

app.delete("/deleteroom/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await executeQuery(
      "DELETE FROM CONFERENCEROOM WHERE CFRNUMBER = :1",
      [id],
      {
        autoCommit: true,
      }
    );
    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error deleting room", details: err.message });
  }
});

// Email sending route
app.post("/send-email", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!validator.validate(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    let info = await transporter.sendMail({
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: "mindenrymmd@gmail.com",
      subject: subject,
      text: `From: ${name} (${email})\n\nMessage: ${message}`,
      html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Message:</strong> ${message}</p>`,
    });

    console.log("Message sent: %s", info.messageId);
    res
      .status(200)
      .json({ message: "Email sent successfully", messageId: info.messageId });
  } catch (error) {
    console.error("Error sending email:", error);
    console.log(
      `Failed to send email to support@mutreserve.com. Error: ${error.message}`
    );
    res
      .status(200)
      .json({ message: "Email processed", note: "Delivery status unknown" });
  }
});

// Start server
initializeDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
  });
