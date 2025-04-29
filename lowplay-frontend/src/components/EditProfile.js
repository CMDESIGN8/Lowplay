import React, { useState } from 'react';
import axios from 'axios';

const EditProfile = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('/api/profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(res.data.message); // 💬 Aca se setea el mensaje
      alert(res.data.message);      // ✅ Para asegurarte de que lo ves
    } catch (err) {
      console.error(err);
      setMessage('Error al actualizar el perfil');
    }
  };

  return (
    <div>
      <h2>Editar Perfil</h2>

      {message && <div style={{ color: 'green' }}>{message}</div>}

      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Nombre" onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} />
        <button type="submit">Guardar</button>
      </form>
    </div>
  );
};

export default EditProfile;
