import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Asegúrate de importar useNavigate
import api from '../services/api';
import '../styles/register.css'; // Importamos el archivo de estilos



const Register = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Asegúrate de definir navigate correctamente


  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('api/register', { nombre, email, password });
      alert('Registro exitoso');
      // Después del registro, redirigimos al Dashboard
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Error en el registro');
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Registrarse</button>
    </form>
  );
};

export default Register;