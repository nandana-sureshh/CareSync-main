const Doctor = require('../models/Doctor');

// ── Add Doctor ────────────────────────────────────────────────────────────
const addDoctor = async (req, res) => {
  try {
    const {
      fullName,
      specialization,
      qualifications,
      experience,
      phone,
      email,
      availableDays,
      consultationFee,
    } = req.body;

    if (!fullName || !specialization) {
      return res.status(400).json({ success: false, message: 'Name and specialization are required' });
    }

    const doctor = await Doctor.create({
      fullName,
      specialization,
      qualifications,
      experience,
      phone,
      email,
      availableDays,
      consultationFee,
    });

    res.status(201).json({ success: true, message: 'Doctor added successfully', data: doctor });
  } catch (error) {
    console.error('[Doctor] Add error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Get All Doctors ───────────────────────────────────────────────────────
const getDoctors = async (req, res) => {
  try {
    const { specialization } = req.query;
    const filter = { isActive: true };
    if (specialization) filter.specialization = { $regex: specialization, $options: 'i' };

    const doctors = await Doctor.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    console.error('[Doctor] GetAll error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Get Doctor by ID ──────────────────────────────────────────────────────
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    console.error('[Doctor] GetById error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Get Doctor by Email (inter-service) ──────────────────────────────────
const getDoctorByEmail = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ email: decodeURIComponent(req.params.email) });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    console.error('[Doctor] GetByEmail error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { addDoctor, getDoctors, getDoctorById, getDoctorByEmail };

