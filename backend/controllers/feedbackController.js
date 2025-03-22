const db = require('../config/firebase');

/**
 * @desc    Get all feedback
 * @route   GET /api/feedback
 * @access  Private/Admin
 */
exports.getAllFeedback = async (req, res, next) => {
  try {
    const feedback = await db.getAll('feedback');
    
    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single feedback
 * @route   GET /api/feedback/:id
 * @access  Private/Admin or Doctor
 */
exports.getFeedback = async (req, res, next) => {
  try {
    const feedback = await db.getById('feedback', req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    // Check if user is authorized to view this feedback
    if (
      req.user.role !== 'admin' && 
      req.user.role !== 'doctor' && 
      req.user.id !== feedback.Doctor_ID
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this feedback'
      });
    }
    
    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get feedback for a doctor
 * @route   GET /api/feedback/doctor/:doctorId
 * @access  Public
 */
exports.getDoctorFeedback = async (req, res, next) => {
  try {
    const feedback = await db.query('feedback', [
      ['Doctor_ID', '==', req.params.doctorId]
    ]);
    
    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get feedback from a patient
 * @route   GET /api/feedback/patient/:patientId
 * @access  Private/Admin or Patient
 */
exports.getPatientFeedback = async (req, res, next) => {
  try {
    // Check if user is authorized to view these feedback
    if (req.user.role !== 'admin' && req.user.id !== req.params.patientId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these feedback'
      });
    }
    
    const feedback = await db.query('feedback', [
      ['Patient_ID', '==', req.params.patientId]
    ]);
    
    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new feedback
 * @route   POST /api/feedback
 * @access  Private/Patient
 */
exports.createFeedback = async (req, res, next) => {
  try {
    const {
      Patient_ID,
      Doctor_ID,
      Rating,
      Comments
    } = req.body;
    
    // Check if patient exists
    const patient = await db.getById('patients', Patient_ID);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    // Check if doctor exists
    const doctor = await db.getById('doctors', Doctor_ID);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Check if user is authorized to create this feedback
    if (req.user.role === 'patient' && req.user.id !== Patient_ID) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create feedback for another patient'
      });
    }
    
    // Check if rating is between 1 and 5
    if (Rating < 1 || Rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    // Create feedback
    const feedback = await db.create('feedback', {
      Patient_ID,
      Doctor_ID,
      Rating,
      Comments,
      Date: new Date().toISOString().split('T')[0]
    });
    
    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update feedback
 * @route   PUT /api/feedback/:id
 * @access  Private/Patient
 */
exports.updateFeedback = async (req, res, next) => {
  try {
    // Check if feedback exists
    let feedback = await db.getById('feedback', req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    // Check if user is authorized to update this feedback
    if (
      req.user.role !== 'admin' && 
      (req.user.role !== 'patient' || req.user.id !== feedback.Patient_ID)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this feedback'
      });
    }
    
    // Check if rating is between 1 and 5
    if (req.body.Rating && (req.body.Rating < 1 || req.body.Rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    // Update feedback
    const updatedFeedback = await db.update('feedback', req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      data: updatedFeedback
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete feedback
 * @route   DELETE /api/feedback/:id
 * @access  Private/Admin or Patient
 */
exports.deleteFeedback = async (req, res, next) => {
  try {
    // Check if feedback exists
    const feedback = await db.getById('feedback', req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    // Check if user is authorized to delete this feedback
    if (
      req.user.role !== 'admin' && 
      (req.user.role !== 'patient' || req.user.id !== feedback.Patient_ID)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this feedback'
      });
    }
    
    // Delete feedback
    await db.delete('feedback', req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
