const express = require('express');
const { 
  getPrescriptions, 
  getPrescription, 
  getPatientPrescriptions,
  getDoctorPrescriptions,
  createPrescription, 
  updatePrescription, 
  deletePrescription 
} = require('../controllers/prescriptionController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('admin'), getPrescriptions)
  .post(protect, authorize('doctor', 'admin'), createPrescription);

router
  .route('/:id')
  .get(protect, getPrescription)
  .put(protect, authorize('doctor', 'admin'), updatePrescription)
  .delete(protect, authorize('doctor', 'admin'), deletePrescription);

router
  .route('/patient/:patientId')
  .get(protect, getPatientPrescriptions);

router
  .route('/doctor/:doctorId')
  .get(protect, getDoctorPrescriptions);

module.exports = router;
