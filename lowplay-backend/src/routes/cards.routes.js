const express = require('express');
const router = express.Router();
const { createUserCard, getUserCards } = require('../controllers/cards.controller');
const authMiddleware = require('../middleware/authMiddleware'); // si usas auth

// Crear una carta para el usuario (requiere autenticación)
router.post('/create', authMiddleware, createUserCard);

// Obtener cartas del usuario (opcional)
router.get('/', authMiddleware, getUserCards);

module.exports = router;
