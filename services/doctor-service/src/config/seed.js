const Doctor = require('../models/Doctor');

const SEED_DOCTORS = [
  {
    fullName: 'Priya Sharma',
    specialization: 'Cardiologist',
    qualifications: ['MBBS', 'MD (Cardiology)'],
    experience: 12,
    phone: '+91-9800000001',
    email: 'priya.sharma@caresync.com',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    consultationFee: 800,
  },
  {
    fullName: 'Rajesh Kumar',
    specialization: 'Orthopedic Surgeon',
    qualifications: ['MBBS', 'MS (Ortho)'],
    experience: 15,
    phone: '+91-9800000002',
    email: 'rajesh.kumar@caresync.com',
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    consultationFee: 1000,
  },
  {
    fullName: 'Anitha Menon',
    specialization: 'Dermatologist',
    qualifications: ['MBBS', 'MD (Dermatology)'],
    experience: 9,
    phone: '+91-9800000003',
    email: 'anitha.menon@caresync.com',
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    consultationFee: 600,
  },
  {
    fullName: 'Suresh Nair',
    specialization: 'General Physician',
    qualifications: ['MBBS', 'PGDM'],
    experience: 20,
    phone: '+91-9800000004',
    email: 'suresh.nair@caresync.com',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    consultationFee: 400,
  },
  {
    fullName: 'Deepa Pillai',
    specialization: 'Pediatrician',
    qualifications: ['MBBS', 'MD (Pediatrics)'],
    experience: 11,
    phone: '+91-9800000005',
    email: 'deepa.pillai@caresync.com',
    availableDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
    consultationFee: 700,
  },
  {
    fullName: 'Arjun Bose',
    specialization: 'Neurologist',
    qualifications: ['MBBS', 'DM (Neurology)'],
    experience: 14,
    phone: '+91-9800000006',
    email: 'arjun.bose@caresync.com',
    availableDays: ['Tuesday', 'Thursday', 'Friday'],
    consultationFee: 1200,
  },
];

const seedDoctors = async () => {
  const count = await Doctor.countDocuments();
  if (count > 0) {
    console.log(`[Doctor] Seed skipped — ${count} doctors already exist.`);
    return;
  }

  await Doctor.insertMany(SEED_DOCTORS);
  console.log(`[Doctor] Seeded ${SEED_DOCTORS.length} doctors successfully.`);
};

module.exports = seedDoctors;
