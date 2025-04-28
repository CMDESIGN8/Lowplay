import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('https://lowplay.onrender.com/api/profile', { headers: { Authorization: `Bearer ${token}` } });
        console.log('Datos del usuario:', response.data.user); // Ahora ves directamente los campos
        setUser(response.data.user);  // ✔️
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
  
    fetchUser();
  }, []);

  return (
    <div>
      {user ? (
        <>
          <h2>Bienvenido, {user.name}</h2>
          <p>Email: {user.email}</p>
          <p>Wallet: {user.wallet}</p>
          <p>Lowcoins: {user.lowcoins}</p>
          <p>Perfil completado: {user.profile_completed ? 'Sí' : 'RE'}</p>
        </>
      ) : (
        <p>No se pudo cargar la información del usuario.</p>
      )}
    </div>
  );
};

export default Dashboard;
