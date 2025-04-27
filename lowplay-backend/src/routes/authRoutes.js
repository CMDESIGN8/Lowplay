const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // Conexión a la base de datos
const router = express.Router();

const SECRET_KEY = 'lowplay'; // Cambia por una clave secreta más segura

// Ruta para registrar un usuario
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
  
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Por favor, ingresa todos los campos' });
    }
  
    try {
      // Verificar si el email ya existe en la base de datos
      const checkEmailQuery = 'SELECT * FROM users WHERE email = $1';
      const checkEmailResult = await pool.query(checkEmailQuery, [email]);
  
      if (checkEmailResult.rows.length > 0) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }
  
      // Insertar nuevo usuario
      const insertUserQuery = 'INSERT INTO users (name, email, password, wallet) VALUES ($1, $2, $3, $4) RETURNING *';
      const wallet = `${email.split('@')[0]}.LC`; // Generar billetera con el email
      const result = await pool.query(insertUserQuery, [name, email, password, wallet]);
  
      // Asignar 50 lowcoins al usuario recién registrado
      const userId = result.rows[0].id; // Obtener el ID del usuario insertado
      const addLowcoinsQuery = 'UPDATE users SET lowcoins = lowcoins + 50 WHERE id = $1';
      await pool.query(addLowcoinsQuery, [userId]);
  
      // Respuesta exitosa con el nuevo usuario y mensaje
      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: result.rows[0], // Regresar los datos del usuario registrado
        wallet: wallet, // Devolver billetera asociada al usuario
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al registrar usuario', error: err });
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

// Ruta de prueba para verificar conexión a la base de datos
router.get('/test-db', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW()'); // Verifica si puedes hacer una consulta simple
      client.release();
      res.json({
        message: 'Conexión a la base de datos exitosa!',
        time: result.rows[0].now
      });
    } catch (err) {
      console.error('Error de conexión a la base de datos', err);
      res.status(500).json({ error: 'Error al conectar con la base de datos' });
    }
  });

module.exports = router;
