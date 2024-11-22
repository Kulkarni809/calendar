const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 5000;
app.use(bodyParser.json());
app.use(cors());

//DB SETUP
//CREATE DATABASE calendar_app;
// CREATE TABLE events (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     title VARCHAR(255) NOT NULL,
//     start DATETIME NOT NULL,
//     end DATETIME NOT NULL,
//     all_day BOOLEAN DEFAULT FALSE
// );

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // MySQL username
  password: "", // MySQL password
  database: "calendar_app",
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to MySQL database.");
});

// Get All Events
app.get("/events", (req, res) => {
  const query = "SELECT * FROM events";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Create Event
app.post("/events", (req, res) => {
  const { title, start, end, all_day } = req.body;
  const query = "INSERT INTO events (title, start, end, all_day) VALUES (?, ?, ?, ?)";
  db.query(query, [title, start, end, all_day], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: results.insertId, title, start, end, all_day });
  });
});

// Update Event
app.put("/events/:id", (req, res) => {
  const { id } = req.params;
  const { title, start, end, all_day } = req.body;
  const query = "UPDATE events SET title = ?, start = ?, end = ?, all_day = ? WHERE id = ?";
  db.query(query, [title, start, end, all_day, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Event updated successfully." });
  });
});

// Delete Event
app.delete("/events/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM events WHERE id = ?";
  db.query(query, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Event deleted successfully." });
  });
});

// Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});