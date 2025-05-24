import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClubs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/user-clubs/mis-clubes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClubs(res.data.clubs);
    } catch (error) {
      console.error('Error al cargar los clubes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  if (loading) return <p>Cargando tus clubes...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Mis clubes</h2>
      {clubs.length === 0 ? (
        <p>No estás asociado a ningún club todavía.</p>
      ) : (
        <ul className="space-y-2">
          {clubs.map((club) => (
            <li key={club.id} className="border rounded-lg p-3 shadow-sm">
              <strong>{club.nombre}</strong><br />
              <span>{club.descripcion}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyClubs;
