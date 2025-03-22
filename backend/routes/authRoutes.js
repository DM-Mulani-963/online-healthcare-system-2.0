const express = require('express');
const { 
  registerPatient,
  registerDoctor,
  registerAdmin,
  login,
  getMe,
  changePassword
} = require('../controllers/authController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register/patient', registerPatient);
router.post('/register/doctor', protect, authorize('admin'), registerDoctor);
router.post('/register/admin', protect, authorize('admin'), registerAdmin);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
