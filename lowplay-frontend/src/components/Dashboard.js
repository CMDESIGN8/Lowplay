import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Missions from './Missions';
import UserProfile from './UserProfile';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('https://lowplay.onrender.com/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data.user);
        setEditedName(response.data.user.name);
        setEditedEmail(response.data.user.email);
        setTimeout(() => setShowContent(true), 300);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSaveChanges = async () => {
    try {
      const response = await axios.put(
        'https://lowplay.onrender.com/api/profile',
        { name: editedName, email: editedEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Actualizar los lowcoins directamente al estado
      setUser(prevState => ({
        ...prevState,
        name: editedName,
        email: editedEmail,
        lowcoins: response.data.user.lowcoins  // Asegúrate de que lowcoins se incluya en la respuesta
      }));
  
      setShowEditModal(false);
    } catch (error) {
      console.error('Error actualizando perfil:', error);
    }

    const getLevel = (coins) => {
        if (coins >= 200) return 'Oro';
        if (coins >= 100) return 'Plata';
        return 'Bronce';
      };
  };
  

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
      <UserProfile
  user={{
    username: user.name,
    avatar: '/avatars/mateo.png',
    level: getLevel(user.lowcoins),
    lowcoins: user.lowcoins,
    progress: Math.min((user.lowcoins % 100), 100), // por si querés mostrar progreso al siguiente rango
  }}
  onEditProfile={() => setShowEditModal(true)}
/>
        {user ? (
          <div className="dashboard-content">
            <h2>Bienvenido, {user.name}</h2>
            <div className="lowcoins-display">
  <i className="fas fa-coins lowcoins-icon"></i>
  <span className="lowcoins-count">{user.lowcoins} Lowcoins</span>
</div>

<div className="user-info">
  <p><i className="fas fa-envelope"></i> <strong>Email:</strong> {user.email}</p>
  <p><i className="fas fa-wallet"></i> <strong>Wallet:</strong> {user.wallet}</p>
  <p><i className="fas fa-check-circle"></i> <strong>Perfil completado:</strong> {user.profile_completed ? 'Sí' : 'No'}</p>
</div>
            <div className="edit-profile-button-container">
              <button className="edit-profile-button" onClick={() => setShowEditModal(true)}>
                <i className="fas fa-user-edit"></i> Editar Perfil
              </button>
            </div>
          </div>
        ) : (
          <p>No se pudo cargar la información del usuario.</p>
        )}
        <div className="Misiones">
            <Missions />
            </div>
      </main>

      {/* MODAL */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Editar Perfil</h3>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="Nombre"
            />
            <input
              type="email"
              value={editedEmail}
              onChange={(e) => setEditedEmail(e.target.value)}
              placeholder="Email"
            />
            <div className="modal-buttons">
              <button className="save-button" onClick={handleSaveChanges}>
                Guardar
              </button>
              <button className="cancel-button" onClick={() => setShowEditModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
