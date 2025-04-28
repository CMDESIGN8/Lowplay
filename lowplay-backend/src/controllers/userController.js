const { registerUser } = require('../models/user');
const pool = require('../config/db');

// Función para generar una wallet única
const generateUniqueWallet = async (baseWallet) => {
  let wallet = baseWallet;
  let counter = 1;

  // Buscar si la wallet ya existe
  let result = await pool.query('SELECT * FROM users WHERE wallet = $1', [wallet]);

  // Si existe, seguir probando agregando números
  while (result.rows.length > 0) {
    wallet = `${baseWallet.split('.LC')[0]}-${counter}.LC`;
    result = await pool.query('SELECT * FROM users WHERE wallet = $1', [wallet]);
    counter++;
  }

  return wallet;
};

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

    // Generar billetera base
    const baseWallet = `${email.split('@')[0]}.LC`;

    // Asegurar billetera única
    const wallet = await generateUniqueWallet(baseWallet);

    // Registrar el usuario (ahora asigna también 50 lowcoins)
    const newUser = await registerUser(name, email, password, wallet);

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
