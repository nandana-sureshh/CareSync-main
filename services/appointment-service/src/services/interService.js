const axios = require('axios');

/**
 * Validates a Bearer token by calling Auth Service.
 * Returns decoded user payload or throws.
 */
const validateAuthToken = async (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw { status: 401, message: 'No token provided' };
  }

  try {
    const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/api/auth/validate`, {
      headers: { authorization: authHeader },
      timeout: 5000,
    });
    return response.data.user;
  } catch (err) {
    const message =
      err.response?.data?.message || 'Token validation failed';
    throw { status: err.response?.status || 401, message };
  }
};

/**
 * Verifies a doctor exists in Doctor Service.
 * Returns doctor data or throws.
 */
const validateDoctorExists = async (doctorId) => {
  try {
    const response = await axios.get(
      `${process.env.DOCTOR_SERVICE_URL}/api/doctors/${doctorId}`,
      { timeout: 5000 }
    );
    return response.data.data;
  } catch (err) {
    if (err.response?.status === 404) {
      throw { status: 404, message: 'Doctor not found' };
    }
    throw { status: 502, message: 'Doctor service unavailable' };
  }
};

module.exports = { validateAuthToken, validateDoctorExists };
