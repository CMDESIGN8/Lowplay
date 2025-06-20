import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode'; // npm install jwt-decode
import './MyClubs.css';
import { Link } from 'react-router-dom';

const MyClubs = () => {
  const [myClubs, setMyClubs] = useState([]);
  const [allClubs, setAllClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [fifaCards, setFifaCards] = useState([]);

  const token = localStorage.getItem('token');

  const obtenerUserId = () => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.userId || decoded.id || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    fetchMyClubs();
    fetchAllClubs();
    fetchFifaCards();
  }, []);

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

  const fetchFifaCards = async () => {
    try {
      const res = await axios.get('https://lowplay.onrender.com/api/user-cards', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFifaCards(res.data.cards);
    } catch (err) {
      console.error('Error al obtener cartas FIFA:', err);
    }
  };

  const handleAssociate = async () => {
    try {
      if (!selectedClubId) {
        setMessage('Por favor selecciona un club');
        return;
      }

      // Asociar usuario al club
      const res = await axios.post(
        'https://lowplay.onrender.com/api/user-clubs/asociar',
        { club_id: selectedClubId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message || '¡Asociación exitosa!');
      setSelectedClubId('');
      await fetchMyClubs();

      const userId = obtenerUserId();
      if (!userId) {
        setMessage('No se pudo obtener el ID de usuario desde el token.');
        return;
      }

      const club = allClubs.find((c) => c.id === selectedClubId);
      if (club) {
        // Generar stats aleatorios
        const stats = {
          pace: Math.floor(Math.random() * (99 - 70 + 1)) + 70,
          shooting: Math.floor(Math.random() * (99 - 70 + 1)) + 70,
          passing: Math.floor(Math.random() * (99 - 70 + 1)) + 70,
          dribbling: Math.floor(Math.random() * (99 - 70 + 1)) + 70,
          defense: Math.floor(Math.random() * (99 - 70 + 1)) + 70,
          physical: Math.floor(Math.random() * (99 - 70 + 1)) + 70,
        };

        // Guardar carta en base de datos
        const cardRes = await axios.post(
          'https://lowplay.onrender.com/api/user-cards/create',
          {
            userId: userId,
            club_id: club.id,
            playerName: club.name,
            stats,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Agregar carta nueva a estado
        setFifaCards((prev) => [
          ...prev,
          {
            id: cardRes.data.card.id,
            name: cardRes.data.card.name || club.name,
            logo: club.logo_url,
            pace: cardRes.data.card.pace || stats.pace,
            shooting: cardRes.data.card.shooting || stats.shooting,
            passing: cardRes.data.card.passing || stats.passing,
            dribbling: cardRes.data.card.dribbling || stats.dribbling,
            defense: cardRes.data.card.defense || stats.defense,
            physical: cardRes.data.card.physical || stats.physical,
          },
        ]);
      }

      setShowModal(false);
      setMessage('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al asociarse';
      setMessage(errorMessage);
      console.error('Error al asociarse al club:', err);
    }
  };

  const availableClubs = allClubs.filter(
    (club) => !myClubs.some((myClub) => myClub.id === club.id)
  );

  return (
    <div className="dashboard-wrapper fade-in">
      <aside className="sidebar">
        <h1 className="logo">LUPI APP</h1>
        <nav className="menu">
          <Link to="/dashboard"><i className="fas fa-home"></i> Inicio</Link>
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
              myClubs.map((club) => (
                <div key={club.id} className="club-card">
                  <img
                    src={club.logo_url || 'https://via.placeholder.com/100x100?text=Logo'}
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
        </div>

        <div className="Lowcards">
          <h2>Mis Cartas FIFA</h2>
          <div className="fifa-card-list">
            {fifaCards.length === 0 ? (
              <p>No tienes cartas FIFA todavía.</p>
            ) : (
              fifaCards.map((card) => (
                <div key={card.id} className="fifa-card">
                  <img
                    src={card.logo || 'https://via.placeholder.com/100x100?text=Logo'}
                    alt={card.name}
                    className="club-logo"
                  />
                  <h4>{card.name}</h4>
                  <div className="stats">
                    <p>PAC: {card.pace}</p>
                    <p>SHO: {card.shooting}</p>
                    <p>PAS: {card.passing}</p>
                    <p>DRI: {card.dribbling}</p>
                    <p>DEF: {card.defense}</p>
                    <p>PHY: {card.physical}</p>
                  </div>
                </div>
              ))
            )}
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
                  availableClubs.map((club) => (
                    <div
                      key={club.id}
                      className={`club-card selectable ${
                        selectedClubId === club.id ? 'selected' : ''
                      }`}
                      onClick={() => setSelectedClubId(club.id)}
                    >
                      <img
                        src={club.logo_url || 'https://via.placeholder.com/100x100?text=Logo'}
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
      </main>
    </div>
  );
};

export default MyClubs;
