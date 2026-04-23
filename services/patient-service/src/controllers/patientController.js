const Patient = require('../models/Patient');

// ── Create Patient Profile ────────────────────────────────────────────────
const createPatient = async (req, res) => {
  try {
    const { fullName, dateOfBirth, gender, phone, address, bloodGroup, allergies } = req.body;

    if (!fullName || !dateOfBirth || !gender || !phone) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const existingPatient = await Patient.findOne({ userId: req.user.id });
    if (existingPatient) {
      return res.status(409).json({ success: false, message: 'Patient profile already exists' });
    }

    const patient = await Patient.create({
      userId: req.user.id,
      fullName,
      dateOfBirth,
      gender,
      phone,
      address,
      bloodGroup,
      allergies,
    });

    res.status(201).json({ success: true, message: 'Patient profile created', data: patient });
  } catch (error) {
    console.error('[Patient] Create error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Get Patient Profile ───────────────────────────────────────────────────
const getPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    console.error('[Patient] Get error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Get Patient by ID (internal) ──────────────────────────────────────────
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    console.error('[Patient] GetById error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { createPatient, getPatient, getPatientById };
