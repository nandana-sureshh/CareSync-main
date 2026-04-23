import React, { useEffect, useState } from 'react';
import { appointmentApi } from '../api';

const STATUS_STYLES = {
  pending:   { background: '#fef3c7', color: '#92400e' },
  confirmed: { background: '#dcfce7', color: '#14532d' },
  rejected:  { background: '#fee2e2', color: '#7f1d1d' },
  cancelled: { background: '#f1f5f9', color: '#475569' },
  completed: { background: '#eff6ff', color: '#1d4ed8' },
};

const DoctorDashboardPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [actionId, setActionId]         = useState(null); // id currently being accepted/rejected

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await appointmentApi.getDoctorAppointments();
      setAppointments(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleAction = async (id, action) => {
    setActionId(id);
    try {
      const res = action === 'accept'
        ? await appointmentApi.accept(id)
        : await appointmentApi.reject(id);
      // Update local state immediately for instant feedback
      setAppointments(prev =>
        prev.map(a => a._id === id ? { ...a, status: res.data.data.status } : a)
      );
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} appointment`);
    } finally {
      setActionId(null);
    }
  };

  const pending   = appointments.filter(a => a.status === 'pending').length;
  const confirmed = appointments.filter(a => a.status === 'confirmed').length;

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading your appointments…</p>
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
          <h1>My <span style={{ color: 'var(--color-primary)' }}>Appointments</span></h1>
          <p>Review and manage appointment requests from patients</p>
        </div>

        {/* Stats row */}
        <div className="stats-grid animate-fade" style={{ marginBottom: 28 }}>
          {[
            { icon: '📋', value: appointments.length, label: 'Total' },
            { icon: '⏳', value: pending,             label: 'Pending Review' },
            { icon: '✅', value: confirmed,            label: 'Confirmed' },
          ].map((s, i) => (
            <div key={i} className={`stat-card stagger-${i + 1}`}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}

        {appointments.length === 0 ? (
          <div className="card empty-state animate-fade">
            <div className="empty-state-icon">📭</div>
            <h3>No appointments yet</h3>
            <p>Patients haven't booked with you yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {appointments
              .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
              .map((appt, i) => {
                const isPending = appt.status === 'pending';
                const statusStyle = STATUS_STYLES[appt.status] || {};

                return (
                  <div
                    key={appt._id}
                    className={`card animate-fade stagger-${(i % 4) + 1}`}
                    style={{ padding: '20px 24px' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: 12,
                      }}
                    >
                      {/* Patient & appointment info */}
                      <div style={{ flex: 1, minWidth: 220 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            marginBottom: 10,
                          }}
                        >
                          {/* Patient avatar */}
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              background: '#e0f2fe',
                              color: '#0369a1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '1rem',
                              flexShrink: 0,
                            }}
                          >
                            {appt.patientEmail?.[0]?.toUpperCase() || 'P'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                              {appt.patientEmail}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              Patient ID: {appt.patientId?.slice(-8)}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 14,
                            fontSize: '0.85rem',
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          <span>📅 {new Date(appt.appointmentDate).toLocaleDateString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                          })}</span>
                          <span>🕐 {appt.timeSlot}</span>
                        </div>

                        {appt.reason && (
                          <div
                            style={{
                              marginTop: 10,
                              fontSize: '0.84rem',
                              background: 'var(--color-bg-secondary)',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '8px 12px',
                              color: 'var(--color-text-secondary)',
                            }}
                          >
                            <strong style={{ color: 'var(--color-text)' }}>Reason: </strong>
                            {appt.reason}
                          </div>
                        )}
                      </div>

                      {/* Status + Action buttons */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: 10,
                          flexShrink: 0,
                        }}
                      >
                        {/* Status badge */}
                        <span
                          style={{
                            ...statusStyle,
                            borderRadius: 999,
                            padding: '4px 12px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'capitalize',
                          }}
                        >
                          {appt.status}
                        </span>

                        {/* Action buttons — only shown for pending */}
                        {isPending && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              className="btn btn-sm"
                              style={{
                                background: '#dcfce7',
                                color: '#15803d',
                                border: '1px solid #bbf7d0',
                                fontWeight: 700,
                              }}
                              onClick={() => handleAction(appt._id, 'accept')}
                              disabled={actionId === appt._id}
                            >
                              {actionId === appt._id ? '…' : '✓ Accept'}
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{
                                background: '#fee2e2',
                                color: '#b91c1c',
                                border: '1px solid #fecaca',
                                fontWeight: 700,
                              }}
                              onClick={() => handleAction(appt._id, 'reject')}
                              disabled={actionId === appt._id}
                            >
                              {actionId === appt._id ? '…' : '✕ Reject'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboardPage;
