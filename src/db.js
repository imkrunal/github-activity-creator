const sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database('db.sqlite')

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    time DATETIME,
    completed BOOLEAN DEFAULT 0
  );`)
})

module.exports = { db }
