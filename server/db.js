/**
 * db.js — JSON File Database Layer
 * 
 * Provides a simple, thread-safe read/write interface to data/db.json.
 * Uses a write queue to prevent file corruption from concurrent writes.
 * Auto-increments IDs using persisted counters.
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

// Default schema for a fresh database
const DEFAULT_DB = {
  users: [],
  students: [],
  attendance: [],
  marks: [],
  subjects: [],
  counters: { users: 0, students: 0, attendance: 0, marks: 0, subjects: 0 }
};

// ── Write Queue ──────────────────────────────────────────────
// Serializes all writes to prevent data corruption
let writeQueue = Promise.resolve();

function enqueueWrite(fn) {
  writeQueue = writeQueue.then(fn).catch(err => {
    console.error('[DB] Write error:', err);
  });
  return writeQueue;
}

// ── Core Read/Write ──────────────────────────────────────────

/**
 * Read the entire database from disk.
 * Creates the file with default schema if it doesn't exist.
 */
function readDB() {
  try {
    // Ensure data directory exists
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create file if missing
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
      return JSON.parse(JSON.stringify(DEFAULT_DB));
    }

    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const data = JSON.parse(raw);

    // Ensure all expected keys exist (handles partial schema)
    for (const key of Object.keys(DEFAULT_DB)) {
      if (!(key in data)) {
        data[key] = DEFAULT_DB[key];
      }
    }
    if (!data.counters) data.counters = { ...DEFAULT_DB.counters };

    return data;
  } catch (err) {
    console.error('[DB] Read error, resetting to default:', err.message);
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }
}

/**
 * Write the entire database to disk (queued for safety).
 */
function writeDB(data) {
  return enqueueWrite(() => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  });
}

// ── CRUD Helpers ─────────────────────────────────────────────

/**
 * Get all records from a collection.
 * @param {string} collection - e.g. 'students', 'marks'
 * @returns {Array}
 */
function getAll(collection) {
  const db = readDB();
  return db[collection] || [];
}

/**
 * Get a single record by ID.
 * @param {string} collection
 * @param {number} id
 * @returns {Object|null}
 */
function getById(collection, id) {
  const db = readDB();
  return (db[collection] || []).find(item => item.id === Number(id)) || null;
}

/**
 * Insert a new record with auto-incremented ID.
 * @param {string} collection
 * @param {Object} record - Record data (without id)
 * @returns {Object} The inserted record with its new ID
 */
function insert(collection, record) {
  const db = readDB();
  if (!db[collection]) db[collection] = [];
  if (!db.counters[collection]) db.counters[collection] = 0;

  // Auto-increment
  db.counters[collection] += 1;
  const newRecord = { id: db.counters[collection], ...record };
  db[collection].push(newRecord);
  writeDB(db);
  return newRecord;
}

/**
 * Update a record by ID.
 * @param {string} collection
 * @param {number} id
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated record, or null if not found
 */
function update(collection, id, updates) {
  const db = readDB();
  const arr = db[collection] || [];
  const index = arr.findIndex(item => item.id === Number(id));
  if (index === -1) return null;

  // Merge updates, preserving ID
  db[collection][index] = { ...db[collection][index], ...updates, id: Number(id) };
  writeDB(db);
  return db[collection][index];
}

/**
 * Delete a record by ID.
 * @param {string} collection
 * @param {number} id
 * @returns {boolean} True if deleted, false if not found
 */
function remove(collection, id) {
  const db = readDB();
  const arr = db[collection] || [];
  const index = arr.findIndex(item => item.id === Number(id));
  if (index === -1) return false;

  db[collection].splice(index, 1);
  writeDB(db);
  return true;
}

/**
 * Find records matching a filter function.
 * @param {string} collection
 * @param {Function} filterFn
 * @returns {Array}
 */
function find(collection, filterFn) {
  const db = readDB();
  return (db[collection] || []).filter(filterFn);
}

module.exports = { readDB, writeDB, getAll, getById, insert, update, remove, find };
