import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AdminLoginPage.css';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    try {
      setLoading(true);
      await login(formData.email, formData.password);
      navigate('/admin');
    } catch (err: any) {
      // Prefer backend-provided message when available (ApiResponse.message)
      const backendMessage = err?.response?.data?.message || err?.response?.data?.message || err?.response?.data?.error || err?.response?.data?.message;
      setError(backendMessage || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <div className="admin-logo">
            <div className="admin-icon">⚙️</div>
            <h1>Admin Login</h1>
          </div>
          <p className="admin-subtitle">
            Sign in to access the ResearchHub admin panel
          </p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

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
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            className="admin-login-btn"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In to Admin Panel'}
          </button>
        </form>

        <div className="admin-login-footer">
          {/* Development quick-login removed to avoid exposing credentials in the UI. */}
          <Link to="/" className="back-to-site">
            ← Back to ResearchHub
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
