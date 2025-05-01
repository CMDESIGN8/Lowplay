import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Misiones.css';
import { motion, AnimatePresence } from 'framer-motion';

const Missions = () => {
  const [missions, setMissions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dailyProgress, setDailyProgress] = useState({ completed: 0, total: 0 });

  const fetchMissions = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('https://lowplay.onrender.com/api/missions', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const orderedMissions = res.data.missions.sort((a, b) => a.id - b.id);

    // Calcular progreso de misiones diarias
    const dailyMissions = orderedMissions.filter(m => m.tipo === 'diaria');
    const completed = dailyMissions.filter(m => m.completada).length;
    setDailyProgress({ completed, total: dailyMissions.length });

    // Filtrar visibilidad de misiones
    const visibleMissions = orderedMissions.filter(m => {
      if (m.tipo === 'diaria') return !m.completada;
      return true; // mostrar otras misiones aunque estén completas
    });

    setMissions(visibleMissions);

    // Buscar próxima misión no completada
    const nextIndex = visibleMissions.findIndex(m => !m.completada);
    setCurrentIndex(nextIndex !== -1 ? nextIndex : 0);
  };

  const completeMission = async (missionId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('https://lowplay.onrender.com/api/missions/complete', { missionId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`¡Ganaste ${res.data.recompensa} lowcoins!`);
      await fetchMissions(); // Refrescar misiones después de completar
    } catch (err) {
      alert(err.response?.data?.message || 'Error al completar misión');
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  if (!missions.length) {
    return <p>🎉 ¡Ya completaste todas las misiones disponibles por hoy!</p>;
  }

  const currentMission = missions[currentIndex];
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
          key={currentMission.id}
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
          <div className="mission-nav">
            <button
              onClick={() => setCurrentIndex(prev => prev - 1)}
              disabled={currentIndex === 0}
            >
              <i className="fas fa-arrow-left"></i> Anterior
            </button>

            <button
              onClick={() => setCurrentIndex(prev => prev + 1)}
              disabled={currentIndex === missions.length - 1}
            >
              Siguiente <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Missions;
