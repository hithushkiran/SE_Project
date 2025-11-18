import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AdminSignupPage.css';

const AdminSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    adminCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.adminCode !== 'ADMIN2024') {
      setError('Invalid admin code');
      return;
    }

    try {
      setLoading(true);
      await register(formData.email, formData.password, formData.fullName);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-signup-page">
      <div className="admin-signup-container">
        <div className="admin-signup-header">
          <div className="admin-logo">
            <div className="admin-icon">⚙️</div>
            <h1>Admin Registration</h1>
          </div>
          <p className="admin-subtitle">
            Create an administrator account to access the ResearchHub admin panel
          </p>
        </div>

        <form className="admin-signup-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create a strong password"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="adminCode">Admin Code</label>
            <input
              type="text"
              id="adminCode"
              name="adminCode"
              value={formData.adminCode}
              onChange={handleChange}
              required
              placeholder="Enter admin access code"
            />
            <small className="form-hint">
              Contact system administrator for the admin code
            </small>
          </div>

          <button 
            type="submit" 
            className="admin-signup-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Admin Account'}
          </button>
        </form>

        <div className="admin-signup-footer">
          <p>
            Already have an admin account?{' '}
            <Link to="/admin/login" className="admin-login-link">
              Sign in here
            </Link>
          </p>
          <Link to="/" className="back-to-site">
            ← Back to ResearchHub
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminSignupPage;
