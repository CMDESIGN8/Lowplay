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
  const [updating, setUpdating] = useState(false);
  const [card, setCard] = useState(null);
  const [attributeAnimation, setAttributeAnimation] = useState(null);

  // Fetch misiones y carta
  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const resMissions = await axios.get('https://lowplay.onrender.com/api/missions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resCard = await axios.get('https://lowplay.onrender.com/api/cards', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMissions(resMissions.data.missions);
      setCard(resCard.data.card);

      const firstAvailable = resMissions.data.missions.findIndex(m => !m.completada);
      setCurrentIndex(firstAvailable !== -1 ? firstAvailable : 0);
    } catch (err) {
      console.error('Error fetching missions or card:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateProgress = async (missionId, cantidad = 1) => {
    if (updating) return;
    setUpdating(true);

    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(
        'https://lowplay.onrender.com/api/missions/progress',
        { missionId, cantidad },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Animación de misión completada
      if (res.data.completada) {
        setShowCompletedMessage(true);
        setTimeout(() => setShowCompletedMessage(false), 3000);
      }

      // Actualizar misión localmente
      setMissions(prev =>
        prev.map(m =>
          m.id === missionId
            ? { ...m, progreso: res.data.progreso, completada: res.data.completada }
            : m
        )
      );

      // Actualizar carta y animar atributo
      if (res.data.completada && card && res.data.atributo_afectado) {
        const atributo = res.data.atributo_afectado;
        const valor = res.data.valor_por_completacion || 1;

        setCard(prev => ({
          ...prev,
          lowcoins: (prev.lowcoins || 0) + (res.data.recompensa || 0),
          [atributo]: prev[atributo] + valor,
        }));

        setAttributeAnimation({ atributo, valor });
        setTimeout(() => setAttributeAnimation(null), 1000);
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      alert(err.response?.data?.message || 'Error al actualizar progreso');
    } finally {
      setUpdating(false);
    }
  };

  const currentMission = missions[currentIndex] || {};
  const availableMissions = missions.filter(m => !m.completada);
  const completedMissions = missions.filter(m => m.completada);
  const totalProgress = missions.length
    ? (completedMissions.length / missions.length) * 100
    : 0;

  return (
    <div className="missions-section">
      <h3>Misiones</h3>

      {/* Barra de progreso global */}
      <div className="progress-bar-global">
        <motion.div
          className="progress-bar-fill-global"
          initial={{ width: 0 }}
          animate={{ width: `${totalProgress}%` }}
        />
      </div>
      <p>Progreso total: {completedMissions.length}/{missions.length}</p>

      {/* Carta del usuario */}
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

      {/* Misión actual */}
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
                style={{ width: `${(currentMission.progreso / currentMission.meta) * 100}%` }}
              ></div>
            </div>
            <span>{currentMission.progreso} / {currentMission.meta}</span>
            <br />
            {!currentMission.completada && (
              <button onClick={() => updateProgress(currentMission.id, 1)} disabled={updating}>
                Avanzar Misión
              </button>
            )}
            {currentMission.completada && <span className="completed">✅ Completada</span>}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Animación misión completada */}
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

      {/* Modal lista de misiones */}
      <button onClick={() => setShowMissionList(true)} className="mission-list-button">
        Lista de Misiones
      </button>
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

              <h3>Misiones Completadas</h3>
              {completedMissions.length > 0 ? (
                <ul>
                  {completedMissions.map(m => (
                    <li key={m.id}>
                      {m.nombre} ({m.tipo}) ✅ {m.meta}/{m.meta}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No completaste ninguna misión aún.</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Missions;
