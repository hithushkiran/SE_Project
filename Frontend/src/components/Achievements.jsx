import React from 'react';
import { Trophy } from 'lucide-react';
import './Achievements.css';

const Achievements = () => {
  return (
    <div className="achievements-card">
      <h2 className="achievements-title">ACHIEVEMENTS</h2>
      <div className="achievements-content">
        <div className="trophy-icon">
          <Trophy className="trophy" />
        </div>
        <p className="achievements-text">
          This user has not unlocked any achievements yet.
        </p>
      </div>
    </div>
  );
};

export default Achievements;