const express = require('express');
const router = express.Router();
const { getCardsByUser, createCard } = require('../models/cards.model');
const authenticateToken = require('../middleware/authenticateToken'); // Middleware que valide JWT

// Obtener cartas del usuario autenticado
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const cards = await getCardsByUser(userId);
    res.json({ cards });
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ message: 'Error al obtener cartas' });
  }
});

// Crear nueva carta para el usuario
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { club_id, name, logo_url, stats } = req.body;

    if (!club_id || !name || !stats) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    const newCard = await createCard({
      user_id: userId,
      club_id,
      name,
      logo_url,
      pace: stats.pace,
      shooting: stats.shooting,
      passing: stats.passing,
      dribbling: stats.dribbling,
      defense: stats.defense,
      physical: stats.physical,
    });

    res.status(201).json({ card: newCard });
  } catch (error) {
    console.error('Error creando carta:', error);
    res.status(500).json({ message: 'Error al crear carta' });
  }
});

module.exports = router;
