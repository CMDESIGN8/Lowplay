import React, { useState } from 'react';
import axios from 'axios';
import './app.css';

const API_URL = 'https://lowplay-1.onrender.com/api/auth';

function App() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [authToken, setAuthToken] = useState(null);
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: ''
  });

  // Handle input change for both register and login
  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  };

  // Handle registration form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/register`, user);
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Error registrando el usuario.');
    }
  };

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: user.email,
        password: user.password
      });
      setAuthToken(response.data.token);
      setMessage('Login exitoso.');
      setUserProfile(response.data.user);
    } catch (error) {
      setMessage('Error en el login.');
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    try {
      const response = await axios.put(`${API_URL}/edit-profile`, {
        userId: userProfile.id,
        name: userProfile.name,
        email: userProfile.email
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setMessage(response.data.message);
      setUserProfile(response.data.user);
    } catch (error) {
      setMessage('Error al actualizar el perfil.');
    }
  };

  return (
    <div className="App">
      <h1>LowPlay App</h1>

      {/* Register Form */}
      <h2>Registro</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={user.name}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={user.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={user.password}
          onChange={handleChange}
        />
        <button type="submit">Registrarse</button>
      </form>

      {/* Login Form */}
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={user.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={user.password}
          onChange={handleChange}
        />
        <button type="submit">Iniciar sesión</button>
      </form>

      {/* Profile */}
      {authToken && (
        <div>
          <h2>Perfil</h2>
          <p>Nombre: {userProfile.name}</p>
          <p>Email: {userProfile.email}</p>
          <input
            type="text"
            placeholder="Nuevo nombre"
            value={userProfile.name}
            onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Nuevo email"
            value={userProfile.email}
            onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
          />
          <button onClick={handleUpdateProfile}>Actualizar perfil</button>
        </div>
      )}

      {/* Message */}
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;
