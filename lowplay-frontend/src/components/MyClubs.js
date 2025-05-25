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
      const res = await axios.get('https://lowplay.onrender.com/api/mis-clubes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyClubs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllClubs = async () => {
    try {
      const res = await axios.get('https://lowplay.onrender.com/api/clubes'); // Reemplazá si es diferente
      setAllClubs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssociate = async () => {
    try {
      const res = await axios.post(
        'https://lowplay.onrender.com/api/asociar',
        { clubId: selectedClubId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('¡Asociación exitosa!');
      fetchMyClubs();
    } catch (err) {
      setMessage('Error al asociarse');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Mis Clubes</h2>
      <ul>
        {myClubs.length === 0 ? (
          <li>No estás asociado a ningún club aún.</li>
        ) : (
          myClubs.map((club) => <li key={club.id}>{club.name}</li>)
        )}
      </ul>

      <h3>Asociarme a un nuevo club</h3>
      <select onChange={(e) => setSelectedClubId(e.target.value)} value={selectedClubId}>
        <option value="">Seleccioná un club</option>
        {allClubs.map((club) => (
          <option key={club.id} value={club.id}>
            {club.name}
          </option>
        ))}
      </select>
      <button onClick={handleAssociate} disabled={!selectedClubId}>
        Asociarme
      </button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default MyClubs;
