import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MyClubs.css';
import { Link } from 'react-router-dom';

const MyClubs = () => {
  const [myClubs, setMyClubs] = useState([]);
  const [allClubs, setAllClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null); // Guardar datos de usuario (name, avatar, etc)
  const [avatarPreview, setAvatarPreview] = useState(null); // Para vista previa avatar cargado
  const [fifaCards, setFifaCards] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUserData();
    fetchMyClubs();
    fetchAllClubs();
  }, []);

  // 1. Obtener datos del usuario (incluye avatar y nombre)
  const fetchUserData = async () => {
    try {
      const res = await axios.get('https://lowplay.onrender.com/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      setAvatarPreview(res.data.user.avatar || '/assets/avatars/mateo.png');
    } catch (err) {
      console.error('Error al obtener datos de usuario:', err);
    }
  };

  const fetchMyClubs = async () => {
    try {
      const res = await axios.get('https://lowplay.onrender.com/api/user-clubs/mis-clubes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyClubs(res.data.clubs);
    } catch (err) {
      console.error('Error al obtener mis clubes:', err);
    }
  };

  const fetchAllClubs = async () => {
    try {
      const res = await axios.get('https://lowplay.onrender.com/api/clubs');
      setAllClubs(res.data);
    } catch (err) {
      console.error('Error al obtener todos los clubes:', err);
    }
  };

  // 2. Cambiar avatar al hacer click y subir nueva foto
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vista previa local inmediata
    const previewURL = URL.createObjectURL(file);
    setAvatarPreview(previewURL);

    // Aquí deberías subir el archivo a tu backend y actualizar el avatar en BD
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await axios.post(
        'https://lowplay.onrender.com/api/users/upload-avatar',
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      // Actualiza avatar en estado con la URL que te devuelve backend
      setUser(prev => ({ ...prev, avatar: res.data.avatarUrl }));
    } catch (err) {
      console.error('Error subiendo avatar:', err);
      setMessage('Error al subir avatar');
    }
  };

  // 3. Crear función que genera stats aleatorios de 60 a 99
  const generateStats = () => ({
    pace: Math.floor(Math.random() * 40) + 60,
    shooting: Math.floor(Math.random() * 40) + 60,
    passing: Math.floor(Math.random() * 40) + 60,
    dribbling: Math.floor(Math.random() * 40) + 60,
    defense: Math.floor(Math.random() * 40) + 60,
    physical: Math.floor(Math.random() * 40) + 60,
  });

  // 4. Asociar club y crear carta con datos de usuario y club
  const handleAssociate = async () => {
    if (!selectedClubId) return;
    try {
      const res = await axios.post(
        'https://lowplay.onrender.com/api/user-clubs/asociar',
        { club_id: selectedClubId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message || '¡Asociación exitosa!');
      setSelectedClubId('');
      fetchMyClubs();

      // Encontrar club seleccionado
      const club = availableClubs.find(c => c.id === selectedClubId);
      if (club && user) {
        setFifaCards(prev => [
          ...prev,
          {
            id: club.id,
            clubName: club.name,
            clubLogo: club.logo_url,
            userName: user.name,
            userAvatar: user.avatar || '/assets/avatars/mateo.png',
            stats: generateStats(),
          },
        ]);
      }

      setShowModal(false);

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al asociarse';
      setMessage(errorMessage);
      console.error('Error al asociarse al club:', err);
    }
  };

  // Filtrar clubes a los que no estás asociado
  const availableClubs = allClubs.filter(
    club => !myClubs.some(myClub => myClub.id === club.id)
  );

  return (
    <div className="dashboard-wrapper fade-in">
      <aside className="sidebar">
        <h1 className="logo">LOWPLUS</h1>
        <nav className="menu">
          <a href="#"><i className="fas fa-home"></i> Inicio</a>
          <a href="#"><i className="fas fa-wallet"></i> Wallet</a>
          <a href="#"><i className="fas fa-truck"></i> Gestiona tu Envío</a>
          <a href="#"><i className="fas fa-tv"></i> LowTV</a>
          <a href="#"><i className="fas fa-store"></i> Marketplace</a>
          <Link to="/mis-clubes"><i className="fas fa-users"></i> Asociar Club</Link>
          <a href="#"><i className="fas fa-user"></i> Perfil</a>
          <a href="#"><i className="fas fa-sign-out-alt"></i> Cerrar sesión</a>
        </nav>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <h2>Mis Clubes</h2>
          <div className="club-list">
            {myClubs.length === 0 ? (
              <p>No estás asociado a ningún club aún.</p>
            ) : (
              myClubs.map(club => (
                <div key={club.id} className="club-card">
                  <img
                    src={club.logo_url || '/placeholder.png'}
                    alt={club.name}
                    className="club-logo"
                  />
                  <p>{club.name}</p>
                </div>
              ))
            )}
          </div>

          <h2>Asociarme a un nuevo club</h2>
          <button onClick={() => setShowModal(true)} className="associate-btn">
            Ver clubes disponibles
          </button>

          <div className="avatar-upload">
            <h3>Mi Avatar</h3>
            <label htmlFor="avatarInput" style={{ cursor: 'pointer' }}>
              <img
                src={avatarPreview || '/assets/avatars/mateo.png'}
                alt="Avatar Usuario"
                style={{ width: '100px', borderRadius: '50%' }}
                title="Haz click para cambiar avatar"
              />
            </label>
            <input
              type="file"
              id="avatarInput"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </div>

          <div className='Lowcards'>
            <h2>Cartas FIFA</h2>
            <div className="fifa-card-list">
              {fifaCards.map(card => (
                <div key={card.id} className="fifa-card">
                  {/* Foto del usuario */}
                  <img
                    src={card.userAvatar || '/assets/avatars/mateo.png'}
                    alt={card.userName}
                    className="user-avatar"
                    style={{ width: '100px', borderRadius: '50%' }}
                  />
                  <h4>{card.userName}</h4>
                  <p><b>Club:</b> {card.clubName}</p>
                  <img
                    src={card.clubLogo || '/placeholder.png'}
                    alt={card.clubName}
                    className="club-logo"
                    style={{ width: '60px' }}
                  />
                  <div className="stats">
                    <p>PAC: {card.stats.pace}</p>
                    <p>SHO: {card.stats.shooting}</p>
                    <p>PAS: {card.stats.passing}</p>
                    <p>DRI: {card.stats.dribbling}</p>
                    <p>DEF: {card.stats.defense}</p>
                    <p>PHY: {card.stats.physical}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Clubes Disponibles</h3>
                <div className="club-list">
                  {availableClubs.length === 0 ? (
                    <p>No hay clubes disponibles.</p>
                  ) : (
                    availableClubs.map(club => (
                      <div
                        key={club.id}
                        className={`club-card selectable ${selectedClubId === club.id ? 'selected' : ''}`}
                        onClick={() => setSelectedClubId(club.id)}
                      >
                        <img
                          src={club.logo_url || '/placeholder.png'}
                          alt={club.name}
                          className="club-logo"
                        />
                        <p>{club.name}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="modal-actions">
                  {message && <p className="message">{message}</p>}
                  <button
                    onClick={handleAssociate}
                    disabled={!selectedClubId}
                    className="associate-btn"
                  >
                    Asociarme
                  </button>
                  <button onClick={() => setShowModal(false)} className="cancel-btn">
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default MyClubs;
