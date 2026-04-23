const express = require('express');
const router = express.Router();
const { addDoctor, getDoctors, getDoctorById, getDoctorByEmail } = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addDoctor);
router.get('/', getDoctors);
router.get('/by-email/:email', getDoctorByEmail); // inter-service lookup (must be before /:id)
router.get('/:id', getDoctorById);                // public + inter-service

module.exports = router;

