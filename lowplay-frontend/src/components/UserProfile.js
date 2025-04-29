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
        <div className="lowcoins-display">
  <i className={`fas fa-coins lowcoins-icon animated-coin coin-${level.toLowerCase()}`}></i>
  <span className="lowcoins-count">{user.lowcoins} Lowcoins</span>
</div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${user.progress || 0}%` }}
          ></div>
        </div>
        <small>Progreso: {user.progress || 0}%</small>

        <div className="edit-profile-button-container">
              <button className="edit-profile-button" onClick={() => setShowEditModal(true)}>
                <i className="fas fa-user-edit"></i> Editar Perfil
              </button>
            </div>
      </div>
    </div>
  );
};

export default UserProfile;
