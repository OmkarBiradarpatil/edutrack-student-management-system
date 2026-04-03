/**
 * auth.js — Authentication Routes
 * 
 * Replaces: login.php, register.php, logout.php
 * 
 * Routes:
 *   POST /api/auth/register — Create a new user account
 *   POST /api/auth/login    — Authenticate and create session
 *   POST /api/auth/logout   — Destroy session
 *   GET  /api/auth/check    — Check current auth status
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();

const SALT_ROUNDS = 10;

// ── Register ─────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    const trimmedUsername = username.trim();

    if (trimmedUsername.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters.'
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 4 characters.'
      });
    }

    // Check if username already exists
    const existing = db.find('users', u => u.username === trimmedUsername);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists. Please choose another.'
      });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = db.insert('users', {
      username: trimmedUsername,
      password: hashedPassword
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! You can now log in.',
      data: { id: user.id, username: user.username }
    });

  } catch (err) {
    console.error('[Auth] Register error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.'
    });
  }
});

// ── Login ────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.'
      });
    }

    // Find user
    const users = db.find('users', u => u.username === username.trim());
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    const user = users[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    // Create session
    req.session.username = user.username;
    req.session.userId = user.id;

    return res.json({
      success: true,
      message: 'Login successful!',
      data: { username: user.username }
    });

  } catch (err) {
    console.error('[Auth] Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.'
    });
  }
});

// ── Logout ───────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error during logout.'
      });
    }
    res.clearCookie('connect.sid');
    return res.json({
      success: true,
      message: 'Logged out successfully.'
    });
  });
});

// ── Check Auth Status ────────────────────────────────────────
router.get('/check', (req, res) => {
  if (req.session && req.session.username) {
    return res.json({
      success: true,
      data: { username: req.session.username }
    });
  }
  return res.json({ success: false });
});

module.exports = router;
