import axios from 'axios';

// ── Strict env var validation ─────────────────────────────────────────────────
// No fallbacks. Missing vars at build time = clear console error.
const AUTH_URL    = process.env.REACT_APP_AUTH_URL;
const PATIENT_URL = process.env.REACT_APP_PATIENT_URL;
const DOCTOR_URL  = process.env.REACT_APP_DOCTOR_URL;
const APPT_URL    = process.env.REACT_APP_APPOINTMENT_URL;

const required = {
  REACT_APP_AUTH_URL:         AUTH_URL,
  REACT_APP_PATIENT_URL:      PATIENT_URL,
  REACT_APP_DOCTOR_URL:       DOCTOR_URL,
  REACT_APP_APPOINTMENT_URL:  APPT_URL,
};

Object.entries(required).forEach(([key, val]) => {
  if (!val) {
    console.error(`[CareSync] Missing required environment variable: ${key}`);
  }
});

// ── Auth helper ───────────────────────────────────────────────────────────────
const withAuth = (config = {}) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  }
  return config;
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => axios.post(`${AUTH_URL}/api/auth/register`, data),
  login:    (data) => axios.post(`${AUTH_URL}/api/auth/login`, data),
};

// ── Patient ───────────────────────────────────────────────────────────────────
export const patientApi = {
  create: (data) => axios.post(`${PATIENT_URL}/api/patients`, data, withAuth()),
  getMe:  ()     => axios.get(`${PATIENT_URL}/api/patients/me`, withAuth()),
};

// ── Doctor ────────────────────────────────────────────────────────────────────
export const doctorApi = {
  add:     (data) => axios.post(`${DOCTOR_URL}/api/doctors`, data, withAuth()),
  getAll:  (params) => axios.get(`${DOCTOR_URL}/api/doctors`, { params }),
  getById: (id)   => axios.get(`${DOCTOR_URL}/api/doctors/${id}`),
};

// ── Appointment ───────────────────────────────────────────────────────────────
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
