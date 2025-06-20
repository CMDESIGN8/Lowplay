import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MyClubs.css';
import { Link } from 'react-router-dom';


const MyClubs = () => {
  const [myClubs, setMyClubs] = useState([]);
  const [allClubs, setAllClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState('');
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchMyClubs();
    fetchAllClubs();
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

  const handleAssociate = async () => {
  try {
    const res = await axios.post(
      'https://lowplay.onrender.com/api/user-clubs/asociar',
      { club_id: selectedClubId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setMessage(res.data.message || '¡Asociación exitosa!');
    setSelectedClubId('');
    fetchMyClubs();

    // ✅ Encontrar el club seleccionado
    const club = availableClubs.find((c) => c.id === selectedClubId);
    if (club) {
      // Generar stats random
      const stats = {
        pace: Math.floor(Math.random() * 100),
        shooting: Math.floor(Math.random() * 100),
        passing: Math.floor(Math.random() * 100),
        dribbling: Math.floor(Math.random() * 100),
        defense: Math.floor(Math.random() * 100),
        physical: Math.floor(Math.random() * 100),
      };

      // ✅ Guardar carta en la base de datos
      await axios.post(
  'https://lowplay.onrender.com/api/user-cards/create', // <== Cambiar aquí
        {
          club_id: selectedClubId,
          stats,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Actualizar frontend con la nueva carta
      setFifaCards((prev) => [
        ...prev,
        {
          id: club.id,
          name: club.name,
          logo: club.logo_url,
          stats,
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


  const [showModal, setShowModal] = useState(false);
  const [fifaCards, setFifaCards] = useState([]);


  // 🔎 Filtrar clubes a los que ya estás asociado
  const availableClubs = allClubs.filter(
    (club) => !myClubs.some((myClub) => myClub.id === club.id)
  );

  

    return (
   <div className="dashboard-wrapper fade-in">
  <aside className="sidebar">
    <h1 className="logo">LUPI APP</h1>
    <nav className="menu">
      <Link to="/Dashboard"><i className="fas fa-home"></i> Inicio</Link>
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
    </div>


      <div className='Lowcards'> 
  <h2>Aca Van las Cartas</h2>
  <div className="fifa-card-list">
    {fifaCards.map(card => (
      <div key={card.id} className="fifa-card">
        <img src={card.logo || '/placeholder.png'} alt={card.name} className="club-logo" />
        <h4>{card.name}</h4>
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
          availableClubs.map((club) => (
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
  </main>
</div>
  );
};

export default MyClubs;