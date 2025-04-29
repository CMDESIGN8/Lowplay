import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Misiones.css'; // Asegúrate de que este archivo esté importado correctamente

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
    <div className="missions-container">
      <h3 className="missions-header">Misiones</h3>
      <div className="missions-list">
        {missions.slice(0, 3).map((m) => (
          <div key={m.id} className="mission-item">
            <div className="mission-title">
              <strong>{m.nombre}</strong>
            </div>
            <div className="mission-description">
              {m.descripcion} ({m.tipo})
            </div>
            <div className="mission-reward">
              <i className="fas fa-coins"></i>
              <span>Recompensa: {m.recompensa} lowcoins</span>
            </div>
            <div className="mission-status">
              {m.completada ? (
                <span style={{ color: 'green' }}>✅ Completada</span>
              ) : (
                <button onClick={() => completeMission(m.id)} className="complete-btn">Completar</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Missions;
