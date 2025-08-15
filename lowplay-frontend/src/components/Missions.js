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
  const [evidenciaFile, setEvidenciaFile] = useState(null);

  const fetchMissions = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('https://lowplay.onrender.com/api/missions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMissions(res.data.missions);
    } catch (err) {
      console.error('Error fetching missions:', err);
    }
  };

  const completeMission = async (missionId) => {
    const token = localStorage.getItem('token');
    try {
      let evidencia_url = null;

      // Si hay archivo, subirlo (simulación)
      if (evidenciaFile) {
        const formData = new FormData();
        formData.append('file', evidenciaFile);
        // Aquí podrías integrar tu endpoint de uploads
        evidencia_url = '/uploads/' + evidenciaFile.name; 
      }

      await axios.post('https://lowplay.onrender.com/api/missions/complete', 
        { missionId, evidencia_url },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowCompletedMessage(true);
      setTimeout(() => setShowCompletedMessage(false), 3000);
      setEvidenciaFile(null);
      await fetchMissions();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al completar misión');
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const currentMission = missions[currentIndex];
  const availableMissions = missions.filter(m => !m.completada);

  return (
    <div className="missions-section">
      <h3>Misiones</h3>
      <button onClick={() => setShowMissionList(true)}>Lista de Misiones</button>

      <AnimatePresence>
        {showCompletedMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="completed-message"
          >
            ¡Misión completada! 🎉
          </motion.div>
        )}
      </AnimatePresence>

      {currentMission && (
        <motion.div key={currentMission.id} className="mission-card">
          <h4>{currentMission.nombre}</h4>
          <p>{currentMission.descripcion}</p>
          <p>Categoría: {currentMission.categoria}</p>
          <p>Recompensa: {currentMission.recompensa} lowcoins</p>

          {currentMission.evidencia && (
            <input type="file" onChange={e => setEvidenciaFile(e.target.files[0])} />
          )}

          {currentMission.completada ? (
            <span className="completed">✅ Completada</span>
          ) : (
            <button onClick={() => completeMission(currentMission.id)}>Completar</button>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {showMissionList && (
          <motion.div className="modal-overlay">
            <motion.div className="modal-content">
              <button className="modal-close" onClick={() => setShowMissionList(false)}>
                <X size={20} />
              </button>
              <h3>Misiones Disponibles</h3>
              {availableMissions.length > 0 ? (
                <ul>
                  {availableMissions.map(m => (
                    <li key={m.id}>
                      <span>{m.nombre} ({m.categoria})</span>
                      <button onClick={() => { setCurrentIndex(missions.findIndex(ms => ms.id === m.id)); setShowMissionList(false); }}>
                        Ir
                      </button>
                    </li>
                  ))}
                </ul>
              ) : <p>No hay misiones disponibles.</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Missions;
