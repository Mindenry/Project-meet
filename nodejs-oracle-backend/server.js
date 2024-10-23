const express = require("express");
const oracledb = require("oracledb");
const dotenv = require("dotenv");
const cors = require("cors");
const nodemailer = require("nodemailer");
const validator = require("email-validator");
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

// Routes

// Members
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
      `INSERT INTO EMPLOYEE (SSN, FNAME, LNAME, EMAIL, DNO, PNO, STUEMP, PW)
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
    let updateQuery = `UPDATE EMPLOYEE SET FNAME = :1, LNAME = :2, EMAIL = :3, DNO = :4, PNO = :5, STUEMP = :6`;
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

// app.delete("/deletemembers/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     await executeQuery("DELETE FROM EMPLOYEE WHERE SSN = :1", [id], {
//       autoCommit: true,
//     });
//     res.json({ message: "Member deleted successfully" });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ error: "Error deleting member", details: err.message });
//   }
// });

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
  const { buildingId } = req.query;
  try {
    const result = await executeQuery(
      `SELECT DISTINCT f.FLNUMBER, f.FLNAME
       FROM FLOOR f
       JOIN CONFERENCEROOM c ON f.FLNUMBER = c.FLNUM
       WHERE c.BDNUM = :buildingId
       ORDER BY f.FLNUMBER`,
      [buildingId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching floors", details: err.message });
  }
});

app.get("/rooms", async (req, res) => {
  const { buildingId, floorId, participants } = req.query;
  try {
    const result = await executeQuery(
      `SELECT c.CFRNUMBER, c.CFRNAME, c.CAPACITY
       FROM CONFERENCEROOM c
       WHERE c.BDNUM = :buildingId
       AND c.FLNUM = :floorId
       AND c.CAPACITY >= :participants
       ORDER BY c.CFRNAME`,
      [buildingId, floorId, participants],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching rooms", details: err.message });
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
  const { CFRNUMBER, CFRNAME, BDNUM, FLNUM, RTNUM, STUROOM, CAPACITY } = req.body;
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

app.get("/login", async (req, res) => {
  try {
    const result = await executeQuery(`SELECT email, pw FROM employee`, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching login", details: err.message });
  }
});

// Booking route
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

// Update the book-room endpoint
app.post("/book-room", async (req, res) => {
  const { date, startTime, endTime, room, essn } = req.body;

  try {
    const qrCode = `QR${Date.now()}`;

    const result = await executeQuery(
      `INSERT INTO RESERVE (RESERVERID, BDATE, STARTTIME, ENDTIME, CFRNUM, STUBOOKING, ESSN, QR)
       VALUES (RESERVERID_SEQ.NEXTVAL, TO_DATE(:1, 'YYYY-MM-DD'), TO_TIMESTAMP(:2, 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP(:3, 'YYYY-MM-DD HH24:MI:SS'), :4, 1, :5, :6)
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
      {
        autoCommit: true,
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );

    console.log(result);

    const reserverId = result.outBinds[0][0];

    if (!reserverId) {
      return res.status(500).json({ error: "Failed to retrieve RESERVERID" });
    }

    const bookingResult = await executeQuery(
      `SELECT RESERVERID, BDATE, STARTTIME, ENDTIME, CFRNUM, STUBOOKING, ESSN, QR
       FROM RESERVE
       WHERE RESERVERID = :reserverId`,
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

// New endpoint for cancelling a booking
app.post("/cancel-booking", async (req, res) => {
  const { reserverId, essn } = req.body;
  try {
    // First, check if the booking exists and belongs to the user
    const checkResult = await executeQuery(
      `SELECT RESERVERID FROM RESERVE WHERE RESERVERID = :reserverId AND ESSN = :essn`,
      [reserverId, essn],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (checkResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Booking not found or not authorized" });
    }

    // If the booking exists and belongs to the user, proceed with cancellation
    await executeQuery(
      `UPDATE RESERVE SET STUBOOKING = 3 WHERE RESERVERID = :reserverId`,
      [reserverId],
      { autoCommit: true }
    );

    // Insert a record into the CANCLEROOM table
    await executeQuery(
      `INSERT INTO CANCLEROOM (REASON, RESID, EMPID)
       VALUES ('User cancelled', :reserverId, :essn)`,
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

app.get("/accessmenus", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT a.no, p.Pnumber, p.Pname, m.Mnumber, m.Mname
       FROM accessmenu a
       JOIN POSITION p ON a.Pnum = p.Pnumber
       JOIN menu m ON a.Mnum = m.Mnumber`,
      [],
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
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

  if (!PNUM || !MNUM) {
    return res.status(400).json({ error: "PNUM and MNUM are required." });
  }

  try {
    // หาค่า NO ที่มากที่สุดในตาราง
    const maxNoResult = await executeQuery(
      "SELECT MAX(NO) as MAX_NO FROM accessmenu",
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    const maxNo = maxNoResult.rows[0].MAX_NO || 0;
    const newNo = maxNo + 1;

    // เพิ่มข้อมูลใหม่โดยใช้ค่า NO ที่คำนวณได้
    await executeQuery(
      `INSERT INTO accessmenu (NO, Pnum, Mnum) VALUES (:NO, :PNUM, :MNUM)`,
      { NO: newNo, PNUM: PNUM, MNUM: MNUM },
      { autoCommit: true }
    );
    
    res.status(201).json({ message: "Access menu added successfully", NO: newNo });
  } catch (error) {
    console.error("Error adding access menu:", error);
    return res
      .status(500)
      .json({ error: "Error adding access menu", details: error.message });
  }
});

app.put("/accessmenus/:id", async (req, res) => {
  const { id } = req.params;
  const { PNUM, MNUM } = req.body;
  try {
    await executeQuery(
      `UPDATE accessmenu SET Pnum = :PNUM, Mnum = :MNUM WHERE no = :id`,
      [PNUM, MNUM, id],
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
    await executeQuery(`DELETE FROM accessmenu WHERE no = :id`, [id], {
      autoCommit: true,
    });
    res.json({ message: "Access menu deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error deleting access menu", details: err.message });
  }
});

app.get("/history", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT RESERVERID, CFRNUM, BDATE, STARTTIME, ENDTIME, STUBOOKING, QR 
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


app.delete("/cancel/:reserverId/:cfrNum", async (req, res) => {
  const { reserverId, cfrNum } = req.params;

  try {
    const result = await executeQuery(
      `UPDATE RESERVE 
       SET STUBOOKING = 'CANCELLED' 
       WHERE RESERVERID = :reserverId 
       AND CFRNUM = :cfrNum`,
      [reserverId, cfrNum]
    );

    if (result.rowsAffected === 0) {
      res.status(404).json({ error: "Booking not found" });
    } else {
      res.json({ message: "Booking cancelled successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error cancelling booking", details: err.message });
  }
});



initializeDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
  });