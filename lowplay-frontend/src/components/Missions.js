import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Missions = () => {
  const [missions, setMissions] = useState([]);

  useEffect(() => {
    axios.get('https://lowplay.onrender.com/api/missions')
      .then(response => {
        setMissions(response.data);
      })
      .catch(error => {
        console.log('Error fetching missions:', error);
      });
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
}

export default Missions;
