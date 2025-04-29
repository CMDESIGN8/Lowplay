import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Misiones.css';

const Missions = () => {
  const [missions, setMissions] = useState([]);
  const [currentMissionIndex, setCurrentMissionIndex] = useState(0);

  const fetchMissions = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('https://lowplay.onrender.com/api/missions', {
      headers: { Authorization: `Bearer ${token}` }
    });

    setMissions(res.data.missions);

    // Buscar la primera misión no completada
    const firstIncompleteIndex = res.data.missions.findIndex(m => !m.completada);
    setCurrentMissionIndex(firstIncompleteIndex !== -1 ? firstIncompleteIndex : res.data.missions.length - 1);
  };

  const completeMission = async (missionId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('https://lowplay.onrender.com/api/missions/complete', { missionId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`¡Ganaste ${res.data.recompensa} lowcoins!`);
  
      // Volvemos a obtener las misiones actualizadas
      const updated = await axios.get('https://lowplay.onrender.com/api/missions', {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const updatedMissions = updated.data.missions;
      setMissions(updatedMissions);
  
      // Buscar la siguiente misión no completada
      const nextIndex = updatedMissions.findIndex(m => !m.completada);
      if (nextIndex !== -1) {
        setCurrentMissionIndex(nextIndex);
      } else {
        setCurrentMissionIndex(updatedMissions.length - 1); // si todas están completadas
      }
  
    } catch (err) {
      alert(err.response?.data?.message || 'Error al completar misión');
    }
  };
  useEffect(() => {
    fetchMissions();
  }, []);

  const currentMission = missions[currentMissionIndex];

  return (
    <div className="missions-section">
      <h3>Misiones</h3>
      {currentMission ? (
        <div className={`mission-card ${currentMission.completada ? 'completed' : ''}`}>
          <div className="mission-header">
            <strong>{currentMission.nombre}</strong>
            <span className="mission-type">({currentMission.tipo})</span>
          </div>
          <p className="mission-description">{currentMission.descripcion}</p>
          <div className="mission-reward">
            <i className="fas fa-coins"></i>
            <span>{currentMission.recompensa} lowcoins</span>
          </div>
          {currentMission.completada ? (
            <span className="mission-status">✅ Completada</span>
          ) : (
            <button
              className="mission-button"
              onClick={() => completeMission(currentMission.id)}
            >
              Completar
            </button>
          )}
        </div>
      ) : (
        <p>No hay misiones disponibles.</p>
      )}
    </div>
  );
};

export default Missions;
