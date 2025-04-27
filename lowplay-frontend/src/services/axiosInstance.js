import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://lowplay-1.onrender.com/api', // Cambia si el backend tiene otro puerto
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;