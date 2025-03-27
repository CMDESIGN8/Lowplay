import React, { useState, useEffect } from 'react';
import '../styles/Rewards.css';
import { FaGift, FaRegArrowAltCircleLeft, FaRegArrowAltCircleRight } from 'react-icons/fa';
import { GiCoins } from "react-icons/gi";
import api from '../services/api';

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [currentRewardIndex, setCurrentRewardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No estás autenticado');
      window.location.href = '/'; // Redirigir al login si no hay token
      return;
    }

    const fetchRewards = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/premios', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(response.data)) {
          setRewards(response.data);
        } else {
          throw new Error('Respuesta de datos no válida');
        }
      } catch (error) {
        console.error('Error al obtener los premios:', error);
        setError('No se pudieron cargar los premios. Intenta más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRewards();
  }, []);

  const handleRedeemReward = async (rewardId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No estás autenticado');
      return;
    }

    try {
      const response = await api.post(
        '/premios/canjear',
        { rewardId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.message) {
        alert(response.data.message);
        setRewards((prevRewards) => prevRewards.filter(reward => reward.id !== rewardId));
        setCurrentRewardIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      } else {
        throw new Error('Respuesta inesperada de la API');
      }
    } catch (error) {
      console.error('Error al canjear el premio:', error);
      alert('Error al canjear el premio. Intenta nuevamente. ' + (error.response?.data?.message || error.message));
    }
  };

  const handleNextReward = () => {
    if (currentRewardIndex < rewards.length - 1) {
      setCurrentRewardIndex(currentRewardIndex + 1);
    }
  };

  const handlePreviousReward = () => {
    if (currentRewardIndex > 0) {
      setCurrentRewardIndex(currentRewardIndex - 1);
    }
  };

  if (isLoading) {
    return <p>Cargando premios...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="rewards-container">
      <div className="reward-section">
        {rewards.length === 0 ? (
          <p>No hay premios disponibles.</p>
        ) : (
          <div className="reward-item">
            <div className="reward-info">
            <img
  src={rewards[currentRewardIndex]?.imagen_url || '/default-image.png'}
  alt={rewards[currentRewardIndex]?.nombre || 'Premio'}
  className="reward-image"
  onError={(e) => {
    e.target.onerror = null; // Evita loops de error
  }}
/>
              <h4 className="reward-text">
                <FaGift /> Premio {currentRewardIndex + 1}: {rewards[currentRewardIndex].nombre}
              </h4>
              <p className="reward-text">{rewards[currentRewardIndex].descripcion}</p>
              <p className="reward-text"><GiCoins /> {rewards[currentRewardIndex].costo_lowcoins} LOWCOINS</p>
              <button
                onClick={() => handleRedeemReward(rewards[currentRewardIndex].id)}
                disabled={!localStorage.getItem('token')}
              >
                <FaGift /> Canjear Premio
              </button>
            </div>
            <div className="navigation-buttons">
              <button onClick={handlePreviousReward} disabled={currentRewardIndex === 0}>
                <FaRegArrowAltCircleLeft />
              </button>
              <span className="reward-number">{currentRewardIndex + 1}/{rewards.length}</span>
              <button onClick={handleNextReward} disabled={currentRewardIndex === rewards.length - 1}>
                <FaRegArrowAltCircleRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rewards; 