import React, { useRef } from 'react';
import './UserProfile.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import html2canvas from 'html2canvas';

const UserProfile = ({ user }) => {
  const cardRef = useRef();

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

  const handleGeneratePNG = () => {
    const input = cardRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      
      // Crear un enlace para descargar
      const link = document.createElement('a');
      link.download = `Carnet_${user.username}.png`;
      link.href = imgData;
      link.click();
    });
  };

  const normalizedLevel = user.level?.toLowerCase();

  return (
    <>
      <div ref={cardRef} className={`user-profile-card ${normalizedLevel}`}>
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
          <br />
          <div className="lowcoins-display">
            <span className="lowcoins-count">LOWCOINS</span>
          </div>
          <div className="lowcoins-display">
            <i className={`fa-solid fa-coins coin-${normalizedLevel}`}><br /></i>
            <span className="lowcoins-count">{user.lowcoins}</span>
          </div>
          <br />
          <br />
          <div className="wallet-email-info">
            <p><i className="fa-solid fa-id-card"></i> Socio: {user.id}</p>
            <p><i className="fa-solid fa-futbol"></i> Club: Flores Club Futsal</p>
            <p><i className="fa-solid fa-wallet"></i> Wallet: {user.wallet}</p>
          </div>
        </div>
      </div>

      {/* BOTÓN PARA GENERAR PNG */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button className="generate-pdf-btn" onClick={handleGeneratePNG}>
          <i className="fa-solid fa-image"></i> Descargar Carnet como PNG
        </button>
      </div>
    </>
  );
};

export default UserProfile;
