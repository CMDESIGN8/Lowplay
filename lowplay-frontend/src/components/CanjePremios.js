import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Misiones.css'; // Reutilizamos los estilos de Misiones
import { motion, AnimatePresence } from 'framer-motion';

const CanjePremios = () => {
  const [premios, setPremios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState('');
  const [mensajeCanje, setMensajeCanje] = useState('');
  const [showPrizeList, setShowPrizeList] = useState(false);

  const fetchPremios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://lowplay.onrender.com/api/premios', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPremios(response.data.premios);
    } catch (err) {
      setError('Error al cargar los premios disponibles.');
      console.error('Error fetching premios:', err);
    }
  };

  useEffect(() => {
    fetchPremios();
  }, []);

  const handleCanjear = async (premioId) => {
    const token = localStorage.getItem('token');
    try {
      const premioToCanjear = premios.find(p => p.id === premioId);
      if (!premioToCanjear) return;

      const response = await axios.post(
        'https://lowplay.onrender.com/api/canjear',
        { premioId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensajeCanje(response.data.message || `¡Canjeaste ${premioToCanjear.nombre}!`);
      fetchPremios(); // Recargar premios tras el canje
      setTimeout(() => setMensajeCanje(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al canjear el premio.');
      console.error('Error canjeando premio:', err);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleNext = () => {
    if (currentIndex < premios.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!premios.length) {
    return <p>No hay premios disponibles en este momento.</p>;
  }

  const currentPremio = premios[currentIndex];

  return (
    <div className="missions-section"> {/* Reutilizamos la clase para el estilo */}
      <h3>Canje de Premios</h3>
      <AnimatePresence>
        {mensajeCanje && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="completed-message" // Reutilizamos el estilo
          >
            {mensajeCanje}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPremio.id}
          className="mission-card" // Reutilizamos la clase para el estilo
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.4 }}
        >
          <h4>{currentPremio.nombre}</h4>
          <p>{currentPremio.descripcion}</p>
          <div className="mission-reward"> {/* Reutilizamos la clase para el estilo */}
            <i className="fas fa-coins"></i>
            <span>Costo: {currentPremio.costo} lowcoins</span>
          </div>
          <button onClick={() => handleCanjear(currentPremio.id)}>Canjear</button>
          <div className="mission-nav"> {/* Reutilizamos la clase para la navegación */}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Modal de lista de premios */}
      {showPrizeList && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Premios Disponibles</h3>
            {premios.length > 0 ? (
              <ul>
                {premios.map(premio => (
                  <li key={premio.id}>
                    {premio.nombre} - {premio.costo} lowcoins
                    <button onClick={() => {
                      const index = premios.findIndex(p => p.id === premio.id);
                      if (index !== -1) {
                        setCurrentIndex(index);
                      }
                      setShowPrizeList(false);
                    }}>Ir</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay premios disponibles.</p>
            )}
            <button onClick={() => setShowPrizeList(false)}>Cerrar</button>
          </div>
          <button onClick={() => setShowPrizeList(true)} className="mission-list-button">
        Lista de Premios
      </button>
        </div>
      )}
    </div>
  );
};

export default CanjePremios;