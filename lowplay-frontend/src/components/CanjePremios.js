import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CanjePremios.css'; // Crea este archivo CSS

const CanjePremios = () => {
  const [premios, setPremios] = useState([]);
  const [error, setError] = useState('');
  const [mensajeCanje, setMensajeCanje] = useState('');

  const fetchPremios = async () => { // Definir fetchPremios aquí
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

  const handleCanjear = async (premioId, costo) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        'https://lowplay.onrender.com/api/canjear',
        { premioId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensajeCanje(response.data.message || '¡Canje realizado con éxito!');
      fetchPremios(); // Llamar a fetchPremios aquí
      setTimeout(() => setMensajeCanje(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al canjear el premio.');
      console.error('Error canjeando premio:', err);
      setTimeout(() => setError(''), 3000);
    }
  };

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="canje-premios-section">
      <h3>Canje de Premios</h3>
      {mensajeCanje && <p className="success-message">{mensajeCanje}</p>}
      <div className="premios-grid">
        {premios.map(premio => (
          <div key={premio.id} className="premio-card">
            <h4>{premio.nombre}</h4>
            <p>{premio.descripcion}</p>
            <div className="premio-costo">
              <i className="fas fa-coins"></i> <span>{premio.costo} lowcoins</span>
            </div>
            <button onClick={() => handleCanjear(premio.id, premio.costo)}>Canjear</button>
          </div>
        ))}
        {premios.length === 0 && !error && <p>No hay premios disponibles en este momento.</p>}
      </div>
      {/* Opcional: Sección para el historial de canjes */}
    </div>
  );
};

export default CanjePremios;