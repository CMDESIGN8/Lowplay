import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Misiones.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Missions = () => {
  const [missions, setMissions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCompletedMessage, setShowCompletedMessage] = useState(false);
  const [showMissionList, setShowMissionList] = useState(false);

  const fetchMissions = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('https://lowplay.onrender.com/api/missions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMissions(res.data.missions);
      const firstAvailable = res.data.missions.findIndex(m => !m.completada);
      setCurrentIndex(firstAvailable !== -1 ? firstAvailable : 0);
    } catch (err) {
      console.error('Error fetching missions:', err);
    }
  };

  const updateProgress = async (missionId, cantidad = 1) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(
        'https://lowplay.onrender.com/api/missions/progress',
        { missionId, cantidad },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.completada) {
        setShowCompletedMessage(true);
        setTimeout(() => setShowCompletedMessage(false), 3000);
      }

      // Actualizar solo la misión afectada
      setMissions(prev =>
        prev.map(m =>
          m.id === missionId
            ? {
                ...m,
                progreso: res.data.progreso || m.meta,
                completada: res.data.completada
              }
            : m
        )
      );
    } catch (err) {
      console.error('Error updating progress:', err);
      alert(err.response?.data?.message || 'Error al actualizar progreso');
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const currentMission = missions[currentIndex];
  const availableMissions = missions.filter(m => !m.completada);

  return (
    <div className="missions-section">
      <h3>Misiones</h3>
      <br />
      <button onClick={() => setShowMissionList(true)} className="mission-list-button">
        Lista de Misiones
      </button>
      <br />
      <br />

      <AnimatePresence>
        {showCompletedMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="completed-message"
          >
            ¡Misión completada! 🎉
          </motion.div>
        )}
      </AnimatePresence>

      {missions.length > 0 && currentMission && (
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
            <p>{currentMission.descripcion}</p>
            <div className="mission-reward">
              <i className="fas fa-coins"></i>
              <span>Recompensa: {currentMission.recompensa} lowcoins</span>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(currentMission.progreso / currentMission.meta) * 100}%`
                }}
              ></div>
            </div>
            <span>
              {currentMission.progreso} / {currentMission.meta}
            </span>
            <br />
            {!currentMission.completada && (
              <button onClick={() => updateProgress(currentMission.id, 1)}>
                Avanzar Misión
              </button>
            )}
            {currentMission.completada && <span className="completed">✅ Completada</span>}
          </motion.div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {showMissionList && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content"
              initial={{ y: '-100vh', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-100vh', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 80 }}
            >
              <button className="modal-close" onClick={() => setShowMissionList(false)}>
                <X size={20} />
              </button>
              <h3>Misiones Disponibles</h3>
              {availableMissions.length > 0 ? (
                <ul>
                  {availableMissions.map(m => (
                    <li key={m.id}>
                      <span>
                        {m.nombre} ({m.tipo}) {m.progreso}/{m.meta}
                      </span>
                      <button
                        onClick={() => {
                          const index = missions.findIndex(ms => ms.id === m.id);
                          if (index !== -1) setCurrentIndex(index);
                          setShowMissionList(false);
                        }}
                      >
                        Ir
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay misiones disponibles.</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Missions;
