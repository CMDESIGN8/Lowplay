import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Misiones.css';

const Missions = () => {
  const [missions, setMissions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchMissions = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('https://lowplay.onrender.com/api/missions', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const orderedMissions = res.data.missions.sort((a, b) => a.id - b.id); // Asegura orden
    setMissions(orderedMissions);

    // Buscar la primera misión incompleta
    const next = orderedMissions.findIndex(m => !m.completada);
    setCurrentIndex(next !== -1 ? next : orderedMissions.length - 1);
  };

  const completeMission = async (missionId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('https://lowplay.onrender.com/api/missions/complete', { missionId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`¡Ganaste ${res.data.recompensa} lowcoins!`);

      // Recargar y avanzar a la siguiente misión
      const updated = await axios.get('https://lowplay.onrender.com/api/missions', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const ordered = updated.data.missions.sort((a, b) => a.id - b.id);
      setMissions(ordered);

      const next = ordered.findIndex((m, idx) => idx > currentIndex && !m.completada);
      if (next !== -1) {
        setCurrentIndex(next);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al completar misión');
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  if (!missions.length || currentIndex === -1) return <p>No hay misiones disponibles.</p>;

  const currentMission = missions[currentIndex];

  return (
    <div className="missions-section">
      <h3>Misiones</h3>
      <div className="mission-card">
        <h4>{currentMission.nombre}</h4>
        <p>{currentMission.descripcion} ({currentMission.tipo})</p>
        <div className="mission-reward">
          <i className="fas fa-coins"></i>
          <span>Recompensa: {currentMission.recompensa} lowcoins</span>
        </div>
        {currentMission.completada ? (
          <span className="completed">✅ Completada</span>
        ) : (
          <button onClick={() => completeMission(currentMission.id)}>Completar</button>
        )}
      </div>
    </div>
  );
};

export default Missions;
