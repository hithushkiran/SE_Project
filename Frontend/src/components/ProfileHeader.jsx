import React from 'react';
import { Edit, Calendar, Globe, Github, Twitter } from 'lucide-react';
import './ProfileHeader.css';

const ProfileHeader = () => {
  return (
    <div className="profile-header">
      <div className="profile-header-content">
        <div className="profile-info">
          {/* Profile Picture */}
          <div className="profile-picture">
            <div className="avatar">
              Upload
            </div>
            <div className="completion-badge">
              20%
            </div>
          </div>
          
          {/* Profile Details */}
          <div className="profile-details">
            <h1 className="profile-name">User Name</h1>
            <p className="profile-status">Student</p>
            <div className="member-info">
              <Calendar className="icon" />
              <span>Member for just joined</span>
            </div>
            
            {/* Social Links */}
            <div className="social-links">
              <div className="social-link">
                <Globe className="social-icon" />
              </div>
              <div className="social-link">
                <Github className="social-icon" />
              </div>
              <div className="social-link">
                <Globe className="social-icon" />
              </div>
              <div className="social-link">
                <Twitter className="social-icon" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Edit Profile Button */}
        <button className="edit-button">
          <Edit className="edit-icon" />
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader;