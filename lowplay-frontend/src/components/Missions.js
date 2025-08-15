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
  const [attributeAnimation, setAttributeAnimation] = useState(null);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Debes iniciar sesión para ver tus misiones');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const resMissions = await axios.get('https://lowplay.onrender.com/api/missions', { headers: { Authorization: `Bearer ${token}` } });
      const resCard = await axios.get('https://lowplay.onrender.com/api/cards', { headers: { Authorization: `Bearer ${token}` } });
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

      // Actualizar misiones
      setMissions((prev) =>
        prev.map((m) =>
          m.id === missionId ? { ...m, completada: res.data.completada, progreso_actual: res.data.progreso } : m
        )
      );

      // Actualizar carta y disparar animación si se completó
      if (res.data.completada && card) {
        const atributo = res.data.atributo_afectado;
        const valor = res.data.valor_por_completacion;
        setCard((prev) => ({
          ...prev,
          lowcoins: (prev.lowcoins || 0) + res.data.recompensa,
          [atributo]: prev[atributo] + valor,
        }));
        setAttributeAnimation({ atributo, valor });
        setTimeout(() => setAttributeAnimation(null), 1000); // dura 1s
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
        <div className="card-preview" style={{ position: 'relative' }}>
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

          {/* Animación de incremento de atributo */}
          <AnimatePresence>
            {attributeAnimation && (
              <motion.div
                key={attributeAnimation.atributo}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -30 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  color: 'gold',
                  fontWeight: 'bold',
                }}
              >
                +{attributeAnimation.valor} {attributeAnimation.atributo}
              </motion.div>
            )}
          </AnimatePresence>
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
