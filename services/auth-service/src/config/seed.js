const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Seeds doctor user accounts so they can log in.
 * Credentials: email from doctor-service seed, password = "Doctor@123"
 * This runs once on startup; skips if doctor users already exist.
 */
const DOCTOR_ACCOUNTS = [
  { email: 'priya.sharma@caresync.com',  role: 'doctor' },
  { email: 'rajesh.kumar@caresync.com',  role: 'doctor' },
  { email: 'anitha.menon@caresync.com',  role: 'doctor' },
  { email: 'suresh.nair@caresync.com',   role: 'doctor' },
  { email: 'deepa.pillai@caresync.com',  role: 'doctor' },
  { email: 'arjun.bose@caresync.com',    role: 'doctor' },
];

const DEFAULT_DOCTOR_PASSWORD = 'Doctor@123';

const seedDoctorAccounts = async () => {
  const existingCount = await User.countDocuments({ role: 'doctor' });
  if (existingCount > 0) {
    console.log(`[Auth] Doctor seed skipped — ${existingCount} doctor accounts already exist.`);
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(DEFAULT_DOCTOR_PASSWORD, salt);

  const docs = DOCTOR_ACCOUNTS.map(d => ({
    email: d.email,
    password: hashedPassword,
    role: 'doctor',
  }));

  // insertMany bypasses the pre-save hook, so we pre-hash above
  await User.insertMany(docs);
  console.log(`[Auth] Seeded ${docs.length} doctor accounts (password: ${DEFAULT_DOCTOR_PASSWORD})`);
};

module.exports = seedDoctorAccounts;
