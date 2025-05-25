import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
      setMyClubs(res.data.clubs); // 👈 asegúrate que esto coincida con tu backend
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
        { club_id: selectedClubId }, // 👈 nombre correcto del campo
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message || '¡Asociación exitosa!');
      fetchMyClubs(); // actualizar la lista
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al asociarse';
      setMessage(errorMessage);
      console.error('Error al asociarse al club:', err);
    }
  };

  return (
  <div>
    <h2>Mis Clubes</h2>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
      {myClubs.length === 0 ? (
        <p>No estás asociado a ningún club aún.</p>
      ) : (
        myClubs.map((club) => (
          <div key={club.id} style={{ textAlign: 'center' }}>
            <img
              src={club.logo_url || '/placeholder.png'}
              alt={club.name}
              style={{ width: '80px', height: '80px', borderRadius: '50%' }}
            />
            <p>{club.name}</p>
          </div>
        ))
      )}
    </div>

    <h3>Asociarme a un nuevo club</h3>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
      {allClubs.map((club) => (
        <div
          key={club.id}
          style={{
            border: selectedClubId === club.id ? '2px solid #00f' : '1px solid #ccc',
            borderRadius: '8px',
            padding: '10px',
            textAlign: 'center',
            cursor: 'pointer',
            width: '100px',
          }}
          onClick={() => setSelectedClubId(club.id)}
        >
          <img
            src={club.logo_url || '/placeholder.png'}
            alt={club.name}
            style={{ width: '60px', height: '60px', borderRadius: '50%' }}
          />
          <p style={{ fontSize: '0.9rem' }}>{club.name}</p>
        </div>
      ))}
    </div>

    <button onClick={handleAssociate} disabled={!selectedClubId} style={{ marginTop: '1rem' }}>
      Asociarme
    </button>

    {message && <p>{message}</p>}
  </div>
);

};

export default MyClubs;
