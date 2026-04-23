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
  const [step, setStep]                   = useState(1);
  const [doctors, setDoctors]             = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form, setForm]                   = useState({ appointmentDate: '', timeSlot: '', reason: '' });
  const [loading, setLoading]             = useState(false);
  const [fetchingDoctors, setFetchingDoctors] = useState(true);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');

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
    if (!selectedDoctor) return setError('Please select a doctor first');
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
      setSuccess('Appointment booked successfully! Redirecting…');
      setTimeout(() => navigate('/appointments'), 1800);
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
          <p>Schedule a consultation with a specialist in minutes</p>
        </div>

        {/* Step Indicator */}
        <div className="card mb-6 animate-fade" style={{ padding: '18px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {['Select Doctor', 'Appointment Details'].map((label, i) => {
              const stepNum = i + 1;
              const isActive = step === stepNum;
              const isDone   = step > stepNum;
              return (
                <React.Fragment key={stepNum}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: isDone
                          ? 'var(--color-accent)'
                          : isActive
                          ? 'var(--color-primary)'
                          : 'var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: isActive || isDone ? '#fff' : 'var(--color-text-muted)',
                        flexShrink: 0,
                      }}
                    >
                      {isDone ? '✓' : stepNum}
                    </div>
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  {i < 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        background: step > 1 ? 'var(--color-primary)' : 'var(--color-border)',
                        margin: '0 14px',
                        borderRadius: 1,
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {error   && <div className="alert alert-error">  <span>⚠️</span> {error}   </div>}
        {success && <div className="alert alert-success"><span>✅</span> {success} </div>}

        {/* Step 1 — Select Doctor */}
        {step === 1 && (
          <div className="animate-fade">
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 18 }}>
              Choose a Doctor
            </h2>
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
                    className={`doctor-card animate-fade stagger-${(i % 4) + 1} ${
                      selectedDoctor?._id === doctor._id ? 'selected' : ''
                    }`}
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                      <div className="doctor-avatar">
                        {doctor.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="doctor-name">Dr. {doctor.fullName}</div>
                        <div className="doctor-spec">{doctor.specialization}</div>
                      </div>
                    </div>
                    <div className="doctor-meta">
                      {doctor.experience > 0 && (
                        <span className="doctor-meta-item">🩺 {doctor.experience} yrs</span>
                      )}
                      {doctor.consultationFee > 0 && (
                        <span className="doctor-meta-item">💰 ₹{doctor.consultationFee}</span>
                      )}
                    </div>
                    <button
                      className="btn btn-primary btn-sm btn-full"
                      style={{ marginTop: 14 }}
                      onClick={() => handleDoctorSelect(doctor)}
                    >
                      Select →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2 — Details */}
        {step === 2 && selectedDoctor && (
          <div className="animate-fade">
            {/* Selected Doctor Banner */}
            <div className="card mb-6" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="doctor-avatar">{selectedDoctor.fullName.charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="doctor-name">Dr. {selectedDoctor.fullName}</div>
                    <div className="doctor-spec">{selectedDoctor.specialization}</div>
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setStep(1); setSelectedDoctor(null); }}
                >
                  ← Change
                </button>
              </div>
            </div>

            <div className="card" style={{ maxWidth: 540 }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 22 }}>
                Appointment Details
              </h2>
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
                          transition: 'all 0.15s',
                          fontFamily: 'var(--font-family)',
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
                    placeholder="Briefly describe your symptoms or reason for this appointment…"
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
