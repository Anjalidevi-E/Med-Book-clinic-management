const express = require('express');
const router = express.Router();
const {
  getAllAppointments,
  getAppointment,
  getAppointmentsByPatient,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
  getDashboardStats,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats/dashboard', getDashboardStats);
router.get('/patient/:patientId', getAppointmentsByPatient);

router.route('/').get(getAllAppointments).post(createAppointment);

router.route('/:id').get(getAppointment).put(updateAppointment).delete(deleteAppointment);

router.patch('/:id/cancel', cancelAppointment);

module.exports = router;
