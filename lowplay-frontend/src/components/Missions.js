import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Misiones.css';
import { motion, AnimatePresence } from 'framer-motion';

const Missions = () => {
  const [missions, setMissions] = useState([]);
  const [visibleMissions, setVisibleMissions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dailyProgress, setDailyProgress] = useState({ completed: 0, total: 0 });

  const fetchMissions = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('https://lowplay.onrender.com/api/missions', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const ordered = res.data.missions.sort((a, b) => a.id - b.id);
    setMissions(ordered);

    const daily = ordered.filter(m => m.tipo === 'diaria');
    const completed = daily.filter(m => m.completada).length;
    setDailyProgress({ completed, total: daily.length });

    // Mostrar solo una misión: la próxima no completada
    const nextMission = daily.find(m => !m.completada);
    if (nextMission) {
      setVisibleMissions([nextMission]);
      setCurrentIndex(0);
    } else {
      setVisibleMissions([]);
    }
  };

  const completeMission = async (missionId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(
        'https://lowplay.onrender.com/api/missions/complete',
        { missionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`¡Ganaste ${res.data.recompensa} lowcoins!`);

      // Mostrar "completada" por 1 segundo y luego pasar a la siguiente
      setVisibleMissions(prev => {
        const updated = [...prev];
        updated[0] = { ...updated[0], completada: true };
        return updated;
      });

      setTimeout(() => {
        fetchMissions();
      }, 1000);

    } catch (err) {
      alert(err.response?.data?.message || 'Error al completar misión');
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  if (!visibleMissions.length) return <p>No hay misiones disponibles por hoy.</p>;

  const currentMission = visibleMissions[0];
  const progressPercent = (dailyProgress.completed / dailyProgress.total) * 100 || 0;

  return (
    <div className="missions-section">
      <h3>Misiones</h3>

      <div className="daily-progress-bar">
        <span>
          Progreso diario: {dailyProgress.completed} / {dailyProgress.total}
        </span>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #3dc7ff, #00b2ff)'
            }}
          ></div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentMission.id + (currentMission.completada ? '-done' : '')}
          className="mission-card"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.4 }}
        >
          <h4>{currentMission.nombre}</h4>
          <p>{currentMission.descripcion} <br />Tipo de Misión: {currentMission.tipo}</p>
          <div className="mission-reward">
            <i className="fas fa-coins"></i>
            <span>Recompensa: {currentMission.recompensa} lowcoins</span>
          </div>

          {currentMission.completada ? (
            <span className="completed">✅ Completada</span>
          ) : (
            <button onClick={() => completeMission(currentMission.id)}>Completar</button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Missions;
