import React from 'react';
import './UserProfile.css';

const UserProfile = ({ user }) => {
  const getBadge = (level) => {
    if (!level) return '';
    switch (level.toLowerCase().trim()) {
      case 'Bronce': return 'B';
      case 'Plata': return 'P';
      case 'Oro': return 'O';
      case 'Platino': return 'D';
      case 'Esmeralda': return 'P';
      case 'Elite': return 'E';
      default: return 'LEVEL';
    }
  };

  const normalizedLevel = user.level?.toLowerCase();

  return (
    <div className="user-profile-card">
      <div className="user-avatar">
        <img src={user.avatar || '/assets/avatars/mateo.png'} alt="avatar" />
        {getBadge(user.level) && (
          <div className="avatar-badge">{getBadge(user.level)}</div>
        )}
      </div>

      <div className="user-info">
        <h2>Bienvenido, {user.username}</h2>
        <p className="user-level">Ranked {user.level}</p>

        <div className="lowcoins-display">
          <i className={`fas fa-coins lowcoins-icon animated-coin coin-${normalizedLevel}`}></i>
          <span className="lowcoins-count">{user.lowcoins} Lowcoins</span>
        </div>

        <div className="wallet-email-info">
          <p>Wallet: {user.wallet}</p>
          <p>Email: {user.email}</p>
        </div>

        <div className="progress-bar">
          <div
            className={`progress-fill ${normalizedLevel}`}
            style={{ width: `${user.progress || 0}%` }}
          >
            <span className="progress-text">{user.progress || 0}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;