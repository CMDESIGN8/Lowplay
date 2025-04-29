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
        <h2>{user.username}</h2>
        <p className="user-level">{getBadge(user.level)} {user.level}</p>
        <p className="user-coins">💰 {user.lowcoins} lowcoins</p>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${user.progress || 0}%` }}
          ></div>
        </div>
        <small>Progreso: {user.progress || 0}%</small>

        <button className="edit-button">Editar perfil</button>
      </div>
    </div>
  );
};

export default UserProfile;
