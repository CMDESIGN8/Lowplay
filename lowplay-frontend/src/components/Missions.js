import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Missions = () => {
  const [missions, setMissions] = useState([]);

  const fetchMissions = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('https://lowplay.onrender.com/api/missions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMissions(res.data.missions);
  };

  const completeMission = async (missionId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('https://lowplay.onrender.com/api/missions/complete', { missionId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`¡Ganaste ${res.data.recompensa} lowcoins!`);
      fetchMissions(); // recargar para mostrar estado actualizado
    } catch (err) {
      alert(err.response?.data?.message || 'Error al completar misión');
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  return (
    <div className="Misiones">
      <h2>Misiones del Día</h2>
      {missions.length === 0 ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Cargando misiones...</p>
        </div>
      ) : (
        <div className="missions-list">
          {missions.map(mission => (
            <div className="mission-item" key={mission.id}>
              <div className="mission-info">
                <div className="mission-name">{mission.nombre}</div>
                <div className="mission-description">{mission.descripcion}</div>
              </div>
              <div className="mission-reward">
                <i className="fas fa-coins"></i>
                {mission.recompensa} Lowcoins
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Missions;
