import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Misiones.css';
import { motion, AnimatePresence } from 'framer-motion';

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

      const allMissions = res.data.missions;
      const available = allMissions.filter(m => !m.completada);
      const orderedAvailableMissions = available.sort((a, b) => a.id - b.id);
      setAvailableMissions(orderedAvailableMissions);

      // Si no hay misiones disponibles, no actualizamos la lista principal
      if (orderedAvailableMissions.length > 0) {
        setMissions(orderedAvailableMissions);
        // Buscar el índice de la primera misión disponible
        const firstAvailableIndex = allMissions.findIndex(m => !m.completada);
        setCurrentIndex(firstAvailableIndex !== -1 ? firstAvailableIndex : 0);
      } else {
        setMissions([]);
        setCurrentIndex(0);
      }

      // Calcular progreso de misiones diarias (considerando todas las misiones)
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
      const res = await axios.post('https://lowplay.onrender.com/api/missions/complete', { missionId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCompletedMessage(true);
      setTimeout(() => setShowCompletedMessage(false), 3000); // Mostrar mensaje por 3 segundos
      await fetchMissions(); // Actualiza la lista de misiones

      // Avanza automáticamente a la siguiente misión disponible
      setCurrentIndex(prev => {
        const currentMissionIndexInAll = missions.findIndex(m => m.id === missionId);
        if (currentMissionIndexInAll !== -1) {
          const nextAvailableIndex = availableMissions.findIndex(m => availableMissions.indexOf(m) > availableMissions.findIndex(av => av.id === missionId));
          return nextAvailableIndex !== -1 ? missions.findIndex(m => m.id === availableMissions[nextAvailableIndex].id) : prev;
        }
        return prev;
      });

    } catch (err) {
      alert(err.response?.data?.message || 'Error al completar misión');
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  if (!missions.length && !availableMissions.length) return <p>No hay misiones disponibles.</p>;
  if (!missions.length && availableMissions.length > 0) {
    // Si la lista filtrada está vacía pero hay misiones sin completar,
    // esto podría indicar un problema en el filtrado o en la inicialización.
    // Volvemos a cargar las misiones disponibles.
    return <p>Cargando misiones...</p>;
  }

  const currentMission = missions[currentIndex];

  const handleNext = () => {
    if (currentIndex < missions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const progressPercent = (dailyProgress.completed / dailyProgress.total) * 100 || 0;

  return (
    <div className="missions-section">
      <h3>Misiones</h3>
      <br></br><br></br>
      <button onClick={() => setShowMissionList(true)} className="mission-list-button">
        Lista de Misiones
      </button>
      <br></br><br></br>
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
            <p>{currentMission.descripcion} <br />Tipo de Mision: {currentMission.tipo}</p>
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
       <div className="mission-navigation">
  <button onClick={handlePrev} disabled={currentIndex === 0}>
    Anterior
  </button>
  <button onClick={handleNext} disabled={currentIndex === missions.length - 1}>
    Siguiente
  </button>
</div>
      {/* Modal de lista de misiones */}
      {/* Modal de lista de misiones */}
      {showMissionList && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Misiones Disponibles</h3>
            {availableMissions.length > 0 ? (
              <ul>
                {availableMissions.map(mission => (
                  <li key={mission.id}>
                    {mission.nombre} ({mission.tipo})
                    {mission.completada ? (
                      <span className="completed-in-list">✅ Completada</span>
                    ) : (
                      <button onClick={() => {
                        // Navegar a esta misión en la vista principal
                        const index = missions.findIndex(m => m.id === mission.id);
                        if (index !== -1) {
                          setCurrentIndex(index);
                        }
                        setShowMissionList(false);
                      }}>Ir</button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay misiones disponibles.</p>
            )}
            <button onClick={() => setShowMissionList(false)}>Cerrar</button>
          </div>
        </div>
      )}
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
    </div>
  );
};

export default Missions;