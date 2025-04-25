import axiosInstance from './axiosInstance';

export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Error en el login:', error.response?.data || error.message);
    throw error;
  }
};