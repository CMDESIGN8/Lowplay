import React, { useRef } from 'react';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './UserProfile.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { createRoot } from 'react-dom/client';

const root = createRoot(temp);
root.render(qrReact);


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
    // Crear un clon oculto del carnet
    const clone = carnetRef.current.cloneNode(true);

    // Reemplazar el div de lowcoins por el QR en el clon
    const lowcoinsDisplay = clone.querySelector('.lowcoins-display');
    if (lowcoinsDisplay) {
      lowcoinsDisplay.innerHTML = '';
      const qrDiv = document.createElement('div');
      qrDiv.style.background = 'white';
      qrDiv.style.padding = '10px';
      qrDiv.style.display = 'inline-block';

      const qrCanvas = document.createElement('div');
      qrDiv.appendChild(qrCanvas);

      clone.querySelector('.user-info').appendChild(qrDiv);

      // Agregamos el QR al div
      const qrReact = (
        <QRCode value={`https://tusitio.com/perfil/${user.id}`} size={100} />
      );

      const temp = document.createElement('div');
      qrCanvas.appendChild(temp);
      const container = document.createElement('div');
      document.body.appendChild(container);
      import('react-dom').then((ReactDOM) => {
        ReactDOM.render(qrReact, temp);
        setTimeout(() => {
          html2canvas(clone).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            const width = pdf.internal.pageSize.getWidth();
            const height = (canvas.height * width) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, width, height);
            pdf.save('CarnetDigital.pdf');
            document.body.removeChild(container);
          });
        }, 500); // Delay para que cargue el QR
      });
    }
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
