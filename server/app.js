/**
 * app.js — Express Server Entry Point
 * 
 * Replaces the entire PHP + Apache stack.
 * Serves static frontend files and REST API endpoints.
 * 
 * Run: node server/app.js
 * Open: http://localhost:3000
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

// Import route modules
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const marksRoutes = require('./routes/marks');
const subjectRoutes = require('./routes/subjects');

// Import middleware
const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'edutrack-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,        // Prevent XSS access to cookies
    sameSite: 'lax',       // CSRF protection
    secure: false,         // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── API Routes ───────────────────────────────────────────────

// Auth routes (no auth middleware — these handle login/register)
app.use('/api/auth', authRoutes);

// Protected routes — require authentication
app.use('/api/students', requireAuth, studentRoutes);
app.use('/api/attendance', requireAuth, attendanceRoutes);
app.use('/api/marks', requireAuth, marksRoutes);
app.use('/api/subjects', requireAuth, subjectRoutes);

// ── SPA Fallback ─────────────────────────────────────────────
// All non-API routes serve the SPA shell
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ── Error Handler ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error.'
  });
});

// ── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔═══════════════════════════════════════════════╗');
  console.log('  ║                                               ║');
  console.log('  ║   🎓 EduTrack Student Management System       ║');
  console.log('  ║                                               ║');
  console.log(`  ║   ✅ Server running on http://localhost:${PORT}   ║`);
  console.log('  ║   📁 Data stored in data/db.json              ║');
  console.log('  ║                                               ║');
  console.log('  ║   Press Ctrl+C to stop                        ║');
  console.log('  ║                                               ║');
  console.log('  ╚═══════════════════════════════════════════════╝');
  console.log('');
});
