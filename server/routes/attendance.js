/**
 * attendance.js — Attendance CRUD Routes
 * 
 * Replaces: add_attendance.php, view_attendance.php, edit_attendance.php, delete_attendance.php
 * 
 * Routes:
 *   GET    /api/attendance      — List all attendance records
 *   GET    /api/attendance/:id  — Get a single record
 *   POST   /api/attendance      — Add attendance
 *   PUT    /api/attendance/:id  — Update attendance
 *   DELETE /api/attendance/:id  — Delete attendance
 */

const express = require('express');
const db = require('../db');

const router = express.Router();

// ── List All Attendance ──────────────────────────────────────
router.get('/', (req, res) => {
  const records = db.getAll('attendance');
  return res.json({ success: true, data: records });
});

// ── Get Single Record ────────────────────────────────────────
router.get('/:id', (req, res) => {
  const record = db.getById('attendance', req.params.id);
  if (!record) {
    return res.status(404).json({
      success: false,
      message: 'Attendance record not found.'
    });
  }
  return res.json({ success: true, data: record });
});

// ── Add Attendance ───────────────────────────────────────────
router.post('/', (req, res) => {
  const { student_id, attendance_date, attendance } = req.body;

  // Validate required fields
  if (student_id === undefined || !attendance_date || attendance === undefined) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required: student_id, attendance_date, attendance.'
    });
  }

  // Validate student_id is a number
  const parsedStudentId = Number(student_id);
  if (isNaN(parsedStudentId) || parsedStudentId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Student ID must be a valid positive number.'
    });
  }

  // Validate attendance value (0 or 1)
  const parsedAttendance = Number(attendance);
  if (parsedAttendance !== 0 && parsedAttendance !== 1) {
    return res.status(400).json({
      success: false,
      message: 'Attendance must be 0 (Absent) or 1 (Present).'
    });
  }

  // Validate date format
  if (isNaN(Date.parse(attendance_date))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format.'
    });
  }

  // Check if student exists
  const student = db.getById('students', parsedStudentId);
  if (!student) {
    return res.status(404).json({
      success: false,
      message: `Student with ID ${parsedStudentId} does not exist.`
    });
  }

  const record = db.insert('attendance', {
    student_id: parsedStudentId,
    attendance_date: attendance_date.trim(),
    attendance: parsedAttendance
  });

  return res.status(201).json({
    success: true,
    message: 'Attendance added successfully.',
    data: record
  });
});

// ── Update Attendance ────────────────────────────────────────
router.put('/:id', (req, res) => {
  const { student_id, attendance_date, attendance } = req.body;

  // Validate required fields
  if (student_id === undefined || !attendance_date || attendance === undefined) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required.'
    });
  }

  const parsedStudentId = Number(student_id);
  const parsedAttendance = Number(attendance);

  if (isNaN(parsedStudentId) || parsedStudentId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Student ID must be a valid positive number.'
    });
  }

  if (parsedAttendance !== 0 && parsedAttendance !== 1) {
    return res.status(400).json({
      success: false,
      message: 'Attendance must be 0 (Absent) or 1 (Present).'
    });
  }

  const updated = db.update('attendance', req.params.id, {
    student_id: parsedStudentId,
    attendance_date: attendance_date.trim(),
    attendance: parsedAttendance
  });

  if (!updated) {
    return res.status(404).json({
      success: false,
      message: 'Attendance record not found.'
    });
  }

  return res.json({
    success: true,
    message: 'Attendance updated successfully.',
    data: updated
  });
});

// ── Delete Attendance ────────────────────────────────────────
router.delete('/:id', (req, res) => {
  const deleted = db.remove('attendance', req.params.id);
  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'Attendance record not found.'
    });
  }
  return res.json({
    success: true,
    message: 'Attendance record deleted successfully.'
  });
});

module.exports = router;
