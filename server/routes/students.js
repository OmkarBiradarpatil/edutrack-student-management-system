/**
 * students.js — Student CRUD Routes
 * 
 * Replaces: add_student.php, view_students.php, edit_student.php, delete_student.php
 * 
 * Routes:
 *   GET    /api/students      — List all students
 *   GET    /api/students/:id  — Get a single student
 *   POST   /api/students      — Add a new student
 *   PUT    /api/students/:id  — Update a student
 *   DELETE /api/students/:id  — Delete a student
 */

const express = require('express');
const db = require('../db');

const router = express.Router();

// ── List All Students ────────────────────────────────────────
router.get('/', (req, res) => {
  const students = db.getAll('students');
  return res.json({ success: true, data: students });
});

// ── Get Single Student ───────────────────────────────────────
router.get('/:id', (req, res) => {
  const student = db.getById('students', req.params.id);
  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found.'
    });
  }
  return res.json({ success: true, data: student });
});

// ── Add Student ──────────────────────────────────────────────
router.post('/', (req, res) => {
  const { enrollment_no, student_name, department, phone } = req.body;

  // Validate required fields
  if (!enrollment_no || !student_name || !department || !phone) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required: enrollment_no, student_name, department, phone.'
    });
  }

  // Validate enrollment_no is not empty after trimming
  if (enrollment_no.trim().length === 0 || student_name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Enrollment number and student name cannot be empty.'
    });
  }

  // Check for duplicate enrollment number
  const existing = db.find('students', s => s.enrollment_no === enrollment_no.trim());
  if (existing.length > 0) {
    return res.status(409).json({
      success: false,
      message: 'A student with this enrollment number already exists.'
    });
  }

  const student = db.insert('students', {
    enrollment_no: enrollment_no.trim(),
    student_name: student_name.trim(),
    department: department.trim(),
    phone: phone.trim()
  });

  return res.status(201).json({
    success: true,
    message: 'Student added successfully.',
    data: student
  });
});

// ── Update Student ───────────────────────────────────────────
router.put('/:id', (req, res) => {
  const { enrollment_no, student_name, department, phone } = req.body;

  // Validate required fields
  if (!enrollment_no || !student_name || !department || !phone) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.'
    });
  }

  // Check for duplicate enrollment_no (excluding current record)
  const existing = db.find('students', s =>
    s.enrollment_no === enrollment_no.trim() && s.id !== Number(req.params.id)
  );
  if (existing.length > 0) {
    return res.status(409).json({
      success: false,
      message: 'Another student with this enrollment number already exists.'
    });
  }

  const updated = db.update('students', req.params.id, {
    enrollment_no: enrollment_no.trim(),
    student_name: student_name.trim(),
    department: department.trim(),
    phone: phone.trim()
  });

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'Student not found.'
    });
  }

  return res.json({
    success: true,
    message: 'Student updated successfully.',
    data: updated
  });
});

// ── Delete Student ───────────────────────────────────────────
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);

  // Check if student exists
  const student = db.getById('students', id);
  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found.'
    });
  }

  // Check for dependent attendance records
  const dependentAttendance = db.find('attendance', a => a.student_id === id);
  const dependentMarks = db.find('marks', m => m.student_id === id);

  if (dependentAttendance.length > 0 || dependentMarks.length > 0) {
    // Cascade delete: remove related attendance and marks
    const fullDb = db.readDB();
    fullDb.attendance = fullDb.attendance.filter(a => a.student_id !== id);
    fullDb.marks = fullDb.marks.filter(m => m.student_id !== id);
    db.writeDB(fullDb);
  }

  const deleted = db.remove('students', id);
  return res.json({
    success: true,
    message: 'Student and related records deleted successfully.'
  });
});

module.exports = router;
