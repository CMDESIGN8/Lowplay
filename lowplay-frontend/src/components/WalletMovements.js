import React, { useState, useEffect } from 'react';
import '../styles/WalletMovements.css';
import api from '../services/api';
import { GiTrophy } from "react-icons/gi";
import { MdOutlinePublishedWithChanges } from "react-icons/md"; // Importa el ícono para el canje

const WalletMovements = () => {
  const [movements, setMovements] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchWalletMovements = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No estás autenticado');
        return;
      }

      try {
        const response = await api.get('http://localhost:5000/wallet/movimientos', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log(response.data); // Añadir este log para verificar los datos recibidos
        setMovements(response.data);
      } catch (err) {
        console.error(err);
        setError('Error al obtener los movimientos');
      }
    };

    fetchWalletMovements();
  }, []);

  // Lógica para obtener los movimientos de la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMovements = movements.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(movements.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="wallet-movements-container">
      {error && <p>{error}</p>}
      {movements.length === 0 ? (
        <p>No tienes movimientos recientes.</p>
      ) : (
        <>
          <ul>
            {currentMovements.map((movement) => (
              <li
                key={movement.id}
                className={movement.tipo_movimiento === 'recompensa' ? 'recompensa' : 'canje'}
              >
                {/* Mostrar el ícono correspondiente según el tipo de movimiento */}
                {movement.tipo_movimiento === 'recompensa' ? (
                  <GiTrophy className="trophy-icon-green" />
                ) : (
                  <MdOutlinePublishedWithChanges className="trophy-icon-red" />
                )}
                <p><strong>{movement.tipo_movimiento === 'recompensa' ? 'Misión' : 'Canje'}:</strong> {movement.nombre || movement.premio_nombre}</p>
                <p>
                  <strong>Recompensa:</strong>{' '}
                  <span className={movement.tipo_movimiento === 'recompensa' ? 'reward-amount' : ''}>
                    {movement.recompensa || movement.costo_lowcoins} LOWCOINS
                  </span>
                </p>
                <p><strong>Fecha:</strong> {new Date(movement.fecha_completada).toLocaleString()}</p>
              </li>
            ))}
          </ul>
          <div className="pagination">
            <button onClick={handlePrevPage} disabled={currentPage === 1}>
              Anterior
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === Math.ceil(movements.length / itemsPerPage)}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WalletMovements;