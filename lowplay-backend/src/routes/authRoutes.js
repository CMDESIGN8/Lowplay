const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // Conexión a la base de datos
const router = express.Router();

const SECRET_KEY = 'tu_secreto_aqui'; // Cambia por una clave secreta más segura

// Registrar usuario
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Por favor, proporciona todos los datos requeridos.' });
  }
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Este correo ya está registrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const wallet = `${email.split('@')[0]}.LC`;

    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, wallet, lowcoins) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, hashedPassword, wallet, 50]
    );

    const token = jwt.sign({ userId: newUser.rows[0].id }, SECRET_KEY, { expiresIn: '1h' });

    res.status(201).json({
      message: 'Usuario registrado con éxito.',
      user: {
        id: newUser.rows[0].id,
        name: newUser.rows[0].name,
        email: newUser.rows[0].email,
        wallet: newUser.rows[0].wallet,
        lowcoins: newUser.rows[0].lowcoins,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hubo un error al registrar el usuario.' });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Por favor, ingresa tu correo y contraseña.' });
  }
  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos.' });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos.' });
    }

    const token = jwt.sign({ userId: user.rows[0].id }, SECRET_KEY, { expiresIn: '1h' });

    res.json({
      message: 'Login exitoso.',
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
        wallet: user.rows[0].wallet,
        lowcoins: user.rows[0].lowcoins,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hubo un error al intentar iniciar sesión.' });
  }
});

// Editar perfil de usuario
router.put('/edit-profile', async (req, res) => {
  const { userId, name, email } = req.body;
  if (!userId || !name || !email) {
    return res.status(400).json({ message: 'Por favor, proporciona todos los datos requeridos.' });
  }
  try {
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Usuario no encontrado.' });
    }

    const updatedUser = await pool.query(
      'UPDATE users SET name = $1, email = $2, profile_completed = TRUE, lowcoins = lowcoins + 10 WHERE id = $3 RETURNING *',
      [name, email, userId]
    );

    res.json({
      message: 'Perfil actualizado con éxito.',
      user: {
        id: updatedUser.rows[0].id,
        name: updatedUser.rows[0].name,
        email: updatedUser.rows[0].email,
        wallet: updatedUser.rows[0].wallet,
        lowcoins: updatedUser.rows[0].lowcoins,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Hubo un error al actualizar el perfil.' });
  }
});

module.exports = router;
