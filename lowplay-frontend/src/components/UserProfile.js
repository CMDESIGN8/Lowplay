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
        <p className="user-level">{getBadge(user.level)} {user.level}</p>
        <div className="lowcoins-display">
  <i className={`fas fa-coins lowcoins-icon animated-coin coin-${user.level.toLowerCase()}`}></i>
  <span className="lowcoins-count">{user.lowcoins} Lowcoins</span>
</div>



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
