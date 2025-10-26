import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const Logo = () => (
  <div className="brand">
    <span className="brand-text">𝘴𝘺𝘯𝘵𝘩𝘦𝘴𝘪𝘴</span>
  </div>
);

const Card = ({ title, position, icon, description }: { title: string; position: string; icon: string; description: string }) => (
  <div className={`card card-${position}`}>
    <div className="card-tab">
      <span className="tab-icon">{icon}</span>
      <span className="tab-text">{title}</span>
    </div>
    <div className="card-body">
      <div className="card-content">
        <p className="card-description">{description}</p>
        <div className="card-visual">
          {title === 'Discover' && (
            <div className="search-visual">
              <div className="search-circle"></div>
              <div className="search-handle"></div>
            </div>
          )}
          {title === 'Collaborate' && (
            <div className="collab-visual">
              <div className="user-avatar"></div>
              <div className="user-avatar"></div>
              <div className="user-avatar"></div>
            </div>
          )}
          {title === 'Publish' && (
            <div className="publish-visual">
              <div className="paper-stack">
                <div className="paper"></div>
                <div className="paper"></div>
                <div className="paper"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
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
              onChange={(e) => {
                console.log('Password changed:', e.target.value);
                setPassword(e.target.value);
              }}
              required
              placeholder="••••••••"
              autoComplete="current-password"
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
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<'login' | 'signup' | null>(null);

  const handleAdminClick = () => {
    navigate('/admin/login');
  };

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
          <div className="hero-badge">
            <span className="badge-text">🔬 Advanced Research Platform</span>
          </div>
          <h1>Accelerate Scientific Discovery</h1>
          <p>Join the future of research collaboration. Discover papers, share insights, and connect with researchers worldwide on our intelligent platform.</p>
          <div className="hero-features">
            <div className="feature-item">
              <span className="feature-icon">🔍</span>
              <span>AI-Powered Search</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Smart Analytics</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🤝</span>
              <span>Global Network</span>
            </div>
          </div>
          <div className="cta-buttons">
            <button className="primary-btn" onClick={() => setActiveModal('signup')}>
              <span className="btn-icon">🚀</span>
              Start Your Journey
            </button>
            <button className="secondary-btn" onClick={() => window.location.assign('/dashboard')}>
              <span className="btn-icon">👁️</span>
              Explore as Guest
            </button>
          </div>
          <p className="tagline">Trusted by researchers from leading institutions worldwide</p>
        </section>
        
        <section className="hero-right">
          <div className="card-stack">
            <Card 
              title="Discover" 
              position="back" 
              icon="🔍" 
              description="Search through millions of research papers with AI-powered filtering and recommendations"
            />
            <Card 
              title="Collaborate" 
              position="mid" 
              icon="🤝" 
              description="Connect with researchers, share insights, and work together on groundbreaking projects"
            />
            <Card 
              title="Publish" 
              position="front" 
              icon="📄" 
              description="Share your research with the global scientific community and gain recognition"
            />
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">ResearchHub</h3>
            <p className="footer-description">Accelerating scientific discovery through intelligent collaboration</p>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">Discover Papers</a></li>
              <li><a href="#" className="footer-link">Collaborate</a></li>
              <li><a href="#" className="footer-link">Publish Research</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">Help Center</a></li>
              <li><a href="#" className="footer-link">Contact Us</a></li>
              <li><a href="#" className="footer-link">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">System</h4>
            <ul className="footer-links">
              <li>
                <a href="#" className="footer-link admin-link" onClick={handleAdminClick}>
                  Admin
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-copyright">© 2025 ResearchHub. All rights reserved.</p>
        </div>
      </footer>

      {activeModal && (
        <Modal mode={activeModal} onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
};

export default LoginPage;