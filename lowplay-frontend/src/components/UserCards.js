import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

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
      .catch(() => {
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

  // Simular actualización de atributos al completar misiones
  const handleCompleteMission = (cardId) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id === cardId) {
          const updatedCard = {
            ...card,
            pace: card.pace + 1,
            shooting: card.shooting + 1,
            passing: card.passing + 1,
            dribbling: card.dribbling + 1,
            defense: card.defense + 1,
            physical: card.physical + 1,
            missionsCompleted: (card.missionsCompleted || 0) + 1,
          };
          return updatedCard;
        }
        return card;
      })
    );
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

      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {loading && <div>Cargando...</div>}

      <div>
        {cards.length === 0 && !loading && <p>No tenés cartas aún.</p>}

        <AnimatePresence>
          {cards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
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
                {['pace', 'shooting', 'passing', 'dribbling', 'defense', 'physical'].map((attr) => (
                  <li key={attr}>
                    {attr.charAt(0).toUpperCase() + attr.slice(1)}:{' '}
                    <motion.span
                      key={card[attr]}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                      style={{ display: 'inline-block' }}
                    >
                      {card[attr]}
                    </motion.span>
                  </li>
                ))}
              </ul>

              <div style={{ margin: '8px 0' }}>
                <strong>Misiones completadas:</strong>
                <div
                  style={{
                    background: '#ddd',
                    borderRadius: 4,
                    overflow: 'hidden',
                    height: 10,
                    marginTop: 4,
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((card.missionsCompleted || 0) / (card.totalMissions || 10)) * 100}%` }}
                    style={{ height: '100%', background: '#4caf50' }}
                  />
                </div>
              </div>

              <small>Creada: {new Date(card.created_at).toLocaleString()}</small>

              <div style={{ marginTop: 8 }}>
                <button onClick={() => handleCompleteMission(card.id)}>Completar misión (+1 a stats)</button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
