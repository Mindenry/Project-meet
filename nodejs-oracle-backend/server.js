// function hashPassword(password) {
//   return crypto
//     .createHash("sha256")
//     .update(password)
//     .digest("hex")
//     .substring(0, 20);
// } function แปลงรหัส ในฐานข้อมูลจะไม่แสดงรหัส โดยตรง เน้นความปลอดภัย

const express = require("express");
const oracledb = require("oracledb");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const instantClientPath = process.env.ORACLE_CLIENT_PATH;

if (!instantClientPath) {
  console.error("ORACLE_CLIENT_PATH is not set in .env file");
  process.exit(1);
}

try {
  oracledb.initOracleClient({ libDir: instantClientPath });
  console.log("Oracle Instant Client initialized successfully");
} catch (err) {
  console.error("Error initializing Oracle Instant Client:", err);
  process.exit(1);
}

async function initialize() {
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

app.get("/members", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `SELECT e.SSN, e.FNAME, e.LNAME, e.EMAIL, d.Dname, p.Pname, e.DNO, e.PNO
       FROM EMPLOYEEMN e
       JOIN DEPARTMENTMN d ON e.DNO = d.Dnumber
       JOIN POSITIONMN p ON e.PNO = p.Pnumber`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching members:", err);
    res.status(500).json({
      error: "An error occurred while fetching members",
      details: err.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

app.post("/addmembers", async (req, res) => {
  const { SSN, FNAME, LNAME, EMAIL, DNO, PNO, pw } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `INSERT INTO EMPLOYEEMN (SSN, FNAME, LNAME, EMAIL, DNO, PNO, pw) 
       VALUES (:1, :2, :3, :4, :5, :6, :7)`,
      [SSN, FNAME, LNAME, EMAIL, DNO, PNO, pw],
      { autoCommit: true }
    );
    res.status(201).json({ message: "Member added successfully", SSN: SSN });
  } catch (err) {
    console.error("Error adding member:", err);
    res.status(500).json({
      error: "An error occurred while adding the member",
      details: err.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

app.put("/updatemembers/:id", async (req, res) => {
  const { id } = req.params;
  const { FNAME, LNAME, EMAIL, DNO, PNO, pw } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection();
    let updateQuery = `UPDATE EMPLOYEEMN SET FNAME = :1, LNAME = :2, EMAIL = :3, DNO = :4, PNO = :5`;
    let params = [FNAME, LNAME, EMAIL, DNO, PNO];

    if (pw) {
      updateQuery += `, pw = :6`;
      params.push(pw);
    }

    updateQuery += ` WHERE SSN = :${params.length + 1}`;
    params.push(id);

    await connection.execute(updateQuery, params, { autoCommit: true });
    res.json({ message: "Member updated successfully" });
  } catch (err) {
    console.error("Error updating member:", err);
    res.status(500).json({
      error: "An error occurred while updating the member",
      details: err.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

app.delete("/deletemembers/:id", async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();
    await connection.execute("DELETE FROM EMPLOYEEMN WHERE SSN = :1", [id], {
      autoCommit: true,
    });
    res.json({ message: "Member deleted successfully" });
  } catch (err) {
    console.error("Error deleting member:", err);
    res.status(500).json({
      error: "An error occurred while deleting the member",
      details: err.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
});

initialize()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
  });
