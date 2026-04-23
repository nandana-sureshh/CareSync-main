require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedDoctors = require('./config/seed');
const doctorRoutes = require('./routes/doctorRoutes');

const app = express();
const PORT = process.env.PORT || 4003;

app.use(cors());
app.use(express.json());

app.use('/api/doctors', doctorRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'doctor-service' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('[Doctor] Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const start = async () => {
  await connectDB();
  await seedDoctors();
  app.listen(PORT, () => {
    console.log(`[Doctor Service] Running on port ${PORT}`);
  });
};

start();
