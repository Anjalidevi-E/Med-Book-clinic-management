const express = require('express');
const router = express.Router();
const {
  getAllPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');
const { protect } = require('../middleware/auth');

// All routes protected
router.use(protect);

router.route('/').get(getAllPatients).post(createPatient);

router.route('/:id').get(getPatient).put(updatePatient).delete(deletePatient);

module.exports = router;
