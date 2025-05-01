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

  const getLevel = (coins) => {
    if (coins >= 1000) return ' ELITE';
    if (coins >= 800) return ' DIAMANTE';
    if (coins >= 600) return ' ESMERALDA';
    if (coins >= 400) return ' ORO';
    if (coins >= 200) return ' PLATA';
    return ' 🥉';
  };

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
    avatar: '/assets/avatars/mateo.png',
    level: getLevel(user.lowcoins),
    lowcoins: user.lowcoins,
    email: user.email,
    wallet: user.wallet,
    progress: Math.min((user.lowcoins % 100), 100), // por si querés mostrar progreso al siguiente rango
  }}
  onEditProfile={() => setShowEditModal(true)}
/>
<div className="particles">
  {[...Array(20)].map((_, i) => (
    <div
      key={i}
      className={`particle ${user.level?.toLowerCase()}`}
      style={{
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 6}s`
      }}
    />
  ))}
</div>
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
