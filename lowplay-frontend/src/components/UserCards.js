import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function UserCards({ userId }) {
  const [cards, setCards] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar cartas del usuario
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError('');
    axios
      .get(`https://lowplay.onrender.com/api/user-cards/${userId}`)
      .then((res) => {
        setCards(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Error al cargar cartas');
        setLoading(false);
      });
  }, [userId]);

  // Crear carta nueva
  const handleCreateCard = () => {
    if (!playerName.trim()) {
      setError('Debes ingresar el nombre del jugador');
      return;
    }
    setLoading(true);
    setError('');
    axios
      .post('https://lowplay.onrender.com/api/user-cards/create', {
        userId,
        playerName,
      })
      .then((res) => {
        setCards((prev) => [res.data, ...prev]);
        setPlayerName('');
        setLoading(false);
      })
      .catch(() => {
        setError('Error al crear carta');
        setLoading(false);
      });
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>Mis Cartas FIFA</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Nombre del jugador"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          disabled={loading}
          style={{ padding: 8, width: '70%', marginRight: 8 }}
        />
        <button onClick={handleCreateCard} disabled={loading}>
          Crear Carta
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: 12 }}>
          {error}
        </div>
      )}

      {loading && <div>Cargando...</div>}

      <div>
        {cards.length === 0 && !loading && <p>No tenés cartas aún.</p>}

        {cards.map((card) => (
          <div
            key={card.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
              backgroundColor: '#f9f9f9',
            }}
          >
            <h3>{card.name}</h3>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              <li>Pace: {card.pace}</li>
              <li>Shooting: {card.shooting}</li>
              <li>Passing: {card.passing}</li>
              <li>Dribbling: {card.dribbling}</li>
              <li>Defense: {card.defense}</li>
              <li>Physical: {card.physical}</li>
            </ul>
            <small>Creada: {new Date(card.created_at).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
