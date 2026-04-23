import React, { useEffect, useState } from 'react';
import { doctorApi } from '../api';

const DoctorsPage = () => {
  const [doctors, setDoctors]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [filterSpec, setFilterSpec] = useState('');

  useEffect(() => {
    setLoading(true);
    doctorApi.getAll(filterSpec ? { specialization: filterSpec } : {})
      .then(res => setDoctors(res.data.data || []))
      .catch(() => setError('Could not load doctors. Please try again.'))
      .finally(() => setLoading(false));
  }, [filterSpec]);

  const specializations = [...new Set(doctors.map(d => d.specialization))].filter(Boolean).sort();

  const filtered = doctors.filter(d =>
    `${d.fullName} ${d.specialization}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="loading-container"><div className="spinner" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">

        <div className="page-header animate-fade">
          <h1>Our <span style={{ color: 'var(--color-primary)' }}>Doctors</span></h1>
          <p>Browse our network of verified healthcare specialists</p>
        </div>

        {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}

        {/* Search & Filter */}
        <div className="card mb-6 animate-fade" style={{ padding: '14px 18px' }}>
          <div className="grid-2" style={{ gap: 12 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name or specialization…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="form-select"
              value={filterSpec}
              onChange={e => setFilterSpec(e.target.value)}
            >
              <option value="">All Specializations</option>
              {specializations.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card empty-state animate-fade">
            <div className="empty-state-icon">🔍</div>
            <h3>No doctors found</h3>
            <p>Try a different search or filter</p>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map((doctor, i) => (
              <div key={doctor._id} className={`doctor-card animate-fade stagger-${(i % 4) + 1}`} style={{ cursor: 'default' }}>

                {/* Doctor Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <div className="doctor-avatar">{doctor.fullName.charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="doctor-name">Dr. {doctor.fullName}</div>
                    <div className="doctor-spec">{doctor.specialization}</div>
                  </div>
                </div>

                {/* Meta */}
                <div className="doctor-meta">
                  {doctor.experience > 0 && (
                    <span className="doctor-meta-item">🩺 {doctor.experience} yrs exp</span>
                  )}
                  {doctor.consultationFee > 0 && (
                    <span className="doctor-meta-item">💰 ₹{doctor.consultationFee}</span>
                  )}
                  {doctor.availableDays?.length > 0 && (
                    <span className="doctor-meta-item">
                      📅 {doctor.availableDays.slice(0, 3).map(d => d.slice(0, 3)).join(', ')}
                      {doctor.availableDays.length > 3 ? '…' : ''}
                    </span>
                  )}
                </div>

                {/* Qualifications */}
                {doctor.qualifications?.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {doctor.qualifications.map(q => (
                      <span
                        key={q}
                        style={{
                          background: 'var(--color-primary-bg)',
                          border: '1px solid #bfdbfe',
                          borderRadius: 999,
                          padding: '2px 9px',
                          fontSize: '0.7rem',
                          color: 'var(--color-primary-dark)',
                          fontWeight: 500,
                        }}
                      >
                        {q}
                      </span>
                    ))}
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

export default DoctorsPage;
