import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './Misiones.css';

const Missions = () => {
  const [missions, setMissions] = useState([]);
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCompletedMessage, setShowCompletedMessage] = useState(false);

  const fetchMissions = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    setError('');
    try {
      const resMissions = await axios.get('https://lowplay.onrender.com/api/missions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMissions(resMissions.data.missions);

      const resCard = await axios.get('https://lowplay.onrender.com/api/cards', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCard(resCard.data.card);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar misiones o carta');
    } finally {
      setLoading(false);
    }
  };

  const completeMission = async (missionId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        'https://lowplay.onrender.com/api/missions/complete',
        { missionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCompletedMessage(true);
      setTimeout(() => setShowCompletedMessage(false), 3000);
      fetchMissions();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al completar misión');
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  return (
    <div className="missions-section">
      <h3>Misiones</h3>

      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Carta del usuario */}
      {card && (
        <div className="card-preview">
          <h4>{card.name}</h4>
          <ul>
            <li>Pace: {card.pace}</li>
            <li>Shooting: {card.shooting}</li>
            <li>Passing: {card.passing}</li>
            <li>Dribbling: {card.dribbling}</li>
            <li>Defense: {card.defense}</li>
            <li>Physical: {card.physical}</li>
          </ul>
          <p>Misiones completadas: {card.missionsCompleted || 0}/{card.totalMissions || 10}</p>
          <div className="progress-bar">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((card.missionsCompleted || 0) / (card.totalMissions || 10)) * 100}%` }}
              className="progress-bar-fill"
            />
          </div>
        </div>
      )}

      {/* Animación de misión completada */}
      <AnimatePresence>
        {showCompletedMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="completed-message"
          >
            ¡Misión completada! 🎉
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listado de misiones */}
      {missions.map((m) => (
        <div key={m.id} className="mission-card">
          <h4>{m.nombre}</h4>
          <p>{m.descripcion}</p>
          <p>
            Progreso: {m.progreso_actual}/{m.meta}
          </p>
          <p>Recompensa: {m.recompensa} lowcoins</p>
          {m.completada ? (
            <span>✅ Completada</span>
          ) : (
            <button onClick={() => completeMission(m.id)}>Completar</button>
          )}
        </div>
      ))}
    </div>
  );
};

export default Missions;
