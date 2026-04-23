const Appointment = require('../models/Appointment');
const { validateAuthToken, validateDoctorExists } = require('../services/interService');

// ── Helper: find doctorId for a logged-in doctor user ─────────────────────
// The doctor-service stores the doctor document _id.
// The auth-service stores the user account _id.
// We match them via the doctor's email stored in both systems.
const getDoctorProfileId = require('../services/getDoctorProfileId');

// ─────────────────────────────────────────────────────────────────────────
// PATIENT ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────

// ── Book Appointment ──────────────────────────────────────────────────────
const bookAppointment = async (req, res) => {
  try {
    const user = await validateAuthToken(req.headers['authorization']);

    if (user.role !== 'patient') {
      return res.status(403).json({ success: false, message: 'Only patients can book appointments' });
    }

    const { doctorId, appointmentDate, timeSlot, reason } = req.body;

    if (!doctorId || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'doctorId, appointmentDate and timeSlot are required',
      });
    }

    // Validate doctor exists in doctor-service
    const doctor = await validateDoctorExists(doctorId);

    // Prevent duplicate booking
    const existing = await Appointment.findOne({
      patientId: user.id,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You already have an appointment with this doctor at that time',
      });
    }

    const appointment = await Appointment.create({
      patientId: user.id,
      patientEmail: user.email,
      doctorId,
      doctorName: doctor.fullName,
      specialization: doctor.specialization,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      reason,
      status: 'pending',
    });

    res.status(201).json({ success: true, message: 'Appointment booked successfully', data: appointment });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[Appointment] Book error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Get Patient's Own Appointments ────────────────────────────────────────
const getMyAppointments = async (req, res) => {
  try {
    const user = await validateAuthToken(req.headers['authorization']);

    const appointments = await Appointment.find({ patientId: user.id }).sort({ appointmentDate: -1 });

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[Appointment] GetMine error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Cancel Appointment (patient) ──────────────────────────────────────────
const cancelAppointment = async (req, res) => {
  try {
    const user = await validateAuthToken(req.headers['authorization']);

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.patientId !== user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({ success: true, message: 'Appointment cancelled', data: appointment });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[Appointment] Cancel error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────
// DOCTOR ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────

// ── Get Doctor's Appointments ─────────────────────────────────────────────
const getDoctorAppointments = async (req, res) => {
  try {
    const user = await validateAuthToken(req.headers['authorization']);

    if (user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can access this endpoint' });
    }

    // Resolve the doctor's profile _id from doctor-service using their email
    const doctorProfileId = await getDoctorProfileId(user.email);

    const appointments = await Appointment.find({ doctorId: doctorProfileId }).sort({
      appointmentDate: 1,
    });

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[Appointment] GetDoctor error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Accept Appointment (doctor) ───────────────────────────────────────────
const acceptAppointment = async (req, res) => {
  try {
    const user = await validateAuthToken(req.headers['authorization']);

    if (user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can accept appointments' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const doctorProfileId = await getDoctorProfileId(user.email);
    if (appointment.doctorId !== doctorProfileId) {
      return res.status(403).json({ success: false, message: 'Forbidden: not your appointment' });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot accept a ${appointment.status} appointment` });
    }

    appointment.status = 'confirmed';
    await appointment.save();

    res.status(200).json({ success: true, message: 'Appointment confirmed', data: appointment });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[Appointment] Accept error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ── Reject Appointment (doctor) ───────────────────────────────────────────
const rejectAppointment = async (req, res) => {
  try {
    const user = await validateAuthToken(req.headers['authorization']);

    if (user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can reject appointments' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const doctorProfileId = await getDoctorProfileId(user.email);
    if (appointment.doctorId !== doctorProfileId) {
      return res.status(403).json({ success: false, message: 'Forbidden: not your appointment' });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot reject a ${appointment.status} appointment` });
    }

    appointment.status = 'rejected';
    await appointment.save();

    res.status(200).json({ success: true, message: 'Appointment rejected', data: appointment });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error('[Appointment] Reject error:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getDoctorAppointments,
  acceptAppointment,
  rejectAppointment,
};
