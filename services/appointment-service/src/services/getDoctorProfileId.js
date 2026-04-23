const axios = require('axios');

/**
 * Given a doctor's login email, calls doctor-service to find their
 * profile document _id. This bridges the auth user _id and the
 * doctor-service profile _id.
 *
 * Returns the doctorId string or throws a structured error.
 */
const getDoctorProfileId = async (email) => {
  try {
    const response = await axios.get(
      `${process.env.DOCTOR_SERVICE_URL}/api/doctors/by-email/${encodeURIComponent(email)}`,
      { timeout: 5000 }
    );
    return String(response.data.data._id);
  } catch (err) {
    if (err.response?.status === 404) {
      throw { status: 404, message: 'Doctor profile not found for this account' };
    }
    throw { status: 502, message: 'Doctor service unavailable' };
  }
};

module.exports = getDoctorProfileId;
