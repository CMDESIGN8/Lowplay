import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Misiones.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react'; // Para ícono de cerrar

const Missions = () => {
  const [missions, setMissions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dailyProgress, setDailyProgress] = useState({ completed: 0, total: 0 });
  const [showCompletedMessage, setShowCompletedMessage] = useState(false);
  const [showMissionList, setShowMissionList] = useState(false);
  const [availableMissions, setAvailableMissions] = useState([]);

  const fetchMissions = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('https://lowplay.onrender.com/api/missions', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Eliminar misiones duplicadas por ID
      const allMissionsRaw = res.data.missions;
      const uniqueMissionsMap = new Map();
      allMissionsRaw.forEach(m => uniqueMissionsMap.set(m.id, m));
      const allMissions = Array.from(uniqueMissionsMap.values());

      const available = allMissions.filter(m => !m.completada);
      const orderedAvailableMissions = available.sort((a, b) => a.id - b.id);
      setAvailableMissions(orderedAvailableMissions);

      if (orderedAvailableMissions.length > 0) {
        setMissions(orderedAvailableMissions);
        const firstAvailableIndex = allMissions.findIndex(m => !m.completada);
        setCurrentIndex(firstAvailableIndex !== -1 ? firstAvailableIndex : 0);
      } else {
        setMissions([]);
        setCurrentIndex(0);
      }

      const dailyMissions = allMissions.filter(m => m.tipo === 'diaria');
      const completedDaily = dailyMissions.filter(m => m.completada).length;
      setDailyProgress({ completed: completedDaily, total: dailyMissions.length });

    } catch (error) {
      console.error("Error fetching missions:", error);
    }
  };

  const completeMission = async (missionId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('https://lowplay.onrender.com/api/missions/complete', { missionId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCompletedMessage(true);
      setTimeout(() => setShowCompletedMessage(false), 3000);
      await fetchMissions();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al completar misión');
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const currentMission = missions[currentIndex];
  const progressPercent = (dailyProgress.completed / dailyProgress.total) * 100 || 0;

  return (
    <div className="missions-section">
      <h3>Misiones</h3>
      <button onClick={() => setShowMissionList(true)} className="mission-list-button">
        Lista de Misiones
      </button>

      <AnimatePresence>
        {showCompletedMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="completed-message"
          >
            ¡Misión completada!
          </motion.div>
        )}
      </AnimatePresence>

      {missions.length > 0 && (
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
          </motion.div>
        </AnimatePresence>
      )}

      {showMissionList && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowMissionList(false)}>
              <X size={20} />
            </button>
            <h3>Misiones Disponibles</h3>
            {availableMissions.length > 0 ? (
              <ul>
                {availableMissions.map(mission => (
                  <li key={mission.id}>
                    <span>{mission.nombre} ({mission.tipo})</span>
                    {mission.completada ? (
                      <span className="completed-in-list">✅</span>
                    ) : (
                      <button onClick={() => {
                        const index = missions.findIndex(m => m.id === mission.id);
                        if (index !== -1) setCurrentIndex(index);
                        setShowMissionList(false);
                      }}>Ir</button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay misiones disponibles.</p>
            )}
          </div>
        </div>
      )}

      <div className="daily-progress-bar">
        <span>Progreso diario: {dailyProgress.completed} / {dailyProgress.total}</span>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default Missions;
