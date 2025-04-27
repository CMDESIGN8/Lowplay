const { registerUser } = require('../models/user');
const pool = require('../config/db');

// Función que maneja el registro de un nuevo usuario
const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Validación básica de datos
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Por favor, ingresa todos los campos' });
  }

  try {
    // Verifica si el email ya está registrado
    const checkEmailQuery = 'SELECT * FROM users WHERE email = $1';
    const checkEmailResult = await pool.query(checkEmailQuery, [email]);

    if (checkEmailResult.rows.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Generar billetera asociada al usuario
    const wallet = `${email.split('@')[0]}.LC`; 

    // Llamada al modelo para registrar el usuario
    const newUser = await registerUser(name, email, password, wallet);

    // Responder con éxito y enviar los datos del nuevo usuario
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: newUser,
    });
  } catch (err) {
    console.error('Error al registrar usuario: ', err);
    res.status(500).json({ message: 'Error interno del servidor', error: err.message });
  }
};

module.exports = { register };
