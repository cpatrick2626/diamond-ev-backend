const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

// ================= DATABASE =================
const db = new sqlite3.Database("./db.sqlite");

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

// ROOT (THIS FIXES YOUR ISSUE)
app.get("/", (req, res) => {
  res.send("Diamond EV Backend Running");
});

// GET ALL BETS
app.get("/bets", (req, res) => {
  db.all("SELECT * FROM bets", [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }
    res.json(rows);
  });
});

// SAVE BET
app.post("/bet", (req, res) => {
  const { player, odds, ev, prob, edge } = req.body;

  if (!player) {
    return res.status(400).send("Missing player");
  }

  db.run(
    `INSERT INTO bets (player, odds_taken, ev, prob, edge)
     VALUES (?, ?, ?, ?, ?)`,
    [player, odds, ev, prob, edge],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).send("Insert error");
      }

      res.json({ success: true, id: this.lastID });
    }
  );
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
