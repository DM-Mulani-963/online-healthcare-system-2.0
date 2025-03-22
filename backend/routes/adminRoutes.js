const express = require('express');
const { 
  getAdmins, 
  getAdmin, 
  createAdmin, 
  updateAdmin, 
  deleteAdmin 
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin authorization
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(getAdmins)
  .post(createAdmin);

router
  .route('/:id')
  .get(getAdmin)
  .put(updateAdmin)
  .delete(deleteAdmin);

module.exports = router;
