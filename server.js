const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

// Create database
const db = new sqlite3.Database("./db.sqlite");

// Create table
db.run(`
CREATE TABLE IF NOT EXISTS bets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player TEXT,
  odds_taken REAL,
  result TEXT,
  ev REAL,
  prob REAL,
  edge REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

// Test route
app.get("/", (req, res) => {
  res.send("Diamond EV Backend Running");
});

// Get bets
app.get("/bets", (req, res) => {
  db.all(`SELECT * FROM bets`, [], (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

// Save bet
app.post("/bet", (req, res) => {
  const { player, odds, ev, prob, edge } = req.body;

  db.run(
    `INSERT INTO bets (player, odds_taken, ev, prob, edge)
     VALUES (?, ?, ?, ?, ?)`,
    [player, odds, ev, prob, edge],
    function (err) {
      if (err) return res.status(500).send(err);
      res.json({ success: true });
    }
  );
});

// PORT FIX FOR RENDER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});