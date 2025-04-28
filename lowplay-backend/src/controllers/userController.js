const jwt = require('jsonwebtoken');
const pool = require('../config/db');

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

module.exports = { register, login };
