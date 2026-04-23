const express = require('express');
const router = express.Router();
const { createPatient, getPatient, getPatientById } = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createPatient);
router.get('/me', protect, getPatient);
router.get('/:id', getPatientById); // internal route (no auth required for inter-service)

module.exports = router;
