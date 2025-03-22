const express = require('express');
const { 
  getMedicalReports, 
  getMedicalReport, 
  getPatientMedicalReports,
  getDoctorMedicalReports,
  createMedicalReport, 
  updateMedicalReport, 
  deleteMedicalReport 
} = require('../controllers/medicalReportController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('admin'), getMedicalReports)
  .post(protect, authorize('doctor', 'admin'), createMedicalReport);

router
  .route('/:id')
  .get(protect, getMedicalReport)
  .put(protect, authorize('doctor', 'admin'), updateMedicalReport)
  .delete(protect, authorize('admin'), deleteMedicalReport);

router
  .route('/patient/:patientId')
  .get(protect, getPatientMedicalReports);

router
  .route('/doctor/:doctorId')
  .get(protect, getDoctorMedicalReports);

module.exports = router;
