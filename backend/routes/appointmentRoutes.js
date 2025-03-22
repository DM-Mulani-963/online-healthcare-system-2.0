const express = require('express');
const { 
  getAppointments, 
  getAppointment, 
  getPatientAppointments,
  getDoctorAppointments,
  createAppointment, 
  updateAppointment, 
  deleteAppointment 
} = require('../controllers/appointmentController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('admin'), getAppointments)
  .post(protect, createAppointment);

router
  .route('/:id')
  .get(protect, getAppointment)
  .put(protect, updateAppointment)
  .delete(protect, deleteAppointment);

router
  .route('/patient/:patientId')
  .get(protect, getPatientAppointments);

router
  .route('/doctor/:doctorId')
  .get(protect, getDoctorAppointments);

module.exports = router;
