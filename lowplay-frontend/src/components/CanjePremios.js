import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './CanjePremios.css'; // Importa el archivo CSS Module
import { motion, AnimatePresence } from 'framer-motion';

const CanjePremios = () => {
  const [premios, setPremios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState('');
  const [mensajeCanje, setMensajeCanje] = useState('');
  const [showPrizeList, setShowPrizeList] = useState(false);

  const fetchPremios = async () => {
    // ... (tu lógica para fetchPremios)
  };

  useEffect(() => {
    fetchPremios();
  }, []);

  const handleCanjear = async (premioId) => {
    // ... (tu lógica para handleCanjear)
  };

  const handleNext = () => {
    // ... (tu lógica para handleNext)
  };

  const handlePrev = () => {
    // ... (tu lógica para handlePrev)
  };

  if (error) {
    return <p className={styles['error-message']}>{error}</p>;
  }

  if (!premios.length) {
    return <p>No hay premios disponibles en este momento.</p>;
  }

  const currentPremio = premios[currentIndex];

  return (
    <div className={styles.canjePremiosSection}> {/* Usa la clase del módulo */}
      <h3>Canje de Premios</h3>
      <AnimatePresence>
        {mensajeCanje && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={styles['completed-message']} // Si tienes este estilo específico
          >
            {mensajeCanje}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPremio.id}
          className={styles.premioCard} // Usa la clase del módulo
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.4 }}
        >
          <h4>{currentPremio.nombre}</h4>
          <p>{currentPremio.descripcion}</p>
          <div className={styles.premioCosto}> {/* Usa la clase del módulo */}
            <i className="fas fa-coins"></i>
            <span>Costo: {currentPremio.costo} lowcoins</span>
          </div>
          <button onClick={() => handleCanjear(currentPremio.id)}>Canjear</button>
          <div className={styles.premioNav}> {/* Si tenías navegación, ajústala */}
          </div>
        </motion.div>
      </AnimatePresence>

      {showPrizeList && (
        <div className={styles.modalOverlay}> {/* Usa la clase del módulo */}
          <div className={styles.modalContent}> {/* Usa la clase del módulo */}
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
        </div>
      )}
      <button onClick={() => setShowPrizeList(true)} className={styles.listaPremiosButton}> {/* Usa la clase del módulo */}
        Lista de Premios
      </button>
    </div>
  );
};

export default CanjePremios;