/**
 * subjects.js — Subject CRUD Routes
 * 
 * Replaces: add_subject.php, view_subjects.php, edit_subject.php, delete_subject.php
 * 
 * Routes:
 *   GET    /api/subjects      — List all subjects
 *   GET    /api/subjects/:id  — Get a single subject
 *   POST   /api/subjects      — Add a subject
 *   PUT    /api/subjects/:id  — Update a subject
 *   DELETE /api/subjects/:id  — Delete a subject
 */

const express = require('express');
const db = require('../db');

const router = express.Router();

// ── List All Subjects ────────────────────────────────────────
router.get('/', (req, res) => {
  const subjects = db.getAll('subjects');
  return res.json({ success: true, data: subjects });
});

// ── Get Single Subject ───────────────────────────────────────
router.get('/:id', (req, res) => {
  const subject = db.getById('subjects', req.params.id);
  if (!subject) {
    return res.status(404).json({
      success: false,
      message: 'Subject not found.'
    });
  }
  return res.json({ success: true, data: subject });
});

// ── Add Subject ──────────────────────────────────────────────
router.post('/', (req, res) => {
  const { subject_name } = req.body;

  // Validate required fields
  if (!subject_name || subject_name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Subject name is required.'
    });
  }

  // Check for duplicate subject name
  const existing = db.find('subjects', s =>
    s.subject_name.toLowerCase() === subject_name.trim().toLowerCase()
  );
  if (existing.length > 0) {
    return res.status(409).json({
      success: false,
      message: 'A subject with this name already exists.'
    });
  }

  const subject = db.insert('subjects', {
    subject_name: subject_name.trim()
  });

  return res.status(201).json({
    success: true,
    message: 'Subject added successfully.',
    data: subject
  });
});

// ── Update Subject ───────────────────────────────────────────
router.put('/:id', (req, res) => {
  const { subject_name } = req.body;

  if (!subject_name || subject_name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Subject name is required.'
    });
  }

  // Check for duplicate (excluding self)
  const existing = db.find('subjects', s =>
    s.subject_name.toLowerCase() === subject_name.trim().toLowerCase() &&
    s.id !== Number(req.params.id)
  );
  if (existing.length > 0) {
    return res.status(409).json({
      success: false,
      message: 'Another subject with this name already exists.'
    });
  }

  const updated = db.update('subjects', req.params.id, {
    subject_name: subject_name.trim()
  });

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'Subject not found.'
    });
  }

  return res.json({
    success: true,
    message: 'Subject updated successfully.',
    data: updated
  });
});

// ── Delete Subject ───────────────────────────────────────────
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);

  const subject = db.getById('subjects', id);
  if (!subject) {
    return res.status(404).json({
      success: false,
      message: 'Subject not found.'
    });
  }

  // Check for dependent marks records
  const dependentMarks = db.find('marks', m => m.subject_id === id);
  if (dependentMarks.length > 0) {
    // Cascade delete related marks
    const fullDb = db.readDB();
    fullDb.marks = fullDb.marks.filter(m => m.subject_id !== id);
    db.writeDB(fullDb);
  }

  db.remove('subjects', id);
  return res.json({
    success: true,
    message: 'Subject and related marks deleted successfully.'
  });
});

module.exports = router;
