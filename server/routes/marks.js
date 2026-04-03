/**
 * marks.js — Marks CRUD Routes
 * 
 * Replaces: add_marks.php, view_marks.php, edit_marks.php, delete_marks.php
 * 
 * Routes:
 *   GET    /api/marks      — List all marks records
 *   GET    /api/marks/:id  — Get a single record
 *   POST   /api/marks      — Add marks
 *   PUT    /api/marks/:id  — Update marks
 *   DELETE /api/marks/:id  — Delete marks
 */

const express = require('express');
const db = require('../db');

const router = express.Router();

// ── List All Marks ───────────────────────────────────────────
router.get('/', (req, res) => {
  const records = db.getAll('marks');
  return res.json({ success: true, data: records });
});

// ── Get Single Record ────────────────────────────────────────
router.get('/:id', (req, res) => {
  const record = db.getById('marks', req.params.id);
  if (!record) {
    return res.status(404).json({
      success: false,
      message: 'Marks record not found.'
    });
  }
  return res.json({ success: true, data: record });
});

// ── Add Marks ────────────────────────────────────────────────
router.post('/', (req, res) => {
  const { student_id, subject_id, marks } = req.body;

  // Validate required fields
  if (student_id === undefined || subject_id === undefined || marks === undefined) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required: student_id, subject_id, marks.'
    });
  }

  const parsedStudentId = Number(student_id);
  const parsedSubjectId = Number(subject_id);
  const parsedMarks = Number(marks);

  if (isNaN(parsedStudentId) || parsedStudentId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Student ID must be a valid positive number.'
    });
  }

  if (isNaN(parsedSubjectId) || parsedSubjectId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Subject ID must be a valid positive number.'
    });
  }

  if (isNaN(parsedMarks) || parsedMarks < 0 || parsedMarks > 100) {
    return res.status(400).json({
      success: false,
      message: 'Marks must be a number between 0 and 100.'
    });
  }

  // Validate references exist
  const student = db.getById('students', parsedStudentId);
  if (!student) {
    return res.status(404).json({
      success: false,
      message: `Student with ID ${parsedStudentId} does not exist.`
    });
  }

  const subject = db.getById('subjects', parsedSubjectId);
  if (!subject) {
    return res.status(404).json({
      success: false,
      message: `Subject with ID ${parsedSubjectId} does not exist.`
    });
  }

  const record = db.insert('marks', {
    student_id: parsedStudentId,
    subject_id: parsedSubjectId,
    marks: parsedMarks
  });

  return res.status(201).json({
    success: true,
    message: 'Marks added successfully.',
    data: record
  });
});

// ── Update Marks ─────────────────────────────────────────────
router.put('/:id', (req, res) => {
  const { student_id, subject_id, marks } = req.body;

  if (student_id === undefined || subject_id === undefined || marks === undefined) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.'
    });
  }

  const parsedStudentId = Number(student_id);
  const parsedSubjectId = Number(subject_id);
  const parsedMarks = Number(marks);

  if (isNaN(parsedMarks) || parsedMarks < 0 || parsedMarks > 100) {
    return res.status(400).json({
      success: false,
      message: 'Marks must be a number between 0 and 100.'
    });
  }

  const updated = db.update('marks', req.params.id, {
    student_id: parsedStudentId,
    subject_id: parsedSubjectId,
    marks: parsedMarks
  });

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'Marks record not found.'
    });
  }

  return res.json({
    success: true,
    message: 'Marks updated successfully.',
    data: updated
  });
});

// ── Delete Marks ─────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  const deleted = db.remove('marks', req.params.id);
  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'Marks record not found.'
    });
  }
  return res.json({
    success: true,
    message: 'Marks record deleted successfully.'
  });
});

module.exports = router;
