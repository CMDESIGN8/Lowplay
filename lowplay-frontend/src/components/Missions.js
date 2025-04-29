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
    <div className="missions-section">
      <h3>Misiones</h3>
      <ul>
        {missions.map((m) => (
          <li key={m.id}>
            <strong>{m.nombre}</strong>: {m.descripcion} ({m.tipo})<br />
            <div className="mission-reward">
                <i className="fas fa-coins"></i>
                {mission.recompensa} Lowcoins
              
            <span>Recompensa: {m.recompensa} lowcoins</span><br />
            {m.completada ? (
              <span style={{ color: 'green' }}>✅ Completada</span>
            ) : (
              <button onClick={() => completeMission(m.id)}>Completar</button>
            )}
            </div>
          </li>
        ))}
      </ul>
    </div>

    
  );
};

export default Missions;
