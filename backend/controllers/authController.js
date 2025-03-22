const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/firebase');

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @param {string} role - User role (patient, doctor, admin)
 * @returns {string} - JWT token
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

/**
 * @desc    Register patient
 * @route   POST /api/auth/register/patient
 * @access  Public
 */
exports.registerPatient = async (req, res, next) => {
  try {
    const {
      First_Name,
      Last_Name,
      Date_of_Birth,
      Gender,
      Blood_Type,
      Contact_Number,
      Email,
      Address,
      Emergency_Contact,
      Insurance_Details,
      Username,
      Password
    } = req.body;
    
    // Check if username or email already exists
    const existingPatients = await db.query('patients', [
      ['Email', '==', Email]
    ]);
    
    if (existingPatients.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }
    
    const usernameCheck = await db.query('patients', [
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
    
    // Create patient
    const patient = await db.create('patients', {
      First_Name,
      Last_Name,
      Date_of_Birth,
      Gender,
      Blood_Type,
      Contact_Number,
      Email,
      Address,
      Emergency_Contact,
      Insurance_Details,
      Username,
      Password: hashedPassword
    });
    
    // Generate token
    const token = generateToken(patient.id, 'patient');
    
    // Remove password from response
    const { Password: pwd, ...patientData } = patient;
    
    res.status(201).json({
      success: true,
      token,
      data: patientData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register doctor (admin only)
 * @route   POST /api/auth/register/doctor
 * @access  Private/Admin
 */
exports.registerDoctor = async (req, res, next) => {
  try {
    const {
      First_Name,
      Last_Name,
      Specialization,
      Experience_Years,
      Contact_Number,
      Email,
      Consultation_Fees,
      Availability_Status,
      Clinic_Hospital_Name,
      Username,
      Password
    } = req.body;
    
    // Check if username or email already exists
    const existingDoctors = await db.query('doctors', [
      ['Email', '==', Email]
    ]);
    
    if (existingDoctors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }
    
    const usernameCheck = await db.query('doctors', [
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
    
    // Create doctor
    const doctor = await db.create('doctors', {
      First_Name,
      Last_Name,
      Specialization,
      Experience_Years,
      Contact_Number,
      Email,
      Consultation_Fees,
      Availability_Status,
      Clinic_Hospital_Name,
      Username,
      Password: hashedPassword
    });
    
    // Generate token
    const token = generateToken(doctor.id, 'doctor');
    
    // Remove password from response
    const { Password: pwd, ...doctorData } = doctor;
    
    res.status(201).json({
      success: true,
      token,
      data: doctorData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register admin (admin only)
 * @route   POST /api/auth/register/admin
 * @access  Private/Admin
 */
exports.registerAdmin = async (req, res, next) => {
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
    
    // Generate token
    const token = generateToken(admin.id, 'admin');
    
    // Remove password from response
    const { Password: pwd, ...adminData } = admin;
    
    res.status(201).json({
      success: true,
      token,
      data: adminData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { Username, Password, Role } = req.body;
    
    // Validate input
    if (!Username || !Password || !Role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, password and role'
      });
    }
    
    // Check if role is valid
    if (!['patient', 'doctor', 'admin'].includes(Role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }
    
    // Find user by username and role
    let user;
    let collection;
    
    if (Role === 'patient') {
      collection = 'patients';
    } else if (Role === 'doctor') {
      collection = 'doctors';
    } else if (Role === 'admin') {
      collection = 'admins';
    }
    
    const users = await db.query(collection, [
      ['Username', '==', Username]
    ]);
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    user = users[0];
    
    // Check if password matches
    const isMatch = await bcrypt.compare(Password, user.Password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = generateToken(user.id, Role);
    
    // Remove password from response
    const { Password: pwd, ...userData } = user;
    
    res.status(200).json({
      success: true,
      token,
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    // User is already available in req due to the protect middleware
    const { Password, ...userData } = req.user;
    
    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { CurrentPassword, NewPassword } = req.body;
    
    // Validate input
    if (!CurrentPassword || !NewPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }
    
    // Get user from database
    let collection;
    
    if (req.user.role === 'patient') {
      collection = 'patients';
    } else if (req.user.role === 'doctor') {
      collection = 'doctors';
    } else if (req.user.role === 'admin') {
      collection = 'admins';
    }
    
    const user = await db.getById(collection, req.user.id);
    
    // Check if current password matches
    const isMatch = await bcrypt.compare(CurrentPassword, user.Password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(NewPassword, salt);
    
    // Update password
    await db.update(collection, req.user.id, {
      Password: hashedPassword
    });
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
