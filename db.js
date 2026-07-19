const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'garden.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    init();
  }
  return db;
}

function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS angels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL COLLATE NOCASE,
      display_name TEXT,
      ascensions INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS guestbook (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pseudo TEXT NOT NULL,
      stars INTEGER NOT NULL CHECK(stars >= 1 AND stars <= 5),
      message TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

function getAllAngels() {
  return getDb().prepare('SELECT name, display_name, ascensions, created_at, updated_at FROM angels ORDER BY ascensions DESC').all();
}

function getAngel(name) {
  return getDb().prepare('SELECT name, display_name, ascensions, created_at, updated_at FROM angels WHERE name = ?').get(name);
}

function upsertAngel(name) {
  const existing = getAngel(name);
  if (existing) {
    getDb().prepare('UPDATE angels SET ascensions = ascensions + 1, updated_at = datetime(\'now\') WHERE name = ?').run(name);
    return getAngel(name);
  } else {
    getDb().prepare('INSERT INTO angels (name, display_name, ascensions) VALUES (?, ?, 1)').run(name, name);
    return getAngel(name);
  }
}

function addGuestbookEntry(pseudo, stars, message) {
  getDb().prepare('INSERT INTO guestbook (pseudo, stars, message) VALUES (?, ?, ?)').run(pseudo, stars, message);
  return getDb().prepare('SELECT * FROM guestbook WHERE id = last_insert_rowid()').get();
}

function getGuestbookEntries() {
  return getDb().prepare('SELECT pseudo, stars, message, created_at FROM guestbook ORDER BY created_at DESC').all();
}

function seedOriginalAngels() {
  const originalAngels = [
    ['sonic', 26811468], ['0b4m4', 21229746], ['birdo', 545373],
    ['trump', 542597], ['fluri', 512730], ['cybgd', 69995],
    ['you', 22352], ['gonna', 22180], ['never', 21906],
    ['give', 21830], ['up', 21823], ['goate', 12497],
    ['over', 9005], ['niv', 9002], ['ajf', 9001],
    ['denis', 6972], ['dave', 2028], ['4t2', 1341],
    ['sanic', 1189], ['pulse', 1115],
  ];
  const insert = getDb().prepare('INSERT OR IGNORE INTO angels (name, display_name, ascensions) VALUES (?, ?, ?)');
  const tx = getDb().transaction((angels) => {
    for (const [name, ascensions] of angels) {
      insert.run(name, name, ascensions);
    }
  });
  tx(originalAngels);
  console.log(`Seeded ${originalAngels.length} original angels`);
}

module.exports = { getDb, getAllAngels, getAngel, upsertAngel, seedOriginalAngels, addGuestbookEntry, getGuestbookEntries };
