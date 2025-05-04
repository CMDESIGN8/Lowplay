import React, { useRef, useState } from 'react';
import './UserProfile.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import html2canvas from 'html2canvas';
import { QRCodeCanvas } from 'qrcode.react';

const UserProfile = ({ user }) => {
  const cardRef = useRef();
  const [showQR, setShowQR] = useState(false);

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

  const handleGeneratePNG = async () => {
    setShowQR(true);

    // Esperamos que el QR se renderice antes de capturar
    setTimeout(async () => {
      const canvas = await html2canvas(cardRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.download = `Carnet_${user.username}.png`;
      link.href = imgData;
      link.click();

      setShowQR(false); // Volver al estado normal
    }, 300); // Espera corta para asegurar que el QR se renderice
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
          {!showQR ? (
            <>
            <i className={`fa-solid fa-coins coin-${normalizedLevel}`}><br /></i>
            <span className="lowcoins-count">{user.lowcoins}</span>
            </>
          ) : (
            <QRCodeCanvas
              value={`https://lowcargo.club/socio/${user.id}`} // o cualquier info relevante
              size={94}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin
            />
          )}
          </div>
          <br />
          <br />
          <div className="wallet-email-info">
            <p><i className="fa-solid fa-id-card"></i> Socio: {user.id}</p>
            <p><i className="fa-solid fa-futbol"></i> Club: Flores Club Futsal</p>
            <p><i className="fa-solid fa-wallet"></i> Wallet: {user.wallet}</p>
          </div>
          {/* BOTÓN PARA GENERAR PNG */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button className="generate-pdf-btn" onClick={handleGeneratePNG}>
          <i className="fa-solid fa-card"></i> Generar Carnet Digital
        </button>
      </div>
        </div>
      </div>
      
    </>
    
  );
};

export default UserProfile;
