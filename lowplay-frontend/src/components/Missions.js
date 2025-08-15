import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Misiones.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const MissionsPage = () => {
  const [missions, setMissions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Físico-Deportiva');
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [currentMission, setCurrentMission] = useState(null);
  const [file, setFile] = useState(null);

  const categories = [
    'Físico-Deportiva',
    'Intelectual',
    'Contribución a la Red',
    'Única y Especial'
  ];

  // Fetch misiones desde el backend
  const fetchMissions = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('https://lowplay.onrender.com/api/missions/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMissions(res.data.missions);
    } catch (err) {
      console.error('Error fetching missions:', err);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const missionsByCategory = missions.filter(m => m.categoria === selectedCategory);

  // Función para abrir el modal de evidencia
  const handleEvidenceModal = (mission) => {
    setCurrentMission(mission);
    setShowEvidenceModal(true);
  };

  // Función para manejar archivo seleccionado
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Función para enviar evidencia
  const submitEvidence = async () => {
    if (!file || !currentMission) return alert('Seleccione un archivo.');

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('missionId', currentMission.id);

    try {
      await axios.post('https://lowplay.onrender.com/api/missions/submit', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setShowEvidenceModal(false);
      setFile(null);
      fetchMissions();
      alert('¡Misión completada y evidencia enviada!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error al enviar evidencia.');
    }
  };

  return (
    <div className="missions-page">
      <h2>Misiones</h2>

      <div className="category-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            className={selectedCategory === cat ? 'active' : ''}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="missions-list">
        {missionsByCategory.length > 0 ? (
          missionsByCategory.map(m => (
            <div key={m.id} className={`mission-card ${m.completada ? 'completed' : ''}`}>
              <h4>{m.nombre}</h4>
              <p>{m.descripcion}</p>
              <span>Recompensa: {m.recompensa} lupicoins</span>
              {m.completada ? (
                <span className="completed">✅ Completada</span>
              ) : (
                <button onClick={() => handleEvidenceModal(m)}>
                  Completar / Subir evidencia
                </button>
              )}
            </div>
          ))
        ) : (
          <p>No hay misiones en esta categoría.</p>
        )}
      </div>

      {/* Modal de evidencia */}
      <AnimatePresence>
        {showEvidenceModal && currentMission && (
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
            >
              <button className="modal-close" onClick={() => setShowEvidenceModal(false)}>
                <X size={20} />
              </button>
              <h3>{currentMission.nombre}</h3>
              <p>{currentMission.descripcion}</p>
              <span>Recompensa: {currentMission.recompensa} lupicoins</span>
              <input type="file" accept="image/*,video/*" onChange={handleFileChange} />
              <button onClick={submitEvidence}>Enviar Evidencia</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MissionsPage;
