import React, { useRef } from 'react';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './UserProfile.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { createRoot } from 'react-dom/client';

const UserProfile = ({ user }) => {
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

  const handleGeneratePDF = async () => {
    const clone = carnetRef.current.cloneNode(true);

    // Quitar lowcoins
    const lowcoinsDisplay = clone.querySelector('.lowcoins-display');
    if (lowcoinsDisplay) {
      lowcoinsDisplay.innerHTML = '';
    }

    // Crear div para el QR
    const qrContainer = document.createElement('div');
    qrContainer.style.background = 'white';
    qrContainer.style.padding = '10px';
    qrContainer.style.marginTop = '10px';
    clone.querySelector('.user-info').appendChild(qrContainer);

    // Crear un div temporal para renderizar el QR
    const tempDiv = document.createElement('div');
    qrContainer.appendChild(tempDiv);
    document.body.appendChild(tempDiv); // Necesario para renderizar con React

    // Crear y renderizar el QR
    const qrReact = <QRCode value={`https://tusitio.com/perfil/${user.id}`} size={100} />;
    const root = createRoot(tempDiv);
    root.render(qrReact);

    // Esperar a que se monte el QR antes de capturar
    setTimeout(() => {
      html2canvas(clone).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const width = pdf.internal.pageSize.getWidth();
        const height = (canvas.height * width) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        pdf.save('CarnetDigital.pdf');

        document.body.removeChild(tempDiv);
      });
    }, 500); // Espera breve para renderizar QR
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
          <span className="lowcoins-count">LOWCOINS</span>
          <div>
            <i className={`fa-solid fa-coins coin-${normalizedLevel}`} />
            <span className="lowcoins-count">{user.lowcoins}</span>
          </div>
        </div>

        <br />
        <div className="wallet-email-info">
          <p><i className="fa-solid fa-id-card"></i> Socio: {user.id}</p>
          <p><i className="fa-solid fa-futbol"></i> Club: Flores Club Futsal</p>
          <p><i className="fa-solid fa-wallet"></i> Wallet: {user.wallet}</p>
        </div>

        <br />
        <button onClick={handleGeneratePDF} className="carnet-button">
          Generar Carnet Digital
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
