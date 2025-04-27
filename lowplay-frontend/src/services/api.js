import axios from 'axios';

const api = axios.create({
  baseURL: 'https://lowplay.onrender.com/api', // Cambia esto si usas otro puerto
});

export default api;