import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PATIENT_LINKS = [
  { to: '/dashboard',    label: 'Dashboard' },
  { to: '/doctors',      label: 'Doctors' },
  { to: '/book',         label: 'Book Appointment' },
  { to: '/appointments', label: 'Appointments' },
];

const DOCTOR_LINKS = [
  { to: '/doctor/appointments', label: 'My Appointments' },
];

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isDoctor = user?.role === 'doctor';
  const links    = isDoctor ? DOCTOR_LINKS : PATIENT_LINKS;

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        <span className="brand-icon">🏥</span>
        CareSync
        {isDoctor && (
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              background: '#dcfce7',
              color: '#15803d',
              borderRadius: 999,
              padding: '2px 8px',
              marginLeft: 6,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Doctor
          </span>
        )}
      </NavLink>

      {isAuthenticated && (
        <div className="navbar-nav">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {label}
            </NavLink>
          ))}

          <div className="divider" />

          {/* User avatar */}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: isDoctor ? '#16a34a' : 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}
            title={user?.email}
          >
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>

          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
