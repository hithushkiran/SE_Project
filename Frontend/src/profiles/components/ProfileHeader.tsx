import React from 'react';
import { Edit, Calendar, Globe, Github, Twitter } from 'lucide-react';
import './ProfileHeader.css';

interface UserProfile {
  fullName: string;
  email: string;
  affiliation?: string;
  bio?: string;
  website?: string;
  avatarUrl?: string;
}

interface ProfileHeaderProps {
  profile: UserProfile;
  editing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onEdit: () => void;
  onSave: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, editing, onChange, onEdit, onSave }) => {
  return (
    <div className="profile-header">
      <div className="profile-header-content">
        <div className="profile-info">
          <div className="profile-picture">
            <div className="avatar">{profile.avatarUrl || 'Upload'}</div>
            <div className="completion-badge">20%</div>
          </div>

          <div className="profile-details">
            {editing ? (
              <>
                <input
                  className="profile-input"
                  name="fullName"
                  value={profile.fullName}
                  onChange={onChange}
                  placeholder="Full Name"
                />
                <input
                  className="profile-input"
                  name="affiliation"
                  value={profile.affiliation || ''}
                  onChange={onChange}
                  placeholder="Affiliation"
                />
                <textarea
                  className="profile-textarea"
                  name="bio"
                  value={profile.bio || ''}
                  onChange={onChange}
                  placeholder="Bio"
                />
                <input
                  className="profile-input"
                  name="website"
                  value={profile.website || ''}
                  onChange={onChange}
                  placeholder="Website"
                />
              </>
            ) : (
              <>
                <h1 className="profile-name">{profile.fullName}</h1>
                <p className="profile-status">{profile.affiliation || 'Student'}</p>
                {profile.bio && <p>{profile.bio}</p>}
                {profile.website && <p>{profile.website}</p>}
              </>
            )}

            <div className="member-info">
              <Calendar className="icon" />
              <span>Member for just joined</span>
            </div>

            <div className="social-links">
              <div className="social-link"><Globe className="social-icon" /></div>
              <div className="social-link"><Github className="social-icon" /></div>
              <div className="social-link"><Globe className="social-icon" /></div>
              <div className="social-link"><Twitter className="social-icon" /></div>
            </div>
          </div>
        </div>

        <button className="edit-button" onClick={editing ? onSave : onEdit}>
          <Edit className="edit-icon" />
          <span>{editing ? 'Save Profile' : 'Edit Profile'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader;
