import React from 'react';
import './ActionCards.css';

const ActionCards = () => {
  const cards = [
    {
      title: 'Explore papers',
      description: 'Discover trending research and academic papers',
      icon: '📄',
      color: '#4285f4'
    },
    {
      title: 'Summarize',
      description: 'Get AI-powered summaries of research papers',
      icon: '📝',
      color: '#34a853'
    },
    {
      title: 'Publish',
      description: 'Share your research with the community',
      icon: '🚀',
      color: '#ea4335'
    },
    {
      title: 'About Us',
      description: 'Learn more about ResearchHub and our mission',
      icon: 'ℹ️',
      color: '#fbbc04'
    }
  ];

  return (
    <div className="action-cards">
      <div className="cards-grid">
        {cards.map((card, index) => (
          <div key={index} className="action-card">
            <div className="card-icon" style={{ color: card.color }}>
              {card.icon}
            </div>
            <h3 className="card-title">{card.title}</h3>
            <p className="card-description">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionCards;