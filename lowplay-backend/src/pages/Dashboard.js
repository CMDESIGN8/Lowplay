import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/dashboard.css'; // Importamos el archivo de estilos
import AvatarSelection from '../components/AvatarSelection'; // Importa el componente AvatarSelection
import NewsCarousel from '../components/NewsCarousel'; // Importar el componente de noticias
import Missions from '../components/Missions.js';
import WalletMovements from '../components/WalletMovements.js';
import Rewards from '../components/Rewards.js';
import Tareas from '../components/Tareas'; // Nuevo componente de tareas
import Eventos from '../components/Eventos'; // Nuevo componente de eventos
import Calendario from '../components/Calendario.js'; // Nuevo componente de calendario
import { Link } from 'react-router-dom';


const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [avatar, setAvatar] = useState(null); // Estado para el avatar
  const [balance, setBalance] = useState(0); // Estado para el saldo

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No estás autenticado');
      window.location.href = '/'; // Redirigir al login si no hay token
    }

    const fetchUserData = async () => {
      try {
        const response = await api.get('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
        setAvatar(response.data.avatar || null); // Establecer el avatar del usuario
        setBalance(response.data.saldo || 0); // Establecer el saldo
      } catch (error) {
        console.error(error);
        alert('Error al obtener la información');
      }
    };
    fetchUserData();
  }, []);

  if (!userData) return <div>Cargando...</div>;

  // Función para manejar la selección de avatar
  const handleAvatarSelect = (selectedAvatar) => {
    setAvatar(selectedAvatar);
    // Aquí puedes hacer una solicitud al backend para actualizar el avatar si es necesario
    console.log("Avatar seleccionado:", selectedAvatar);
  };
  const handleLogout = () => {
    // Lógica para cerrar sesión
    // Limpia el token o los datos del usuario
    localStorage.removeItem('token'); // Elimina el token del almacenamiento local
    window.location.href = '/';  // Redirige al usuario a la página de login
  };
  

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        {/* Mostrar avatar seleccionado */}
        <div className="profile-picture-container">
        {avatar ? (
      <img
        src={require(`../assets/avatars/${avatar}`)} // Cargar el avatar seleccionado
        alt="Avatar"
        className="profile-picture"
      />
        ) : (
          <p></p>
    )}
        </div>
      {/* Título de bienvenida */}
      {/* Información del usuario */}
    <div className="user-info">
      <div className="welcome-and-logout">
        <h1 className="welcome-text">Bienvenido, {userData.nombre} 👋</h1>
      </div>
      <p className="wallet-number">Número de Wallet: {userData.billetera}</p>
      <div className="wallet-balance-container">
      <div className="wallet-balance">
    <span className="balance-label">Saldo Disponible</span>
    <span className="balance-amount">LC {userData.saldo}</span> {/* Aquí se muestra el saldo real */}
  </div>
</div>
  </div>
  {/* Componente AvatarSelection */}
  <AvatarSelection onAvatarSelect={handleAvatarSelect} />
</div>


<div className="button-menu">
  <Link to="/envio" className="menu-button">
    <i className="icon fas fa-shipping-fast"></i>
    <span>Hacer Envío</span>
  </Link>
  <Link to="/cotizar" className="menu-button">
    <i className="icon fas fa-calculator"></i>
    <span>Cotizar</span>
  </Link>
  <Link to="/tracking" className="menu-button">
    <i className="icon fas fa-search-location"></i>
    <span>Tracking</span>
  </Link>
  <Link to="/noticias" className="menu-button">
    <i className="icon fas fa-newspaper"></i>
    <span>Noticias</span>
  </Link>
  <Link to="/wallet" className="menu-button">
    <i className="icon fas fa-wallet"></i>
    <span>Wallet</span>
  </Link>
  <Link to="/misiones" className="menu-button">
    <i className="icon fas fa-tasks"></i>
    <span>Misiones</span>
  </Link>
  <Link to="/lowcard" className="menu-button">
    <i className="icon fas fa-credit-card"></i>
    <span>LowCard</span>
  </Link>
</div>



      {/* Información adicional del usuario */}
      <div className="dashboard-info">
      <div className="info-card">
           <h3>Últimos Movimientos</h3>
           <WalletMovements />
  </div>
        <div className="info-card">
          <h3>Misiones Diarias </h3>
          {/* Agregar el componente de misiones diarias */}
          <Missions />
          <h3>Premios Disponibles</h3>
          <Rewards />
          {/* Agregar el componente de misiones completas */}
        </div>
      </div>

      <div className="info-card">
          {/* Agregar el componente de noticias con autoscroll */}
      <NewsCarousel />
        </div>

        {/* Tareas, Eventos y Calendario */}
        <div className="calendar-tasks-events-container">
  
  
  <div className="tasks-section">
    
    <Tareas /> {/* Aquí va tu lista de tareas */}
  </div>

  <div className="calendar-section">
    
    <Calendario /> {/* Aquí se integrará tu componente de calendario */}
  </div>
  
  <div className="events-section">
    
    <Eventos /> {/* Aquí va tu lista de eventos */}
  </div>
</div>

      {/* Acciones disponibles */}
      <div className="dashboard-actions">
        <div className="action-card">
          <h3>Ver Torneos LowCard</h3>
          <p>Participa en torneos con tus LOWCARDS y ganá Premios Increibles.</p>
        </div>
        <div className="action-card">
          <h3>Canjear Premios</h3>
          <p>Usa tus LOWCOINS para obtener increíbles premios</p>
        </div>
        <div className="action-card">
          <h3>Configurar Perfil</h3>
          <p>Actualiza tu información y preferencias</p>
        </div>
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
      <button className="logout-button" onClick={handleLogout}>
          Cerrar sesión
        </button>
        <p>&copy; 2024 LOWPLAY - Todos los derechos reservados</p>
      </div>
    </div>
  );
};

export default Dashboard;