const { registerUser } = require('../models/user');
const pool = require('../config/db');

// Función para registrar un nuevo usuario
const register = async (req, res) => {
    const { name, email, password } = req.body;
  
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Faltan datos para registrar al usuario.' });
    }
  
    try {
      // Insertar el nuevo usuario en la base de datos
      const result = await pool.query(
        'INSERT INTO users (name, email, password, wallet, lowcoins) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, email, password, `${email.split('@')[0]}.LC`, 50] // Asignamos los lowcoins directamente en la inserción
      );
  
      const newUser = result.rows[0];
  
      // Aquí podrías agregar lógica adicional si necesitas hacer algo después de crear al usuario
  
      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: newUser,
      });
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
  };
  
  module.exports = { register };