import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CanjePremios.css';
import { motion, AnimatePresence } from 'framer-motion';

const CanjePremios = () => {
  const [premios, setPremios] = useState([]);
  const [error, setError] = useState('');
  const [mensajeCanje, setMensajeCanje] = useState('');
  const [mostrarLista, setMostrarLista] = useState(false);
  const [indiceActual, setIndiceActual] = useState(0);
  const [direccion, setDireccion] = useState(0);

  useEffect(() => {
    const fetchPremios = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://lowplay.onrender.com/api/premios', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPremios(response.data.premios);
      } catch (err) {
        setError('Error al cargar los premios disponibles.');
      }
    };
    fetchPremios();
  }, []);

  const handleCanjear = async (premioId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://lowplay.onrender.com/api/canjear',
        { premioId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensajeCanje(response.data.message || '¡Canje realizado con éxito!');
      setTimeout(() => setMensajeCanje(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al canjear el premio.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const cambiarIndice = (delta) => {
    const nuevoIndice = indiceActual + delta;
    if (nuevoIndice >= 0 && nuevoIndice < premios.length) {
      setDireccion(delta);
      setIndiceActual(nuevoIndice);
    }
  };

  const variantes = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.4 } },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0, transition: { duration: 0.3 } }),
  };

  const premioActual = premios[indiceActual];

  return (
    <div className="canje-premios-section">
      <h3>Canje de Premios</h3>
      <button className="boton-toggle-lista" onClick={() => setMostrarLista(!mostrarLista)}>
        {mostrarLista ? 'Ver uno por uno' : 'Lista de Premios'}
      </button><br></br><br></br>

      {mensajeCanje && <p className="success-message">{mensajeCanje}</p>}
      {error && <p className="error-message">{error}</p>}

      {mostrarLista ? (
        <div className="premios-grid">
          {premios.map((premio) => (
            <div key={premio.id} className="premio-card">
              <h4>{premio.nombre}</h4>
              <p>{premio.descripcion}</p>
              <div className="premio-costo">
                <i className="fas fa-coins"></i> {premio.costo} lowcoins
              </div>
              <button onClick={() => handleCanjear(premio.id)}>Canjear</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="vista-individual">
          <AnimatePresence custom={direccion} mode="wait">
            <motion.div
              key={premioActual?.id}
              className="premio-card individual"
              custom={direccion}
              variants={variantes}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <h4>{premioActual?.nombre}</h4>
              <p>{premioActual?.descripcion}</p>
              <div className="premio-costo">
                <i className="fas fa-coins"></i> {premioActual?.costo} lowcoins
              </div>
              <button onClick={() => handleCanjear(premioActual?.id)}>Canjear</button>
              <div className="navegacion-premio">
                <button onClick={() => cambiarIndice(-1)} disabled={indiceActual === 0}>⬅ Anterior</button>
                <span className="contador-premios">{indiceActual + 1} de {premios.length}</span>
                <button onClick={() => cambiarIndice(1)} disabled={indiceActual === premios.length - 1}>Siguiente ➡</button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default CanjePremios;
