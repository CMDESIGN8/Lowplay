import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css'; // Asegurate de tener este CSS

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
    <div className={`dashboard-container ${showContent ? 'fade-in' : ''}`}>
      {user ? (
        <>
          <h2>Bienvenido, {user.name}</h2>
          <p>Email: {user.email}</p>
          <p>Wallet: {user.wallet}</p>
          <p>Lowcoins: {user.lowcoins}</p>
          <p>Perfil completado: {user.profile_completed ? 'Sí' : 'NO'}</p>
        </>
      ) : (
        <p>No se pudo cargar la información del usuario.</p>
      )}
    </div>
  );
};

export default Dashboard;
