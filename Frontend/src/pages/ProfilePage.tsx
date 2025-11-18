import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EditProfileModal from '../components/EditProfileModal';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Remove unnecessary tabs and stats for now - keep it simple
  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header Section */}
        <div className="profile-header-simple">
          <div className="profile-avatar-section">
            <div className="avatar-large">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} />
              ) : (
                <span>{user?.fullName?.charAt(0).toUpperCase() || 'U'}</span>
              )}
            </div>
            <button 
              className="edit-profile-btn"
              onClick={() => setIsEditModalOpen(true)}
            >
              ✏️ Edit Profile
            </button>
          </div>
          
          <div className="profile-info-section">
            <h1 className="profile-name">{user?.fullName || 'User'}</h1>
            {user?.affiliation && (
              <p className="profile-affiliation">{user.affiliation}</p>
            )}
            {user?.email && (
              <p className="profile-email">📧 {user.email}</p>
            )}
            {user?.bio && (
              <div className="profile-bio">
                <h3>About</h3>
                <p>{user.bio}</p>
              </div>
            )}
            {user?.website && (
              <div className="profile-website">
                <h3>Website</h3>
                <a href={user.website} target="_blank" rel="noopener noreferrer">
                  {user.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Simple Stats Section */}
        <div className="profile-stats-simple">
          <div className="stat-item">
            <span className="stat-number">0</span>
            <span className="stat-label">Publications</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">0</span>
            <span className="stat-label">Reviews</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">0</span>
            <span className="stat-label">Contributions</span>
          </div>
        </div>

        {/* My Publications Section */}
        <div className="profile-actions-section">
          <button 
            className="my-publications-btn"
            onClick={() => navigate('/my-publications')}
          >
            📚 My Publications
          </button>
        </div>

        {/* Edit Profile Modal */}
        <EditProfileModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default ProfilePage;