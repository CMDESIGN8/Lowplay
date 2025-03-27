  import React, { useState, useEffect } from 'react';
  import '../styles/Missions.css';
  import { FaCheckCircle, FaMapSigns, FaRegArrowAltCircleLeft, FaRegArrowAltCircleRight } from 'react-icons/fa'; // Íconos
  import api from '../services/api';
  import { GiLockedChest } from "react-icons/gi";


  const Missions = () => {
    const [missions, setMissions] = useState([]);
    const [completedMissions, setCompletedMissions] = useState([]);
    const [currentMissionIndex, setCurrentMissionIndex] = useState(0);

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No estás autenticado');
        window.location.href = '/'; // Redirigir al login si no hay token
      }

      // Obtener las misiones disponibles
      const fetchMissions = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await api.get('http://localhost:5000/misiones', {
            headers: { Authorization: `Bearer ${token}` },
          });
      
          if (Array.isArray(response.data)) {
            // El backend debería devolver las misiones no completadas hoy
            setMissions(response.data.filter(mission => !mission.completada));
            setCompletedMissions(response.data.filter(mission => mission.completada));
          } else {
            console.error('Datos de misiones no válidos:', response.data);
            alert('Error al obtener las misiones');
          }
        } catch (error) {
          console.error(error);
          alert('Error al obtener las misiones');
        }
      };
      
      const handleCompleteMission = async (misionId) => {
        try {
          const token = localStorage.getItem('token');
          const response = await api.post(
            'http://localhost:5000/misiones/completar',
            { misionId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
      
          alert(response.data.message);
          fetchMissions(); // Actualiza la lista de misiones después de completar
        } catch (error) {
          console.error(error);
          if (error.response && error.response.data.message) {
            alert(error.response.data.message);
          } else {
            alert('Error al completar la misión');
          }
        }
      };

      fetchMissions();
    }, []);

    const handleCompleteMission = async (misionId) => {
      const token = localStorage.getItem('token');
      try {
        const response = await api.post(
          'http://localhost:5000/misiones/completar',
          { misionId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert(response.data.message);

        setMissions(missions.filter(mission => mission.id !== misionId));
        const completedMission = missions.find(mission => mission.id === misionId);
        if (completedMission) {
          setCompletedMissions([...completedMissions, completedMission]);
        }
      } catch (error) {
        console.error(error);
        alert('Error al completar la misión');
      }
    };

    const handleNextMission = () => {
      if (currentMissionIndex < missions.length - 1) {
        setCurrentMissionIndex(currentMissionIndex + 1);
      }
    };

    const handlePreviousMission = () => {
      if (currentMissionIndex > 0) {
        setCurrentMissionIndex(currentMissionIndex - 1);
      }
    };

    return (
      <div className="missions-container">
        <div className="mission-section">
          {missions.length === 0 ? (
            <h4>🎉 Misiones completadas 🎉<br></br> ¡Volvé mañana para hacer más misiones y ganar LOWCOINS!</h4>
          ) : (
            <div className="mission-item">
              <div className="mission-info">
                <h4 className="mission-text">
                  <FaMapSigns /> Misión {currentMissionIndex + 1}: {missions[currentMissionIndex].nombre}
                </h4>
                <p className="mission-text">{missions[currentMissionIndex].descripcion}</p>
                <p className="mission-text"><GiLockedChest /> {missions[currentMissionIndex].recompensa} LOWCOINS</p>
                <button onClick={() => handleCompleteMission(missions[currentMissionIndex].id)}>
                  <FaCheckCircle /> Completar Misión
                </button>
              </div>
              <div className="navigation-buttons">
                <button onClick={handlePreviousMission} disabled={currentMissionIndex === 0}>
                  <FaRegArrowAltCircleLeft /> 
                </button>
                <span className="mission-number">{currentMissionIndex + 1}/{missions.length}</span>
                <button onClick={handleNextMission} disabled={currentMissionIndex === missions.length - 1}>
                   <FaRegArrowAltCircleRight />
                </button>
              </div>
            
            </div>
          )}
        </div>
      </div>
    );
  };

  export default Missions;