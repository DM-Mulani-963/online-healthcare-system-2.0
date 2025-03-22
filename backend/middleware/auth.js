const jwt = require('jsonwebtoken');
const db = require('../config/firebase');

/**
 * Middleware to authenticate JWT tokens
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user exists
      let user;
      
      if (decoded.role === 'patient') {
        user = await db.getById('patients', decoded.id);
      } else if (decoded.role === 'doctor') {
        user = await db.getById('doctors', decoded.id);
      } else if (decoded.role === 'admin') {
        user = await db.getById('admins', decoded.id);
      }
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists'
        });
      }
      
      // Add user to request object
      req.user = user;
      req.user.role = decoded.role;
      
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict access to specific roles
 * @param {...string} roles - Roles allowed to access the route
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
