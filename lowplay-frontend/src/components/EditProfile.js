// src/components/EditProfile.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleEditProfile = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put('https://lowplay.onrender.com/api/edit-profile', {
        name,
        email,
      });

      // Si fue exitoso, mostramos el mensaje de éxito
      if (response.data.message) {
        setSuccessMessage(response.data.message); // Mensaje de éxito
      }

      navigate('/profile'); // Redirigimos a la página de perfil después de editar
    } catch (err) {
      setError('Hubo un error al editar el perfil');
    }
  };

  return (
    <div>
      <h2>Editar Perfil</h2>
      
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>} {/* Aquí mostramos el mensaje de éxito */}
      
      <form onSubmit={handleEditProfile}>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Actualizar Perfil</button>
      </form>
    </div>
  );
};

export default EditProfile;
