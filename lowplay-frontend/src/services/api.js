import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Cambia esto si usas otro puerto
});

export default api;