import React from 'react';
import './UserProfile.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const UserProfile = ({ user }) => {
  const getBadge = (level) => {
    if (!level) return '';
    switch (level.toLowerCase().trim()) {
      case 'bronce': return '🥉';
      case 'plata': return '🥈';
      case 'oro': return '🥇';
      case 'rubi': return '♦️';
      case 'diamante': return '💎';
      case 'elite': return '👑';
      default: return 'L';
    }
  };

  const normalizedLevel = user.level?.toLowerCase() || 'bronce';

  return (
    <div className={`user-profile-card ${normalizedLevel}`}>
      <div className="user-card-content">
        <div className="user-avatar">
          <img src={user.avatar || '/assets/avatars/mateo.png'} alt="Avatar del usuario" />
          {user.level && (
            <div className="avatar-badge">{getBadge(user.level)}</div>
          )}
        </div>
        <div className="user-info">
          <h2>Bienvenido, {user.username || 'Usuario'}</h2>
          <p className="user-level">Ranked: {user.level}</p>

          <div className="lowcoins-display">
            <i className={`fas fa-coins coin-${normalizedLevel}`}></i>
            <span className="lowcoins-count">{user.lowcoins} Lowcoins</span>
          </div>

          <div className="wallet-email-info">
            <p>Socio: {user.id}</p>
            <p>Wallet: {user.wallet}</p>
            <p>Club: Flores Club Futsal</p>
          </div>

          <div className="progress-bar">
            <div className={`progress-fill ${normalizedLevel}`} style={{ width: `${user.progress || 0}%` }}>
              {user.progress || 0}%
            </div>
          </div>

          <div className="proximolevel">
            <p>Siguiente Nivel:</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
