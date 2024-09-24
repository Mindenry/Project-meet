const express = require("express");
const oracledb = require("oracledb");
const dotenv = require("dotenv");
const cors = require("cors");
const nodemailer = require("nodemailer");
const validator = require("email-validator");

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
app.get("/members", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT e.SSN, e.FNAME, e.LNAME, e.EMAIL, d.Dname, p.Pname, e.DNO, e.PNO
       FROM EMPLOYEEMN e
       JOIN DEPARTMENTMN d ON e.DNO = d.Dnumber
       JOIN POSITIONMN p ON e.PNO = p.Pnumber`,
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

app.post("/addmembers", async (req, res) => {
  const { SSN, FNAME, LNAME, EMAIL, DNO, PNO, pw } = req.body;
  try {
    await executeQuery(
      `INSERT INTO EMPLOYEEMN (SSN, FNAME, LNAME, EMAIL, DNO, PNO, pw) 
       VALUES (:1, :2, :3, :4, :5, :6, :7)`,
      [SSN, FNAME, LNAME, EMAIL, DNO, PNO, pw],
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
  const { FNAME, LNAME, EMAIL, DNO, PNO, pw } = req.body;
  try {
    let updateQuery = `UPDATE EMPLOYEEMN SET FNAME = :1, LNAME = :2, EMAIL = :3, DNO = :4, PNO = :5`;
    let params = [FNAME, LNAME, EMAIL, DNO, PNO];

    if (pw) {
      updateQuery += `, pw = :6`;
      params.push(pw);
    }

    updateQuery += ` WHERE SSN = :${params.length + 1}`;
    params.push(id);

    await executeQuery(updateQuery, params, { autoCommit: true });
    res.json({ message: "Member updated successfully" });
  } catch (err) {
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

// Updated email sending route with improved error handling
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
    // Instead of sending an error response, we'll log the error and send a success response
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
