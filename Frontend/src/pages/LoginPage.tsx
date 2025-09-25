import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const Logo = () => (
  <div className="brand">
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#3b82f6" d="M9 2h6v2l-3 5 5 9c.3.54-.1 1.2-.73 1.2H7.73c-.63 0-1.03-.66-.73-1.2l5-9-3-5z"/>
    </svg>
    <span className="brand-text">Research<span className="bold">Hub</span></span>
  </div>
);

const Card = ({ title, position }: { title: string; position: string }) => (
  <div className={`card card-${position}`}>
    <div className="card-tab">
      <span className="tab-icon">{title === 'Fund' ? '🧪' : title === 'Earn' ? '🏅' : '📚'}</span>
      <span className="tab-text">{title}</span>
    </div>
    <div className="card-body"></div>
  </div>
);

interface ModalProps {
  mode: 'login' | 'signup';
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ mode, onClose }) => {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, fullName);
      }
      onClose();
    } catch (error) {
      console.error('Authentication error:', error);
      alert(mode === 'login' ? 'Login failed. Please check your credentials.' : 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{mode === 'login' ? 'Log in' : 'Sign up'}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        
        <form className="modal-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="input-row">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Enter your full name"
              />
            </div>
          )}
          
          <div className="input-row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          
          <div className="input-row">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="modal-primary" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
};

const LoginPage: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'login' | 'signup' | null>(null);

  return (
    <div className="page">
      <header className="navbar">
        <Logo />
        <div className="nav-actions">
          <button className="link-btn" onClick={() => setActiveModal('login')}>Log in</button>
          <button className="signup-btn" onClick={() => setActiveModal('signup')}>Sign up</button>
        </div>
      </header>
      
      <main className="hero">
        <section className="hero-left">
          <h1>A new economy for science</h1>
          <p>We're building a new model for scientific research where publishing and peer review lead to funding.</p>
          <div className="cta-buttons">
            <button className="primary-btn" onClick={() => setActiveModal('signup')}>Sign up</button>
            <button className="secondary-btn" onClick={() => window.location.assign('/dashboard')}>Guest mode</button>
          </div>
          <p className="tagline">Start earning for open science today.</p>
        </section>
        
        <section className="hero-right">
          <div className="card-stack">
            <Card title="Fund" position="back" />
            <Card title="Earn" position="mid" />
            <Card title="Publish" position="front" />
          </div>
        </section>
      </main>

      {activeModal && (
        <Modal mode={activeModal} onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
};

export default LoginPage;