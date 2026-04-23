import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appointmentApi } from '../api';

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'rejected', 'completed', 'cancelled'];

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [filter, setFilter]             = useState('all');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await appointmentApi.getMine();
      setAppointments(res.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to load appointments. Please ensure you are logged in.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setCancellingId(id);
    try {
      await appointmentApi.cancel(id);
      setAppointments(prev =>
        prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a)
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const countFor = (s) => appointments.filter(a => a.status === s).length;

  const filtered = filter === 'all'
    ? appointments
    : appointments.filter(a => a.status === filter);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading appointments…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div
          className="page-header animate-fade"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}
        >
          <div>
            <h1>My <span style={{ color: 'var(--color-primary)' }}>Appointments</span></h1>
            <p>Track and manage your healthcare bookings</p>
          </div>
          <Link to="/book" className="btn btn-primary" style={{ marginBottom: 8 }}>
            + New Appointment
          </Link>
        </div>

        {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}

        {/* Status Filter Tabs */}
        <div className="tab-nav animate-fade">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              className={`tab-btn ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {s !== 'all' && (
                <span
                  style={{
                    marginLeft: 5,
                    background: filter === s ? '#dbeafe' : '#f1f5f9',
                    color: filter === s ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
                    borderRadius: 999,
                    padding: '1px 7px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}
                >
                  {countFor(s)}
                </span>
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card empty-state animate-fade">
            <div className="empty-state-icon">📭</div>
            <h3>No {filter !== 'all' ? filter : ''} appointments</h3>
            <p>
              {filter === 'all'
                ? "You haven't booked any appointments yet"
                : `No ${filter} appointments found`}
            </p>
            <Link to="/book" className="btn btn-primary btn-sm" style={{ marginTop: 14 }}>
              Book Appointment
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered
              .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
              .map((appt, i) => (
                <div
                  key={appt._id}
                  className={`appointment-card animate-fade stagger-${(i % 4) + 1}`}
                >
                  <div className="appointment-header">
                    <div>
                      <div className="appointment-doctor">Dr. {appt.doctorName}</div>
                      <div className="appointment-spec">{appt.specialization}</div>
                    </div>
                    <span className={`badge badge-${appt.status}`}>{appt.status}</span>
                  </div>

                  <div className="appointment-details">
                    <span className="appointment-detail">
                      <span className="appointment-detail-icon">📅</span>
                      {new Date(appt.appointmentDate).toLocaleDateString('en-US', {
                        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </span>
                    <span className="appointment-detail">
                      <span className="appointment-detail-icon">🕐</span>
                      {appt.timeSlot}
                    </span>
                  </div>

                  {appt.reason && (
                    <div
                      style={{
                        fontSize: '0.84rem',
                        color: 'var(--color-text-secondary)',
                        background: 'var(--color-bg-secondary)',
                        padding: '9px 13px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <strong style={{ color: 'var(--color-text)' }}>Reason: </strong>
                      {appt.reason}
                    </div>
                  )}

                  {['pending', 'confirmed'].includes(appt.status) && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(appt._id)}
                        disabled={cancellingId === appt._id}
                      >
                        {cancellingId === appt._id ? 'Cancelling…' : 'Cancel Appointment'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
