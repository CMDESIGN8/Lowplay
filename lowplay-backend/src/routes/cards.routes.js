const express = require('express');
const router = express.Router();
const { createUserCard, getUserCards } = require('../controllers/cards.controller');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Ruta para crear una carta (requiere token JWT)
router.post('/create', authenticateToken, createUserCard);

// Ruta para obtener todas las cartas del usuario (requiere token JWT)
router.get('/', authenticateToken, getUserCards);

module.exports = router;
