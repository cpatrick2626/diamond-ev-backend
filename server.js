const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();

// ================= MIDDLEWARE =================
app.use(cors({
  origin: "*"
}));
app.use(express.json());

// ================= DATABASE =================
const db = new sqlite3.Database("./db.sqlite", (err) => {
  if (err) {
    console.error("DB connection error:", err);
  } else {
    console.log("Connected to SQLite database");
  }
});

// Create table if not exists
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

// ================= ROUTES =================

// ROOT (fixes your Not Found issue)
app.get("/", (req, res) => {
  res.send("Diamond EV Backend Running");
});

// HEALTH CHECK (useful for debugging)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// GET ALL BETS
app.get("/bets", (req, res) => {
  db.all("SELECT * FROM bets ORDER BY created_at DESC", [], (err, rows) => {
    if (err) {
      console.error("Fetch error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
});

// SAVE BET
app.post("/bet", (req, res) => {
  const { player, odds, ev, prob, edge } = req.body;

  // basic validation
  if (!player || odds === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.run(
    `INSERT INTO bets (player, odds_taken, ev, prob, edge)
     VALUES (?, ?, ?, ?, ?)`,
    [player, odds, ev, prob, edge],
    function (err) {
      if (err) {
        console.error("Insert error:", err);
        return res.status(500).json({ error: "Insert failed" });
      }

      res.json({
        success: true,
        id: this.lastID
      });
    }
  );
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});