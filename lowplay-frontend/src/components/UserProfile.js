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
      <div
        ref={cardRef}
        className={`user-profile-card ${normalizedLevel}`}
        style={{
          width: '340px',
          height: '220px',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
        }}
      >
        <div className="left-section" style={{ width: '40%' }}>
          <img
            src={user.avatar || '/assets/avatars/mateo.png'}
            alt="avatar"
            style={{ width: '100%', borderRadius: '10px' }}
          />
          <div className="avatar-badge" style={{ fontSize: '18px', textAlign: 'center' }}>
            {getBadge(user.level)}
          </div>
        </div>

        <div className="right-section" style={{ width: '58%', paddingLeft: '10px' }}>
          <h4>{user.username}</h4>
          <p>Ranked: {user.level}</p>
          <p>Socio: {user.id}</p>
          <p>Club: Flores Club Futsal</p>

          {!showQR ? (
            <>
              <p style={{ fontWeight: 'bold' }}>
                <i className="fa-solid fa-coins"></i> {user.lowcoins} LOWCOINS
              </p>
            </>
          ) : (
            <QRCodeCanvas
              value={`https://lowcargo.club/socio/${user.id}`} // o cualquier info relevante
              size={64}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin
            />
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button className="generate-pdf-btn" onClick={handleGeneratePNG}>
          <i className="fa-solid fa-image"></i> Descargar Carnet con QR
        </button>
      </div>
    </>
  );
};

export default UserProfile;
