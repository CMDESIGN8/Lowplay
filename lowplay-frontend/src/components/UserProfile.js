import React from 'react';
import './UserProfile.css';

const UserProfile = ({ user }) => {
  if (!user) return null;

  const getBadge = (level) => {
    switch (level) {
      case 'Bronce': return '🥉';
      case 'Plata': return '🥈';
      case 'Oro': return '🥇';
      default: return '';
    }
  };

  return (
    <div className="user-profile-card">
      <div className="user-avatar">
        <img src={user.avatar || '/default-avatar.png'} alt="avatar" />
      </div>
      <div className="user-info">
        <h2>Bienvenido, {user.username}</h2>
        <p className="user-level">{getBadge(user.level)} Ranked {user.level}</p>
        <div className="lowcoins-display">
  <i className={`fas fa-coins lowcoins-icon animated-coin coin-${user.level.toLowerCase()}`}></i>
  <span className="lowcoins-count">{user.lowcoins} Lowcoins</span>
</div>



<div className="progress-bar">
  <div
    className="progress-fill"
    style={{ width: `${user.progress || 0}%` }}
  >
    <span className="progress-text">{user.progress || 0}%</span>
  </div>
</div></div></div>
  );
};

export default UserProfile;
