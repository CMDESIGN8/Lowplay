import React from 'react';
import './UserProfile.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Asegurate de tener FontAwesome


const UserProfile = ({ user }) => {
  const getBadge = (level) => {
    if (!level) return '';
    switch (level.toLowerCase().trim()) {
      case 'bronce': return 'fas fa-medal';
      case 'plata': return 'P';
      case 'oro': return 'O';
      case 'platino': return 'D';
      case 'esmeralda': return 'P';
      case 'elite': return 'E';
      default: return 'L';
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