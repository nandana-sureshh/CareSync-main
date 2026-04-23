import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentApi, doctorApi } from '../api';

const DashboardPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [apptError, setApptError]       = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [apptRes, docRes] = await Promise.allSettled([
        appointmentApi.getMine(),
        doctorApi.getAll(),
      ]);

      if (apptRes.status === 'fulfilled') {
        setAppointments(apptRes.value.data.data || []);
      } else {
        setApptError('Could not load appointments.');
      }

      if (docRes.status === 'fulfilled') {
        setDoctors(docRes.value.data.data || []);
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const total     = appointments.length;
  const upcoming  = appointments.filter(a => ['pending', 'confirmed'].includes(a.status));
  const cancelled = appointments.filter(a => a.status === 'cancelled').length;

  const nextThree = [...upcoming]
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
    .slice(0, 3);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading your dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="page-header animate-fade">
          <h1>
            Hello,{' '}
            <span style={{ color: 'var(--color-primary)' }}>
              {user?.email?.split('@')[0]}
            </span>{' '}
            👋
          </h1>
          <p>Here's your healthcare summary for today.</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { icon: '📅', value: total,             label: 'Total Appointments' },
            { icon: '⏳', value: upcoming.length,   label: 'Upcoming' },
            { icon: '🚫', value: cancelled,          label: 'Cancelled' },
            { icon: '👨‍⚕️', value: doctors.length,   label: 'Doctors Available' },
          ].map((s, i) => (
            <div key={i} className={`stat-card animate-fade stagger-${i + 1}`}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          {/* Upcoming Appointments */}
          <div>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}
            >
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Upcoming Appointments</h2>
              <Link to="/appointments" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                View all →
              </Link>
            </div>

            {apptError && (
              <div className="alert alert-error">⚠️ {apptError}</div>
            )}

            {nextThree.length === 0 && !apptError ? (
              <div className="card empty-state">
                <div className="empty-state-icon">📭</div>
                <h3>No upcoming appointments</h3>
                <p>Book your first appointment now</p>
                <Link to="/book" className="btn btn-primary btn-sm" style={{ marginTop: 14 }}>
                  Book Now
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {nextThree.map((appt, i) => (
                  <div key={appt._id} className={`appointment-card animate-fade stagger-${i + 1}`}>
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
                        {new Date(appt.appointmentDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                      </span>
                      <span className="appointment-detail">
                        <span className="appointment-detail-icon">🕐</span>
                        {appt.timeSlot}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16 }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { to: '/book',         icon: '📝', title: 'Book Appointment',  desc: 'Schedule with a specialist' },
                { to: '/doctors',      icon: '👨‍⚕️', title: 'View Doctors',      desc: 'Browse available doctors' },
                { to: '/appointments', icon: '📋', title: 'My Appointments',   desc: 'Track your bookings' },
              ].map((action, i) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className={`card animate-fade stagger-${i + 1}`}
                  style={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 20px',
                  }}
                >
                  <div
                    className="stat-icon"
                    style={{ fontSize: '1.2rem', flexShrink: 0 }}
                  >
                    {action.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 2, color: 'var(--color-text)' }}>
                      {action.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      {action.desc}
                    </div>
                  </div>
                  <span style={{ marginLeft: 'auto', color: 'var(--color-primary)', fontWeight: 700 }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
