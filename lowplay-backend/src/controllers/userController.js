const { registerUser } = require('../models/user');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');


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

// Función que maneja el login de un usuario
const login = async (req, res) => {
    const { email, password } = req.body;
  
    // Validación básica
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor, ingresa email y contraseña' });
    }
  
    try {
      // Buscar usuario por email
      const checkEmailQuery = 'SELECT * FROM users WHERE email = $1';
      const checkEmailResult = await pool.query(checkEmailQuery, [email]);
  
      if (checkEmailResult.rows.length === 0) {
        return res.status(400).json({ message: 'El email no está registrado' });
      }
  
      const user = checkEmailResult.rows[0];
  
      // Comparar contraseñas (texto plano por ahora, luego lo mejoramos con bcrypt si quieres)
      if (user.password !== password) {
        return res.status(400).json({ message: 'Contraseña incorrecta' });
      }
  
      // Generar JWT Token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
  
      res.status(200).json({
        message: 'Login exitoso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          wallet: user.wallet,
          lowcoins: user.lowcoins,
          profile_completed: user.profile_completed,
          created_at: user.created_at
        },
        token,
      });
  
    } catch (err) {
      console.error('Error al hacer login: ', err);
      res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
  };

  const getProfile = async (req, res) => {
    try {
      const { id } = req.user; // Info del token
      const userResult = await pool.query('SELECT id, name, email, wallet, lowcoins, profile_completed, created_at FROM users WHERE id = $1', [id]);
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      res.status(200).json({ user: userResult.rows[0] });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  };
  
  // Función para editar perfil
const editProfile = async (req, res) => {
    const userId = req.user.id; // Viene del token
    const { name, email } = req.body;
  
    if (!name || !email) {
      return res.status(400).json({ message: 'Por favor, completa nombre y email' });
    }
  
    try {
      // Verificar si el email ya está siendo usado por otro usuario
      const checkEmailQuery = 'SELECT * FROM users WHERE email = $1 AND id != $2';
      const emailExists = await pool.query(checkEmailQuery, [email, userId]);
  
      if (emailExists.rows.length > 0) {
        return res.status(400).json({ message: 'El email ya está en uso por otro usuario' });
      }
  
      // Actualizar usuario
      const updateQuery = `
        UPDATE users
        SET name = $1, email = $2, profile_completed = TRUE
        WHERE id = $3
        RETURNING *;
      `;
      const updatedUserResult = await pool.query(updateQuery, [name, email, userId]);
      const updatedUser = updatedUserResult.rows[0];
  
      // Si el usuario no había completado su perfil antes, sumar 10 lowcoins
      if (!req.user.profile_completed) {
        await pool.query('UPDATE users SET lowcoins = lowcoins + 10 WHERE id = $1', [userId]);
      }
  
      res.json({
        message: 'Perfil actualizado correctamente',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          wallet: updatedUser.wallet,
          lowcoins: updatedUser.lowcoins,
          profile_completed: true,
          created_at: updatedUser.created_at
        }
      });
    } catch (err) {
      console.error('Error al editar perfil: ', err);
      res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
  };
  
  // Función para completar el perfil y asignar lowcoins solo una vez
const completeProfile = async (req, res) => {
    const { name, email } = req.body;  // Recibimos los datos de perfil
  
    // Verificación de datos
    if (!name || !email) {
      return res.status(400).json({ message: 'Por favor, ingresa todos los campos para completar el perfil' });
    }
  
    try {
      const userId = req.user.id; // Usuario autenticado
      const query = 'SELECT * FROM users WHERE id = $1'; // Obtenemos los datos actuales
      const userResult = await pool.query(query, [userId]);
  
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      const user = userResult.rows[0];
  
      // Verificamos si el perfil ya está completado
      if (user.profile_completed) {
        return res.status(400).json({ message: 'El perfil ya está completo' });
      }
  
      // Actualizamos el perfil
      const updateProfileQuery = 'UPDATE users SET name = $1, email = $2, profile_completed = true WHERE id = $3 RETURNING *';
      const updatedUser = await pool.query(updateProfileQuery, [name, email, userId]);
  
      // Asignar 10 lowcoins solo si no estaban asignados previamente
      const addLowcoinsQuery = 'UPDATE users SET lowcoins = lowcoins + 10 WHERE id = $1 RETURNING lowcoins';
      const addLowcoinsResult = await pool.query(addLowcoinsQuery, [userId]);
  
      // Enviar respuesta con el perfil actualizado y los lowcoins
      res.status(200).json({
        message: 'Perfil actualizado y 10 lowcoins asignados',
        user: updatedUser.rows[0],
        lowcoins: addLowcoinsResult.rows[0].lowcoins
      });
  
    } catch (err) {
      console.error('Error al completar perfil: ', err);
      res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
  };
  
  module.exports = { register, login, editProfile, getProfile, completeProfile };
  
