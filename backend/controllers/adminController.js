const db = require('../config/firebase');
const bcrypt = require('bcryptjs');

/**
 * @desc    Get all admins
 * @route   GET /api/admin
 * @access  Private/Admin
 */
exports.getAdmins = async (req, res, next) => {
  try {
    const admins = await db.getAll('admins');
    
    // Remove sensitive information
    const sanitizedAdmins = admins.map(admin => {
      const { Password, ...adminData } = admin;
      return adminData;
    });
    
    res.status(200).json({
      success: true,
      count: sanitizedAdmins.length,
      data: sanitizedAdmins
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single admin
 * @route   GET /api/admin/:id
 * @access  Private/Admin
 */
exports.getAdmin = async (req, res, next) => {
  try {
    const admin = await db.getById('admins', req.params.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    // Check if user is authorized to view this admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access admin data'
      });
    }
    
    // Remove sensitive information
    const { Password, ...adminData } = admin;
    
    res.status(200).json({
      success: true,
      data: adminData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new admin
 * @route   POST /api/admin
 * @access  Private/Admin
 */
exports.createAdmin = async (req, res, next) => {
  try {
    const {
      Name,
      Contact,
      Email,
      Username,
      Password
    } = req.body;
    
    // Check if username or email already exists
    const existingAdmins = await db.query('admins', [
      ['Email', '==', Email]
    ]);
    
    if (existingAdmins.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }
    
    const usernameCheck = await db.query('admins', [
      ['Username', '==', Username]
    ]);
    
    if (usernameCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username already in use'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);
    
    // Create admin
    const admin = await db.create('admins', {
      Name,
      Contact,
      Email,
      Username,
      Password: hashedPassword
    });
    
    // Remove password from response
    const { Password: pwd, ...adminData } = admin;
    
    res.status(201).json({
      success: true,
      data: adminData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update admin
 * @route   PUT /api/admin/:id
 * @access  Private/Admin
 */
exports.updateAdmin = async (req, res, next) => {
  try {
    // Check if admin exists
    let admin = await db.getById('admins', req.params.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    // Check if user is authorized to update this admin
    if (req.user.role !== 'admin' || req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update other admin accounts'
      });
    }
    
    // Handle password update separately
    if (req.body.Password) {
      const salt = await bcrypt.genSalt(10);
      req.body.Password = await bcrypt.hash(req.body.Password, salt);
    }
    
    // Update admin
    const updatedAdmin = await db.update('admins', req.params.id, req.body);
    
    // Remove password from response
    const { Password, ...adminData } = updatedAdmin;
    
    res.status(200).json({
      success: true,
      data: adminData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete admin
 * @route   DELETE /api/admin/:id
 * @access  Private/Admin
 */
exports.deleteAdmin = async (req, res, next) => {
  try {
    // Check if admin exists
    const admin = await db.getById('admins', req.params.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    // Check if user is authorized to delete this admin
    if (req.user.role !== 'admin' || req.user.id === req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete admin accounts or cannot delete your own account'
      });
    }
    
    // Delete admin
    await db.delete('admins', req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
