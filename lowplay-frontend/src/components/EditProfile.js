import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  // Cargar datos actuales del usuario
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setFormData({
          name: res.data.user.name,
          email: res.data.user.email,
        });
      } catch (error) {
        console.error('Error al cargar el perfil:', error);
        setMessage('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.put('/api/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(res.data.message); // ✅ Mensaje del backend
    } catch (error) {
      console.error('Error al editar perfil:', error);
      setMessage('Error al editar perfil');
    }
  };

  if (loading) return <p>Cargando perfil...</p>;

  return (
    <div>
      <h2>Editar Perfil</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Guardar Cambios</button>
      </form>

      {message && <p style={{ marginTop: '10px', color: 'green' }}>{message}</p>}
    </div>
  );
};

export default EditProfile;
