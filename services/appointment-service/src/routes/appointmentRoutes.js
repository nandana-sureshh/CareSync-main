const express = require('express');
const router  = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getDoctorAppointments,
  acceptAppointment,
  rejectAppointment,
} = require('../controllers/appointmentController');

// ── Patient routes ────────────────────────────────────────────────────────
router.post('/',              bookAppointment);
router.get('/me',             getMyAppointments);
router.patch('/:id/cancel',   cancelAppointment);

// ── Doctor routes ─────────────────────────────────────────────────────────
router.get('/doctor/mine',    getDoctorAppointments);
router.patch('/:id/accept',   acceptAppointment);
router.patch('/:id/reject',   rejectAppointment);

module.exports = router;
