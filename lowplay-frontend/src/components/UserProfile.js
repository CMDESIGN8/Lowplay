import React, { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import './UserProfile.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const UserProfile = ({ user }) => {
  const [showQR, setShowQR] = useState(false);
  const carnetRef = useRef();

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

  const handleGenerateCarnet = () => {
    setShowQR(true);
  };

  return (
    <div className={`user-profile-card ${normalizedLevel}`} ref={carnetRef}>
      <div className="user-avatar">
        <img src={user.avatar || '/assets/avatars/mateo.png'} alt="avatar" />
        {getBadge(user.level) && (
          <div className="avatar-badge">{getBadge(user.level)}</div>
        )}
        <div className="progress-bar">
          <div
            className={`progress-fill ${normalizedLevel}`}
            style={{ width: `${user.progress}%` }}
          >
            {user.progress}%
          </div>
        </div>
      </div>

      <div className="user-info">
        <h2>Bienvenido, {user.username}</h2>
        <p className="user-level">Ranked {user.level}</p>
        <br />

        <div className="lowcoins-display">
          {!showQR ? (
            <>
              <span className="lowcoins-count">LOWCOINS</span>
              <div>
                <i className={`fa-solid fa-coins coin-${normalizedLevel}`} />
                <span className="lowcoins-count">{user.lowcoins}</span>
              </div>
            </>
          ) : (
            <div style={{ background: 'white', padding: '10px', display: 'inline-block' }}>
              <QRCode value={`https://tusitio.com/perfil/${user.id}`} />
            </div>
          )}
        </div>

        <br />
        <div className="wallet-email-info">
          <p><i className="fa-solid fa-id-card"></i> Socio: {user.id}</p>
          <p><i className="fa-solid fa-futbol"></i> Club: Flores Club Futsal</p>
          <p><i className="fa-solid fa-wallet"></i> Wallet: {user.wallet}</p>
        </div>

        <br />
        <button onClick={handleGenerateCarnet} className="carnet-button">
          Generar Carnet Digital
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
