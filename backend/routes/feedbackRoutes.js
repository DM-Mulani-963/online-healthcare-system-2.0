const express = require('express');
const { 
  getAllFeedback, 
  getFeedback, 
  getDoctorFeedback,
  getPatientFeedback,
  createFeedback, 
  updateFeedback, 
  deleteFeedback 
} = require('../controllers/feedbackController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('admin'), getAllFeedback)
  .post(protect, createFeedback);

router
  .route('/:id')
  .get(protect, getFeedback)
  .put(protect, updateFeedback)
  .delete(protect, deleteFeedback);

router
  .route('/doctor/:doctorId')
  .get(getDoctorFeedback); // Public route to view doctor feedback

router
  .route('/patient/:patientId')
  .get(protect, getPatientFeedback);

module.exports = router;
