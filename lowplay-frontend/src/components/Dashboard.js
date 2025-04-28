import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

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
      await axios.put('https://lowplay.onrender.com/api/profile', 
        { name: editedName, email: editedEmail }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Actualizar la vista con los datos nuevos
      setUser(prev => ({
        ...prev,
        name: editedName,
        email: editedEmail
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
          <a href="#">Inicio</a>
          <a href="#">Wallet</a>
          <a href="#">Misiones</a>
          <a href="#">Premios</a>
          <a href="#">Perfil</a>
          <a href="#">Cerrar sesión</a>
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

            <div className="edit-profile-button-container">
              <button className="edit-profile-button" onClick={() => setShowEditModal(true)}>
                <i className="fas fa-user-edit"></i> Editar Perfil
              </button>
            </div>
          </div>
        ) : (
          <p>No se pudo cargar la información del usuario.</p>
        )}
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
