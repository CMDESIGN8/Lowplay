import React from "react";
import "../styles/DashboardHeader.css";

const DashboardHeader = ({ userData, avatar, handleLogout }) => {
  return (
    <div className="dashboard-header">
      {/* Avatar y bienvenida */}
      <div className="header-content">
        <img
          src={require(`../assets/avatars/${avatar}`)}
          alt="Avatar"
          className="profile-picture"
        />
        <div className="user-info">
          <h1 className="welcome-text">Bienvenido, {userData.nombre} 👋</h1>
          <p className="user-email">{userData.email}</p>
        </div>
      </div>

      {/* Menú de opciones */}
      <div className="header-actions">
        <button className="logout-button" onClick={handleLogout}>
          Cerrar sesión
        </button>
        <div className="menu-dropdown">
          <button className="menu-icon">☰</button>
          <div className="menu-options">
            <a href="/settings">Configuraciones</a>
            <a href="/transactions">Historial de Transacciones</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;