import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate  } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate.push('/login');
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
        navigate.push('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

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
