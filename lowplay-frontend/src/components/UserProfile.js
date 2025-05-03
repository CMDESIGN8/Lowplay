import React from 'react';
import './UserProfile.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Asegurate de tener FontAwesome


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

  const normalizedLevel = user.level?.toLowerCase();

  return (
    <div className={`user-profile-card ${normalizedLevel}`}>
      <div className="user-avatar">
        <img src={user.avatar || '/assets/avatars/mateo.png'} alt="avatar" />
        {getBadge(user.level) && (
          <div className="avatar-badge">{getBadge(user.level)}</div>
        )}
         <div className="progress-bar">
          <div className={`progress-fill ${normalizedLevel}`} style={{ width: `${user.progress}%` }}>
            {user.progress}%
          </div>
        </div>
        
      </div>
      <div className="user-info">
        <h2>Bienvenido, {user.username}</h2>
        <p className="user-level">Ranked {user.level}</p>

        <div className="lowcoins-display">
        <span className="lowcoins-count">LOWCOINS</span>
        </div>
        <div className="lowcoins-display">
          <i className={`fa-solid fa-coins coin-${normalizedLevel}`}><br></br></i>
          <span className="lowcoins-count">{user.lowcoins}</span>
        </div>

        <div className="wallet-email-info">
  <p><i className="fa-solid fa-id-card"></i> Socio: {user.id}</p>
  <p><i className="fa-solid fa-futbol"></i> Club: Flores Club Futsal</p>
  <p><i className="fa-solid fa-wallet"></i> Wallet: {user.wallet}</p>
</div>

        
      </div>
    </div>
  );
};

export default UserProfile;