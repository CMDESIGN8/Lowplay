import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      history.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get('https://lowplay.onrender.com/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err) {
        console.error(err);
        history.push('/login');
      }
    };

    fetchUserData();
  }, [history]);

  return (
    <div>
      {user ? (
        <>
          <h2>Bienvenido, {user.name}</h2>
          <p>Email: {user.email}</p>
          <p>Wallet: {user.wallet}</p>
          <p>Lowcoins: {user.lowcoins}</p>
          <p>Perfil completado: {user.profile_completed ? 'Sí' : 'No'}</p>
        </>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
};

export default Dashboard;
