const express = require("express");
const oracledb = require("oracledb");
const dotenv = require("dotenv");
const cors = require("cors");
const nodemailer = require("nodemailer");
const validator = require("email-validator");
const bcrypt = require("bcrypt");
const QRCode = require("qrcode");
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
// Members Routes
app.get("/members", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT e.SSN, e.FNAME, e.LNAME, e.EMAIL, d.Dname, p.Pname, s.STATUSEMPNAME, e.DNO, e.PNO, e.STUEMP
       FROM EMPLOYEE e
       JOIN DEPARTMENT d ON e.DNO = d.Dnumber
       JOIN POSITION p ON e.PNO = p.Pnumber
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
// Department Routes
app.get("/departments", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT DNUMBER, DNAME FROM DEPARTMENT`,
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
// Position Routes
app.get("/positions", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT PNUMBER, PNAME FROM POSITION`,
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
// Status Employee Routes
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
// Add Member Route
app.post("/addmembers", async (req, res) => {
  const { SSN, FNAME, LNAME, EMAIL, DNO, PNO, STUEMP, PW } = req.body;
  try {
    await executeQuery(
      `INSERT INTO EMPLOYEE (SSN, FNAME, LNAME, EMAIL, DNO, PNO, STUEMP, PW)
       VALUES (:1, :2, :3, :4, :5, :6, :7, :8)`,
      [SSN, FNAME, LNAME, EMAIL, DNO, PNO, STUEMP, PW], // Store password directly
      { autoCommit: true }
    );
    res.status(201).json({ message: "Member added successfully", SSN: SSN });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error adding member", details: err.message });
  }
});
// Update Member Route
app.put("/updatemembers/:id", async (req, res) => {
  const { id } = req.params;
  const { FNAME, LNAME, EMAIL, DNO, PNO, STUEMP, PW } = req.body;
  try {
    let updateQuery = `UPDATE EMPLOYEE SET FNAME = :1, LNAME = :2, EMAIL = :3, DNO = :4, PNO = :5, STUEMP = :6`;
    let params = [FNAME, LNAME, EMAIL, DNO, PNO, STUEMP];
    if (PW && PW.trim() !== "") {
      updateQuery += `, PW = :7`;
      params.push(PW); // Store password directly
    }
    updateQuery += ` WHERE SSN = :${params.length + 1}`;
    params.push(id);
    const result = await executeQuery(updateQuery, params, {
      autoCommit: true,
    });
    if (result.rowsAffected && result.rowsAffected > 0) {
      const updatedMember = await executeQuery(
        `SELECT e.SSN, e.FNAME, e.LNAME, e.EMAIL, d.Dname, p.Pname, s.STATUSEMPNAME, e.DNO, e.PNO, e.STUEMP
         FROM EMPLOYEE e
         JOIN DEPARTMENT d ON e.DNO = d.Dnumber
         JOIN POSITION p ON e.PNO = p.Pnumber
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
// Delete Member Route
app.delete("/deletemembers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await executeQuery("DELETE FROM EMPLOYEE WHERE SSN = :1", [id], {
      autoCommit: true,
    });
    res.json({ message: "Member deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error deleting member", details: err.message });
  }
});
// Room Routes
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

app.get("/rooms", async (req, res) => {
  const { buildingId, floorId, participants } = req.query;
  try {
    let query = `
      SELECT c.CFRNUMBER, c.CFRNAME, b.BDNAME, f.FLNAME, r.RTNAME, 
             s.STATUSROOMNAME, c.CAPACITY, c.BDNUM, c.FLNUM, c.RTNUM, c.STUROOM
      FROM CONFERENCEROOM c
      JOIN ROOMTYPE r ON c.RTNUM = r.Rtnumber
      JOIN FLOOR f ON c.FLNUM = f.Flnumber
      JOIN BUILDING b ON c.BDNUM = b.Bdnumber
      JOIN STATUSROOM s ON c.STUROOM = s.STATUSROOMID
      WHERE 1=1
      AND c.STUROOM = 1 
    `;

    const params = [];

    // Always filter by capacity if participants is provided
    if (participants) {
      query += ` AND c.CAPACITY >= :participants`;
      params.push(participants);
    }

    if (buildingId) {
      query += ` AND c.BDNUM = :buildingId`;
      params.push(buildingId);
    }

    if (floorId) {
      query += ` AND c.FLNUM = :floorId`;
      params.push(floorId);
    }

    const result = await executeQuery(query, params, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({
      error: "Error fetching rooms",
      details: err.message,
    });
  }
});

// Building Routes
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
// Floor Routes
app.get("/floors", async (req, res) => {
  const { buildingId } = req.query;
  try {
    let query = `SELECT FLNUMBER, FLNAME FROM FLOOR`;
    let params = [];
    if (buildingId) {
      query = `SELECT DISTINCT f.FLNUMBER, f.FLNAME
               FROM FLOOR f
               JOIN CONFERENCEROOM c ON f.FLNUMBER = c.FLNUM
               WHERE c.BDNUM = :buildingId
               ORDER BY f.FLNUMBER`;
      params = [buildingId];
    }
    const result = await executeQuery(query, params, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching floors", details: err.message });
  }
});
// Room Type Routes
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
// Status Room Routes
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
// Add Room Route
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
// Update Room Route
app.put("/updateroom/:id", async (req, res) => {
  const { id } = req.params;
  const { CFRNAME, BDNUM, FLNUM, RTNUM, STUROOM, CAPACITY } = req.body;
  try {
    await executeQuery(
      `UPDATE CONFERENCEROOM SET CFRNAME = :1, BDNUM = :2, FLNUM = :3, RTNUM = :4, STUROOM = :5, CAPACITY = :6 
       WHERE CFRNUMBER = :7`,
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
// Delete Room Route
app.delete("/deleteroom/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await executeQuery(
      "DELETE FROM CONFERENCEROOM WHERE CFRNUMBER = :1",
      [id],
      { autoCommit: true }
    );
    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error deleting room", details: err.message });
  }
});
// Booking Routes
app.get("/user-bookings/:ssn", async (req, res) => {
  const { ssn } = req.params;
  try {
    const result = await executeQuery(
      `SELECT r.RESERVERID, r.BDATE, r.STARTTIME, r.ENDTIME, r.STUBOOKING, r.CFRNUM, r.QR
       FROM RESERVE r
       WHERE r.ESSN = :ssn
       ORDER BY r.BDATE DESC, r.STARTTIME DESC`,
      [ssn],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res
      .status(500)
      .json({ error: "Error fetching user bookings", details: err.message });
  }
});
// Book Room Route
app.post("/book-room", async (req, res) => {
  const { date, startTime, endTime, room, essn } = req.body;
  try {
    const qrCode = `QR${Date.now()}`;
    const result = await executeQuery(
      `INSERT INTO RESERVE (RESERVERID, BDATE, STARTTIME, ENDTIME, CFRNUM, STUBOOKING, ESSN, QR)
       VALUES (RESERVERID_SEQ.NEXTVAL, TO_DATE(:1, 'YYYY-MM-DD'), 
                TO_TIMESTAMP(:2, 'YYYY-MM-DD HH24:MI:SS'), 
                TO_TIMESTAMP(:3, 'YYYY-MM-DD HH24:MI:SS'), 
                :4, 1, :5, :6)
       RETURNING RESERVERID INTO :reserverId`,
      [
        date,
        `${date} ${startTime}`,
        `${date} ${endTime}`,
        room,
        essn,
        qrCode,
        { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      ],
      { autoCommit: true }
    );
    const reserverId = result.outBinds[0][0];
    const bookingResult = await executeQuery(
      `SELECT RESERVERID, BDATE, STARTTIME, ENDTIME, CFRNUM, STUBOOKING, ESSN, QR
       FROM RESERVE WHERE RESERVERID = :1`,
      [reserverId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.status(201).json(bookingResult.rows[0]);
  } catch (err) {
    console.error("Error creating booking:", err);
    res
      .status(500)
      .json({ error: "Error creating booking", details: err.message });
  }
});
// Cancel Booking Route
app.post("/cancel-booking", async (req, res) => {
  const { reserverId, essn } = req.body;
  try {
    const checkResult = await executeQuery(
      `SELECT RESERVERID FROM RESERVE WHERE RESERVERID = :1 AND ESSN = :2`,
      [reserverId, essn],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (checkResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Booking not found or not authorized" });
    }
    await executeQuery(
      `UPDATE RESERVE SET STUBOOKING = 3 WHERE RESERVERID = :1`,
      [reserverId],
      { autoCommit: true }
    );
    await executeQuery(
      `INSERT INTO CANCLEROOM (REASON, RESID, EMPID)
       VALUES ('User cancelled', :1, :2)`,
      [reserverId, essn],
      { autoCommit: true }
    );
    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error("Error cancelling booking:", err);
    res
      .status(500)
      .json({ error: "Error cancelling booking", details: err.message });
  }
});
// Menu Routes
app.get("/menus", async (req, res) => {
  try {
    const result = await executeQuery(`SELECT mnumber, mname FROM menu`, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching menus", details: err.message });
  }
});
// Access Menu Routes
app.get("/accessmenus", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT a.no, p.Pname, m.mname, a.Pnum, a.Mnum
       FROM accessmenu a
       JOIN POSITION p ON a.Pnum = p.Pnumber
       JOIN menu m ON a.Mnum = m.Mnumber`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching access menus", details: err.message });
  }
});
app.post("/accessmenus", async (req, res) => {
  const { PNUM, MNUM } = req.body;
  try {
    const maxNoResult = await executeQuery(
      "SELECT MAX(NO) as MAX_NO FROM accessmenu",
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const maxNo = maxNoResult.rows[0].MAX_NO || 0;
    const newNo = maxNo + 1;
    await executeQuery(
      `INSERT INTO accessmenu (NO, Pnum, Mnum) VALUES (:1, :2, :3)`,
      [newNo, PNUM, MNUM],
      { autoCommit: true }
    );
    res
      .status(201)
      .json({ message: "Access menu added successfully", NO: newNo });
  } catch (error) {
    console.error("Error adding access menu:", error);
    res
      .status(500)
      .json({ error: "Error adding access menu", details: error.message });
  }
});
app.put("/accessmenus/:id", async (req, res) => {
  const { id } = req.params;
  const { Pnum, Mnum } = req.body;
  try {
    await executeQuery(
      `UPDATE accessmenu SET Pnum = :1, Mnum = :2 WHERE no = :3`,
      [Pnum, Mnum, id],
      { autoCommit: true }
    );
    res.json({ message: "Access menu updated successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error updating access menu", details: err.message });
  }
});
app.delete("/accessmenus/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await executeQuery(`DELETE FROM accessmenu WHERE no = :1`, [id], {
      autoCommit: true,
    });
    res.json({ message: "Access menu deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error deleting access menu", details: err.message });
  }
});
// Email Route
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
    res
      .status(500)
      .json({ error: "Error sending email", details: error.message });
  }
});
// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await executeQuery(
      `SELECT e.SSN, e.EMAIL, e.PW, e.FNAME, e.LNAME, e.DNO, e.PNO, e.STUEMP,
              p.PNAME as POSITION, d.DNAME as DEPARTMENT
       FROM EMPLOYEE e
       JOIN POSITION p ON e.PNO = p.PNUMBER
       JOIN DEPARTMENT d ON e.DNO = d.DNUMBER
       WHERE e.EMAIL = :1`,
      [email],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }
    const user = result.rows[0];

    // Direct password comparison
    if (password === user.PW) {
      delete user.PW;
      return res.json({
        success: true,
        user: {
          ssn: user.SSN,
          email: user.EMAIL,
          firstName: user.FNAME,
          lastName: user.LNAME,
          position: user.POSITION,
          department: user.DEPARTMENT,
          departmentNo: user.DNO,
          positionNo: user.PNO,
          status: user.STUEMP,
        },
      });
    } else {
      return res.status(401).json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .json({ error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ", details: err.message });
  }
});
app.get("/history", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT RESERVERID,CFRNUM ,BDATE, STARTTIME, ENDTIME, STUBOOKING, QR
       FROM RESERVE`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching history", details: err.message });
  }
});
// Initialize server
initializeDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
  });
