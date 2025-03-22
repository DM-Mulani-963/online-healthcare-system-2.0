const express = require('express');
const { 
  getDoctors, 
  getDoctor, 
  createDoctor, 
  updateDoctor, 
  deleteDoctor 
} = require('../controllers/doctorController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(getDoctors)
  .post(protect, authorize('admin'), createDoctor);

router
  .route('/:id')
  .get(getDoctor)
  .put(protect, updateDoctor)
  .delete(protect, authorize('admin'), deleteDoctor);

module.exports = router;
