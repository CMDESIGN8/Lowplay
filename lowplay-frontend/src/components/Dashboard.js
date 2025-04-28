import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css'; // Asegurate que esté actualizado
import '@fortawesome/fontawesome-free/css/all.min.css';


const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const token = localStorage.getItem('token'); // Token del login

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('https://lowplay.onrender.com/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Datos del usuario:', response.data.user);
        setUser(response.data.user);
        setTimeout(() => setShowContent(true), 300); // Pequeña espera para el fade
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Cargando datos del usuario...</p>
      </div>
    );
  }

  return (
    <div className={`dashboard-wrapper ${showContent ? 'fade-in' : ''}`}>
  <aside className="sidebar">
    <h1 className="logo">LOWPLAY</h1>
    <nav className="menu">
      <a href="#"><i className="fas fa-home"></i> Inicio</a>
      <a href="#"><i className="fas fa-wallet"></i> Wallet</a>
      <a href="#"><i className="fas fa-bullseye"></i> Misiones</a>
      <a href="#"><i className="fas fa-gift"></i> Premios</a>
      <a href="#"><i className="fas fa-user"></i> Perfil</a>
      <a href="#"><i className="fas fa-sign-out-alt"></i> Cerrar sesión</a>
    </nav>
  </aside>

  <main className="dashboard-main">
    {user ? (
      <div className="dashboard-content">
        <h2>Bienvenido, {user.name}</h2>
        <div className="user-info">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Wallet:</strong> {user.wallet}</p>
          <p><strong>Lowcoins:</strong> {user.lowcoins}</p>
          <p><strong>Perfil completado:</strong> {user.profile_completed ? 'Sí' : 'No'}</p>
        </div>
      </div>
    ) : (
      <p>No se pudo cargar la información del usuario.</p>
    )}
  </main>
</div>
  );
};

export default Dashboard;
