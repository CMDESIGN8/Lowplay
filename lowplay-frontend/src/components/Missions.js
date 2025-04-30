import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Misiones.css';

const Missions = () => {
  const [missions, setMissions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dailyProgress, setDailyProgress] = useState({ completed: 0, total: 0 });
  const [showCelebration, setShowCelebration] = useState(false);

  const fetchMissions = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('https://lowplay.onrender.com/api/missions', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const orderedMissions = res.data.missions.sort((a, b) => a.id - b.id);
    setMissions(orderedMissions);

    const dailyMissions = orderedMissions.filter(m => m.tipo === 'diaria');
    const completed = dailyMissions.filter(m => m.completada).length;
    setDailyProgress({ completed, total: dailyMissions.length });

    // Buscar próxima misión disponible
    const next = orderedMissions.findIndex(m => !m.completada);
    setCurrentIndex(next !== -1 ? next : 0);
  };

  const completeMission = async (missionId, tipo) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('https://lowplay.onrender.com/api/missions/complete', { missionId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`¡Ganaste ${res.data.recompensa} lowcoins!`);

      // Activar celebración si es diaria
      if (tipo === 'diaria') {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2500);
      }

      await fetchMissions(); // Refresca datos
    } catch (err) {
      alert(err.response?.data?.message || 'Error al completar misión');
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  if (!missions.length) return <p>No hay misiones disponibles.</p>;

  const currentMission = missions[currentIndex];

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
              width: `${(dailyProgress.completed / dailyProgress.total) * 100 || 0}%`
            }}
          ></div>
        </div>
      </div>

      <div className="mission-card">
        <h4>{currentMission.nombre}</h4>
        <p>{currentMission.descripcion}  ({currentMission.tipo})</p>
        <div className="mission-reward">
          <i className="fas fa-coins"></i>
          <span>Recompensa: {currentMission.recompensa} lowcoins</span>
        </div>
        {currentMission.completada ? (
          <span className="completed">✅ Completada</span>
        ) : (
          <button onClick={() => completeMission(currentMission.id, currentMission.tipo)}>
            Completar
          </button>
        )}
      </div>

      {showCelebration && <div className="confetti">🎉 ¡Completada! 🎉</div>}
    </div>
  );
};

export default Missions;
