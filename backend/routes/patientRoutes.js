const express = require('express');
const { 
  getPatients, 
  getPatient, 
  createPatient, 
  updatePatient, 
  deletePatient 
} = require('../controllers/patientController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('admin'), getPatients)
  .post(createPatient);

// Add specific registration endpoint
router.post('/register', createPatient);

router
  .route('/:id')
  .get(protect, getPatient)
  .put(protect, updatePatient)
  .delete(protect, deletePatient);

module.exports = router;
