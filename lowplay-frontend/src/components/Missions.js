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

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Debes iniciar sesión para ver tus misiones');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const resMissions = await axios.get('https://lowplay.onrender.com/api/missions', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const resCard = await axios.get('https://lowplay.onrender.com/api/cards', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMissions(resMissions.data.missions);
      setCard(resCard.data.card);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar misiones o carta');
    } finally {
      setLoading(false);
    }
  };

  const completeMission = async (missionId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Debes iniciar sesión para completar misiones');
      return;
    }

    try {
      const res = await axios.post(
        'https://lowplay.onrender.com/api/missions/complete',
        { missionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowCompletedMessage(true);
      setTimeout(() => setShowCompletedMessage(false), 3000);

      // Actualizar misiones localmente
      setMissions((prev) =>
        prev.map((m) =>
          m.id === missionId ? { ...m, completada: res.data.completada, progreso_actual: res.data.progreso } : m
        )
      );

      // Actualizar carta localmente
      if (res.data.completada && card) {
        setCard((prev) => ({
          ...prev,
          lowcoins: (prev.lowcoins || 0) + res.data.recompensa,
          pace: res.data.atributo_afectado === 'pace' ? prev.pace + res.data.valor_por_completacion : prev.pace,
          shooting: res.data.atributo_afectado === 'shooting' ? prev.shooting + res.data.valor_por_completacion : prev.shooting,
          passing: res.data.atributo_afectado === 'passing' ? prev.passing + res.data.valor_por_completacion : prev.passing,
          dribbling: res.data.atributo_afectado === 'dribbling' ? prev.dribbling + res.data.valor_por_completacion : prev.dribbling,
          defense: res.data.atributo_afectado === 'defense' ? prev.defense + res.data.valor_por_completacion : prev.defense,
          physical: res.data.atributo_afectado === 'physical' ? prev.physical + res.data.valor_por_completacion : prev.physical,
        }));
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Error al completar misión');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="missions-section">
      <h3>Misiones</h3>

      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

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
          <p>Lowcoins: {card.lowcoins || 0}</p>
        </div>
      )}

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

      {missions.map((m) => (
        <div key={m.id} className="mission-card">
          <h4>{m.nombre}</h4>
          <p>{m.descripcion}</p>
          <p>Progreso: {m.progreso_actual}/{m.meta}</p>
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
