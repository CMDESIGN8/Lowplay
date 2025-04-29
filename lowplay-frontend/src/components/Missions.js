import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.min.css';
import './Misiones.css';

const Missions = () => {
  const [missions, setMissions] = useState([]);

  const fetchMissions = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('https://lowplay.onrender.com/api/missions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setMissions(res.data.missions);
  };

  const completeMission = async (missionId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('https://lowplay.onrender.com/api/missions/complete', { missionId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`¡Ganaste ${res.data.recompensa} lowcoins!`);
      fetchMissions(); // recargar para mostrar estado actualizado
    } catch (err) {
      alert(err.response?.data?.message || 'Error al completar misión');
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  return (
    <div className="missions-section">
      <h3>Misiones</h3>
      <Swiper
        spaceBetween={30}
        slidesPerView={3}  // Mostrar 3 misiones a la vez
        loop={true}  // Hacer que el slider se repita
        pagination={{
          clickable: true,
        }}
        breakpoints={{
          640: {
            slidesPerView: 1, // 1 misión en pantallas pequeñas
          },
          768: {
            slidesPerView: 2, // 2 misiones en pantallas medianas
          },
          1024: {
            slidesPerView: 3, // 3 misiones en pantallas grandes
          }
        }}
      >
        {missions.map((m) => (
          <SwiperSlide key={m.id}>
            <div className="mission-card">
              <strong>{m.nombre}</strong>: {m.descripcion} ({m.tipo})
              <div className="mission-reward">
                <i className="fas fa-coins"></i>
                <span>Recompensa: {m.recompensa} lowcoins</span>
                <br />
                {m.completada ? (
                  <span style={{ color: 'green' }}>✅ Completada</span>
                ) : (
                  <button onClick={() => completeMission(m.id)}>Completar</button>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Missions;
