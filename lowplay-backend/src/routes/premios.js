const express = require('express');
const router = express.Router();
const db = require('../db'); // Ajusta la ruta a tu conexión a la base de datos
const authenticateToken = require('../middlewares/authMiddleware').authenticateToken;

// Ruta para obtener todos los premios disponibles
router.get('/premios', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT id, nombre, descripcion, costo FROM premios');
    res.json({ premios: result.rows });
  } catch (err) {
    console.error('Error al obtener los premios:', err);
    res.status(500).json({ message: 'Error al obtener los premios' });
  }
});

// Ruta para canjear un premio
router.post('/canjear', authenticateToken, async (req, res) => {
  const { premioId } = req.body;
  const userId = req.user.id; // Obtenemos el ID del usuario autenticado

  try {
    // 1. Obtener el premio de la base de datos
    const premioResult = await db.query('SELECT id, nombre, costo FROM premios WHERE id = $1', [premioId]);
    const premio = premioResult.rows[0];

    if (!premio) {
      return res.status(404).json({ message: 'El premio no existe.' });
    }

    // 2. Obtener el saldo actual del usuario
    const userResult = await db.query('SELECT lowcoins FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    if (user.lowcoins < premio.costo) {
      return res.status(400).json({ message: 'No tienes suficientes lowcoins para canjear este premio.' });
    }

    // 3. Restar el costo del premio al saldo del usuario
    await db.query('UPDATE users SET lowcoins = lowcoins - $1 WHERE id = $2', [premio.costo, userId]);

    res.json({ message: `¡Has canjeado ${premio.nombre}!` });

  } catch (err) {
    console.error('Error al canjear el premio:', err);
    res.status(500).json({ message: 'Error al canjear el premio.' });
  }
});

module.exports = router;