import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Misiones.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const MisionesDiarias = ({ userId }) => {
  const [missions, setMissions] = useState([]);

  useEffect(() => {
    axios.get("/api/missions").then(res => setMissions(res.data));
  }, []);

  const completar = (id) => {
    axios.post(`/api/missions/${id}/completar`, { userId })
      .then(res => alert(`🎉 ${res.data.message} | XP: ${res.data.xp}`))
      .catch(err => alert(err.response.data.error));
  };

  return (
    <div>
      <h2>🔥 Misiones Diarias</h2>
      {missions.map(m => (
        <div key={m.id} className="mission-card">
          <h3>{m.nombre}</h3>
          <p>{m.descripcion}</p>
          <button onClick={() => completar(m.id)}>Reclamar</button>
        </div>
      ))}
    </div>
  );
};

export default MisionesDiarias;