import React from 'react';
import ActivityContent from './ActivityContent';
import './NavigationTabs.css';

const NavigationTabs = ({ activeTab, setActiveTab }) => {
  const tabs = ['Overview', 'Publications', 'Peer Reviews', 'Comments', 'Bounties'];

  return (
    <div className="navigation-tabs-container">
      <div className="tabs-border">
        <nav className="tabs-nav">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      
      <ActivityContent />
    </div>
  );
};

export default NavigationTabs;

