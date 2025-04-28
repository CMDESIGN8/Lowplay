import axios from 'axios';

const login = async (email, password) => {
  const response = await axios.post('https://lowplay.onrender.com/api/login', { email, password });
  return response.data.token;
};

const register = async (name, email, password) => {
  const response = await axios.post('https://lowplay.onrender.com/api/register', { name, email, password });
  return response.data;
};

export { login, register };
