import React from 'react';
import Achievements from './Achievements';
import KeyStats from './KeyStats';
import './StatsGrid.css';

const StatsGrid = () => {
  return (
    <div className="stats-grid">
      <Achievements />
      <KeyStats />
    </div>
  );
};

export default StatsGrid;