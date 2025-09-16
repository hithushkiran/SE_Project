import React, { useState } from 'react';
import ProfileHeader from './ProfileHeader';
import StatsGrid from './StatsGrid';
import NavigationTabs from './NavigationTabs';
import './ProfilePage.css';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="profile-page">
      <div className="profile-container">
        <ProfileHeader />
        <StatsGrid />
        <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default ProfilePage;