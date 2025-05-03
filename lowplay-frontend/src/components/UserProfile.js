import React, { useRef, useState } from 'react';
import './UserProfile.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import QRCode from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const UserProfile = ({ user }) => {
  const carnetRef = useRef(null);
  const [mostrarQR, setMostrarQR] = useState(false);

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

  const handleGenerarCarnet = async () => {
    setMostrarQR(true); // Mostrar QR en lugar de lowcoins

    // Esperar que se renderice el QR
    setTimeout(async () => {
      const input = carnetRef.current;
      if (input) {
        const canvas = await html2canvas(input);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height],
        });
        pdf.addImage(imgData, 'PNG', 0, 0);
        pdf.save('carnet-digital.pdf');
      }
      setMostrarQR(false); // Volver a mostrar lowcoins
    }, 500); // Esperar a que se muestre el QR
  };

  const normalizedLevel = user.level?.toLowerCase();

  return (
    <div>
      <div className={`user-profile-card ${normalizedLevel}`} ref={carnetRef}>
        <div className="user-avatar">
          <img src={user.avatar || '/assets/avatars/mateo.png'} alt="avatar" />
          {getBadge(user.level) && <div className="avatar-badge">{getBadge(user.level)}</div>}
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
          
          {!mostrarQR ? (
            <>
              <div className="lowcoins-display">
                <span className="lowcoins-count">LOWCOINS</span>
              </div>
              <div className="lowcoins-display">
                <i className={`fa-solid fa-coins coin-${normalizedLevel}`}><br /></i>
                <span className="lowcoins-count">{user.lowcoins}</span>
              </div>
            </>
          ) : (
            <div className="qr-code">
              <QRCode value={`https://lowpay.app/perfil/${user.id}`} size={100} />
              <p>Escaneá tu carnet</p>
            </div>
          )}

          <br />

          <div className="wallet-email-info">
            <p><i className="fa-solid fa-id-card"></i> Socio: {user.id}</p>
            <p><i className="fa-solid fa-futbol"></i> Club: Flores Club Futsal</p>
            <p><i className="fa-solid fa-wallet"></i> Wallet: {user.wallet}</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleGenerarCarnet}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
        }}
      >
        Generar carnet digital
      </button>
    </div>
  );
};

export default UserProfile;
