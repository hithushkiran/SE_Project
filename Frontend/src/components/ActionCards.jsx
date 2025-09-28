import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ActionCards.css';

const ActionCards = () => {
  const navigate = useNavigate();
  
  const cards = [
    {
      title: 'Explore papers',
      description: 'Discover trending research and academic papers',
      icon: '📄',
      color: '#4285f4',
      onClick: () => navigate('/explore')
    },
    {
      title: 'Summarize',
      description: 'Get AI-powered summaries of research papers',
      icon: '📝',
      color: '#34a853',
      onClick: () => console.log('Summarize clicked')
    },
    {
      title: 'Publish',
      description: 'Share your research with the community',
      icon: '🚀',
      color: '#ea4335',
      onClick: () => console.log('Publish clicked')
    },
    {
      title: 'About Us',
      description: 'Learn more about ResearchHub and our mission',
      icon: 'ℹ️',
      color: '#fbbc04',
      onClick: () => console.log('About Us clicked')
    }
  ];

  return (
    <div className="action-cards">
      <div className="cards-grid">
        {cards.map((card, index) => (
          <div key={index} className="action-card" onClick={card.onClick}>
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