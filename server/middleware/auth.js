/**
 * auth.js — Authentication Middleware
 * 
 * Protects routes by checking for a valid session.
 * Returns 401 JSON response if not authenticated.
 */

function requireAuth(req, res, next) {
  if (req.session && req.session.username) {
    return next();
  }
  return res.status(401).json({
    success: false,
    message: 'Authentication required. Please log in.'
  });
}

module.exports = { requireAuth };
