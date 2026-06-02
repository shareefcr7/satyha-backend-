const jwt = require('jsonwebtoken');
const User = require('../models/user');

const secret = 'mySuperSecretKey123!@#';

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'You are not authorized', message: 'No authorization header' });
    }

    // Extract token (handle both "Bearer <token>" and just "<token>")
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    if (!token) {
      return res.status(401).json({ error: 'You are not authorized', message: 'Token missing' });
    }

    // Verify token directly
    jwt.verify(token, secret, async (err, decoded) => {
      if (err) {
        console.error('JWT Verify Error:', err.message);
        
        // Handle different JWT errors
        let errorMessage = 'Session expired or invalid. Please logout and login again.';
        if (err.message === 'jwt malformed') {
          errorMessage = 'Invalid token format. Please logout and login again.';
        } else if (err.message === 'jwt expired') {
          errorMessage = 'Your session has expired. Please login again.';
        } else if (err.message === 'invalid token') {
          errorMessage = 'Invalid token. Please logout and login again.';
        }
        
        return res.status(401).json({ 
          error: 'You are not authorized',
          message: errorMessage
        });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ error: 'You are not authorized', message: 'User not found' });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Auth Middleware Exception:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

module.exports = auth;
