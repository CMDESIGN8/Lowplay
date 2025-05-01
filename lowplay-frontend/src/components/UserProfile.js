import React from 'react';
import './UserProfile.css';

const UserProfile = ({ user }) => {
  if (!user) return null;

  const normalizedLevel = (user.level || '').trim().toLowerCase();

  const getBadge = (level) => {
    switch (level?.toLowerCase()) {
      case 'bronce': return '🥉';
      case 'plata': return '🥈';
      case 'oro': return '🥇';
      case 'platino': return '💎';
      case 'diamante': return '🔷';
      case 'maestro': return '👑';
      default: return '';
    }
  };

  return (
    <div className="user-profile-card">
      <div className="user-avatar">
        <img src={user.avatar || '/assets/avatars/mateo.png'} alt="avatar" />
        <div className="avatar-badge">{getBadge(user.level)}</div>  
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
