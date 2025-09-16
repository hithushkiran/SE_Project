import React from 'react';
import './KeyStats.css';

const KeyStats = () => {
  const stats = [
    { label: 'Upvotes received:', value: '0' },
    { label: 'Publications:', value: '0' },
    { label: 'Cites by:', value: '0' },
    { label: 'h-index:', value: '0' },
    { label: 'i10-index:', value: '0' }
  ];

  return (
    <div className="key-stats-card">
      <h2 className="key-stats-title">KEY STATS</h2>
      <div className="key-stats-content">
        {stats.map((stat, index) => (
          <div key={index} className="stat-item">
            <span className="stat-label">{stat.label}</span>
            <span className="stat-value">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyStats;