import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate
import { Link } from 'react-router-dom'; // Agregamos la importación de Link
import api from '../services/api';
import '../styles/login.css'; // Importamos el archivo de estilos



const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();  // Usamos useNavigate para la redirección

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token); // Guardar token en el almacenamiento local
      alert('Inicio de sesión exitoso');
      navigate('/dashboard'); // Redirigir al dashboard
    } catch (error) {
      console.error(error);
      alert('Error en el inicio de sesión');
    }
  };

  return (

    <div className="login-container">
    <h1 className="login-title">Iniciar Sesión</h1>
    <form onSubmit={handleLogin}>
        <div className="login-form-group">
            <label htmlFor="email" className="login-label">Correo</label>
            <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu correo"
                className="login-input"
            />
        </div>
        <div className="login-form-group">
            <label htmlFor="password" className="login-label">Contraseña</label>
            <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="login-input"
            />
        </div>
        <button type="submit" className="login-button">Iniciar Sesión</button>
    </form>
    <div className="login-link">
        <p>¿No tienes una cuenta? <a href="/register">Regístrate aquí</a></p>
    </div>
</div>
  );
};

export default Login;