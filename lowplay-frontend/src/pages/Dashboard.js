import React, { useState, useEffect } from 'react';
import '../styles/dashboard.css'; // Importamos el archivo de estilos
import NewsCarousel from '../components/NewsCarousel'; // Importar el componente de noticias
import Tareas from '../components/Tareas'; // Nuevo componente de tareas
import Eventos from '../components/Eventos'; // Nuevo componente de eventos
import Calendario from '../components/Calendario.js'; // Nuevo componente de calendario
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Datos estáticos en lugar de obtenerlos del servidor
  const [userData] = useState({
    nombre: 'Juan Pérez',
    email: 'juanperez@example.com',
    saldo: 1200,  // Saldo ficticio
    foto_perfil: 'avatar1.png',  // Imagen ficticia del avatar
  });

  const [balance] = useState(userData.saldo || 0); // Estado para el saldo

  const handleLogout = () => {
    // Lógica para cerrar sesión
    localStorage.removeItem('token'); // Elimina el token del almacenamiento local
    window.location.href = '/';  // Redirige al usuario a la página de login
  };

  useEffect(() => {
    // Eliminar cualquier llamada API que se haya configurado.
    // No hay más necesidad de hacer un axios.get() a la API
  }, []);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        {/* Mostrar avatar estático */}
        <div className="profile-picture-container">
        </div>
      </div>

      {/* Menu de opciones */}
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
          <h3>Misiones Diarias</h3>
        </div>
        <div className="info-card">
          <h3>Premios Disponibles</h3>
        </div>
      </div>

      <div className="info-card">
        <NewsCarousel />
      </div>

      {/* Tareas, Eventos y Calendario */}
      <div className="calendar-tasks-events-container">
        <div className="tasks-section">
          {/* Aquí iría el componente de tareas */}
        </div>

        <div className="calendar-section">
          <Calendario />
        </div>

        <div className="events-section">
          <Eventos />
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
