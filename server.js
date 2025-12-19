require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const jsonServer = require('json-server');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files from root

// MySQL Connection Pool
// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false }, // Required for Aiven/Cloud DBs
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Auth Routes

// POST /login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length > 0) {
      const user = rows[0];
      // In production, NEVER return password
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /signup
app.post('/signup', async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check availability
    const [existing] = await pool.query('SELECT username FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const userRole = role === 'admin' ? 'admin' : 'user';

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, password, userRole]
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully"
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// JSON Server for Animal Data (Mount at /data to avoid conflicts, or root if needed)
// To keep existing frontend logic (which expects /data endpoint), we mount the router directly.
// But we also need static file serving if users open localhost:3000 (optional).

const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

app.use(middlewares); // Logger, static, cors, no-cache
app.use(router); // Everything else goes to json-server (GET /data, GET /data/:id etc)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`MySQL Auth available at /login & /signup`);
  console.log(`Animal Data API available via json-server`);
});
