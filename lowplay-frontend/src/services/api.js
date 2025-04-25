import axios from 'axios';

const api = axios.create({
  baseURL: 'https://lowplay.lowcargo.lat/api', // Cambia esto si usas otro puerto
});

export default api;