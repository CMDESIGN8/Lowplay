import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CanjePremios.css';

const CanjePremios = () => {
  const [premios, setPremios] = useState([]);
  const [error, setError] = useState('');
  const [mensajeCanje, setMensajeCanje] = useState('');
  const [premioActual, setPremioActual] = useState(0);
  const [mostrarModal, setMostrarModal] = useState(false);

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
      const response = await axios.post(
        'https://lowplay.onrender.com/api/canjear',
        { premioId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensajeCanje(response.data.message || '¡Canje realizado con éxito!');
      fetchPremios();
      setTimeout(() => setMensajeCanje(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al canjear el premio.');
      console.error('Error canjeando premio:', err);
      setTimeout(() => setError(''), 3000);
    }
  };

  const premio = premios[premioActual];

  return (
    <div className="canje-premios-section">
      <h3>Canje de Premios</h3>

      {mensajeCanje && <p className="success-message">{mensajeCanje}</p>}
      {error && <p className="error-message">{error}</p>}

      {premio && (
        <div className="vista-individual">
          <div className="premio-card">
            <h4>{premio.nombre}</h4>
            <p>{premio.descripcion}</p>
            <div className="premio-costo">
              <i className="fas fa-coins"></i> {premio.costo} lowcoins
            </div>
            <button onClick={() => handleCanjear(premio.id)}>Canjear</button>
          </div>

          <div className="navegacion-premio">
            <button
              onClick={() => setPremioActual(premioActual - 1)}
              disabled={premioActual === 0}
            >
              ← Anterior
            </button>
            <span className="contador-premios">
              {premioActual + 1} / {premios.length}
            </span>
            <button
              onClick={() => setPremioActual(premioActual + 1)}
              disabled={premioActual === premios.length - 1}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      <button
        className="boton-toggle-lista"
        onClick={() => setMostrarModal(true)}
      >
        Ver todos los premios
      </button>

      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <h3>Lista completa de premios</h3>
            <button className="cerrar-modal" onClick={() => setMostrarModal(false)}>✖</button>
            <div className="premios-grid">
              {premios.map((p) => (
                <div key={p.id} className="premio-card">
                  <h4>{p.nombre}</h4>
                  <p>{p.descripcion}</p>
                  <div className="premio-costo">
                    <i className="fas fa-coins"></i> {p.costo} lowcoins
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanjePremios;
