import axios from 'axios';

const AUTH_URL    = 'http://98.83.39.194:4001';
const PATIENT_URL = 'http://98.83.39.194:4002';
const DOCTOR_URL  = 'http://98.83.39.194:4003';
const APPT_URL    = 'http://98.83.39.194:4004';

// Helper: attach Bearer token
const withAuth = (config = {}) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  }
  return config;
};

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => axios.post(`${AUTH_URL}/api/auth/register`, data),
  login:    (data) => axios.post(`${AUTH_URL}/api/auth/login`, data),
};

// ── Patient ───────────────────────────────────────────────────────────────
export const patientApi = {
  create: (data) => axios.post(`${PATIENT_URL}/api/patients`, data, withAuth()),
  getMe:  ()     => axios.get(`${PATIENT_URL}/api/patients/me`, withAuth()),
};

// ── Doctor ────────────────────────────────────────────────────────────────
export const doctorApi = {
  add:    (data) => axios.post(`${DOCTOR_URL}/api/doctors`, data, withAuth()),
  getAll: (params) => axios.get(`${DOCTOR_URL}/api/doctors`, { params }),
  getById:(id)   => axios.get(`${DOCTOR_URL}/api/doctors/${id}`),
};

// ── Appointment ───────────────────────────────────────────────────────────
export const appointmentApi = {
  // Patient
  book:    (data) => axios.post(`${APPT_URL}/api/appointments`, data, withAuth()),
  getMine: ()     => axios.get(`${APPT_URL}/api/appointments/me`, withAuth()),
  cancel:  (id)   => axios.patch(`${APPT_URL}/api/appointments/${id}/cancel`, {}, withAuth()),
  // Doctor
  getDoctorAppointments: () => axios.get(`${APPT_URL}/api/appointments/doctor/mine`, withAuth()),
  accept: (id) => axios.patch(`${APPT_URL}/api/appointments/${id}/accept`, {}, withAuth()),
  reject: (id) => axios.patch(`${APPT_URL}/api/appointments/${id}/reject`, {}, withAuth()),
};
