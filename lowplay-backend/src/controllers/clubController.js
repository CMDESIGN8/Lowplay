const { registerClub } = require('../models/club');
const pool = require('../config/db');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Por favor, completa todos los campos' });
  }

  try {
    const emailExists = await pool.query('SELECT * FROM clubs WHERE email = $1', [email]);

    if (emailExists.rows.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado como club' });
    }

    const newClub = await registerClub(name, email, password);

    res.status(201).json({
      message: 'Club registrado exitosamente',
      club: newClub,
    });
  } catch (err) {
    console.error('Error al registrar club: ', err);
    res.status(500).json({ message: 'Error interno del servidor', error: err.message });
  }
};

module.exports = {
  register,
};
