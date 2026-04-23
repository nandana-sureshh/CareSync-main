import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorApi, appointmentApi } from '../api';

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const [step, setStep]                     = useState(1);
  const [doctors, setDoctors]               = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form, setForm]                     = useState({ appointmentDate: '', timeSlot: '', reason: '' });
  const [loading, setLoading]               = useState(false);
  const [fetchingDoctors, setFetchingDoctors] = useState(true);
  const [error, setError]                   = useState('');
  const [success, setSuccess]               = useState('');

  useEffect(() => {
    doctorApi.getAll()
      .then(res => setDoctors(res.data.data || []))
      .catch(() => setError('Could not load doctors. Please try again.'))
      .finally(() => setFetchingDoctors(false));
  }, []);

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setStep(2);
    setError('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.appointmentDate || !form.timeSlot) return setError('Date and time slot are required');

    setLoading(true);
    setError('');
    try {
      await appointmentApi.book({
        doctorId: selectedDoctor._id,
        appointmentDate: form.appointmentDate,
        timeSlot: form.timeSlot,
        reason: form.reason,
      });
      setSuccess('Appointment booked successfully! Status: pending');
      setTimeout(() => navigate('/appointments'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page-wrapper">
      <div className="container">

        <div className="page-header animate-fade">
          <h1>Book an <span style={{ color: 'var(--color-primary)' }}>Appointment</span></h1>
          <p>{step === 1 ? 'Select a doctor to get started' : `Booking with Dr. ${selectedDoctor?.fullName}`}</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          {['Select Doctor', 'Set Date & Time'].map((label, i) => {
            const n = i + 1;
            const active = step === n;
            const done = step > n;
            return (
              <React.Fragment key={n}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.78rem', fontWeight: 700, flexShrink: 0,
                    background: done ? 'var(--color-accent)' : active ? 'var(--color-primary)' : 'var(--color-border)',
                    color: (active || done) ? '#fff' : 'var(--color-text-muted)',
                  }}>
                    {done ? '✓' : n}
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: active ? 700 : 400, color: active ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                    {label}
                  </span>
                </div>
                {i < 1 && <div style={{ flex: 1, height: 2, background: step > 1 ? 'var(--color-primary)' : 'var(--color-border)', borderRadius: 1 }} />}
              </React.Fragment>
            );
          })}
        </div>

        {error   && <div className="alert alert-error"><span>⚠️</span> {error}</div>}
        {success && <div className="alert alert-success"><span>✅</span> {success}</div>}

        {/* Step 1 — Select Doctor */}
        {step === 1 && (
          <div className="animate-fade">
            {fetchingDoctors ? (
              <div className="loading-container"><div className="spinner" /></div>
            ) : doctors.length === 0 ? (
              <div className="card empty-state">
                <div className="empty-state-icon">👨‍⚕️</div>
                <h3>No doctors available</h3>
                <p>Please check back later</p>
              </div>
            ) : (
              <div className="grid-3">
                {doctors.map((doctor, i) => (
                  <div
                    key={doctor._id}
                    className={`doctor-card animate-fade stagger-${(i % 4) + 1} ${selectedDoctor?._id === doctor._id ? 'selected' : ''}`}
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                      <div className="doctor-avatar">{doctor.fullName.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="doctor-name">Dr. {doctor.fullName}</div>
                        <div className="doctor-spec">{doctor.specialization}</div>
                      </div>
                    </div>
                    <div className="doctor-meta">
                      {doctor.experience > 0 && <span className="doctor-meta-item">🩺 {doctor.experience} yrs</span>}
                      {doctor.consultationFee > 0 && <span className="doctor-meta-item">💰 ₹{doctor.consultationFee}</span>}
                    </div>
                    <div style={{ marginTop: 14, fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 600, textAlign: 'center' }}>
                      Click to select →
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2 — Date, Time, Reason */}
        {step === 2 && selectedDoctor && (
          <div className="animate-fade">

            {/* Selected Doctor Summary */}
            <div className="card mb-6" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="doctor-avatar">{selectedDoctor.fullName.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="doctor-name">Dr. {selectedDoctor.fullName}</div>
                  <div className="doctor-spec">{selectedDoctor.specialization}</div>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => { setStep(1); setSelectedDoctor(null); }}>
                ← Change
              </button>
            </div>

            <div className="card" style={{ maxWidth: 540 }}>
              <form onSubmit={handleSubmit}>

                <div className="form-group">
                  <label className="form-label" htmlFor="appt-date">
                    Appointment Date <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    id="appt-date"
                    type="date"
                    name="appointmentDate"
                    className="form-input"
                    value={form.appointmentDate}
                    onChange={handleChange}
                    min={today}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Time Slot <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {TIME_SLOTS.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setForm({ ...form, timeSlot: slot })}
                        style={{
                          padding: '9px 6px',
                          borderRadius: 'var(--radius-sm)',
                          border: `1.5px solid ${form.timeSlot === slot ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          background: form.timeSlot === slot ? 'var(--color-primary-bg)' : '#fff',
                          color: form.timeSlot === slot ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          fontFamily: 'var(--font-family)',
                          transition: 'all 0.15s',
                        }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="appt-reason">Reason for Visit</label>
                  <textarea
                    id="appt-reason"
                    name="reason"
                    className="form-textarea"
                    placeholder="Briefly describe your symptoms or reason…"
                    value={form.reason}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={loading || !form.appointmentDate || !form.timeSlot}
                >
                  {loading ? 'Booking…' : '📅 Confirm Appointment'}
                </button>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BookAppointmentPage;
