import axios from 'axios';

// Crear una instancia de Axios
const axiosInstance = axios.create({
  baseURL: 'https://lowplay-1.onrender.com/api', // Este es tu dominio frontend, si el backend está diferente, cambia esta URL.
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para hacer la solicitud de los movimientos
export const getWalletMovements = async (token) => {
  try {
    const response = await axiosInstance.get('/wallet/movimientos', {
      headers: {
        'Authorization': `Bearer ${token}`, // Aquí estás agregando el token de autorización
      },
    });
    return response.data; // Devuelve los movimientos
  } catch (error) {
    console.error('Error al obtener los movimientos:', error);
    throw error; // Lanza el error para manejarlo donde sea que llames a esta función
  }
};


export default axiosInstance;