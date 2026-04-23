import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentApi } from '../api';

const DashboardPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentApi.getMine()
      .then(res => setAppointments(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter(a => ['pending', 'confirmed'].includes(a.status));

  return (
    <div className="page-wrapper">
      <div className="container">

        {/* Welcome */}
        <div className="page-header animate-fade">
          <h1>Hello, <span style={{ color: 'var(--color-primary)' }}>{user?.email?.split('@')[0]}</span> 👋</h1>
          <p>Manage your healthcare appointments from here.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid-3 animate-fade" style={{ marginBottom: 36 }}>
          {[
            { to: '/doctors',      icon: '👨‍⚕️', label: 'View Doctors',     desc: 'Browse available specialists' },
            { to: '/book',         icon: '📝', label: 'Book Appointment',  desc: 'Schedule a consultation' },
            { to: '/appointments', icon: '📋', label: 'My Appointments',   desc: 'Track your booking status' },
          ].map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              className={`card stagger-${i + 1}`}
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 16, padding: '20px 22px' }}
            >
              <div className="stat-icon" style={{ fontSize: '1.4rem', flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{item.desc}</div>
              </div>
              <span style={{ marginLeft: 'auto', color: 'var(--color-primary)', fontWeight: 700 }}>→</span>
            </Link>
          ))}
        </div>

        {/* Upcoming appointments preview */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>Upcoming Appointments</h2>

          {loading ? (
            <div className="loading-container"><div className="spinner" /></div>
          ) : upcoming.length === 0 ? (
            <div className="card empty-state animate-fade">
              <div className="empty-state-icon">📭</div>
              <h3>No upcoming appointments</h3>
              <p>Book an appointment to get started</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcoming
                .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
                .slice(0, 3)
                .map((appt, i) => (
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
              <div style={{ textAlign: 'right', marginTop: 4 }}>
                <Link to="/appointments" style={{ fontSize: '0.85rem', fontWeight: 600 }}>View all appointments →</Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
