import React, { useRef } from 'react';
import './UserProfile.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import jsPDF from 'jspdf';
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

  const handleGeneratePDF = () => {
    const input = cardRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Carnet_${user.username}.pdf`);
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

      {/* BOTÓN PARA GENERAR PDF */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button className="generate-pdf-btn" onClick={handleGeneratePDF}>
          <i className="fa-solid fa-file-pdf"></i> Generar Carnet Digital
        </button>
      </div>
    </>
  );
};

export default UserProfile;
