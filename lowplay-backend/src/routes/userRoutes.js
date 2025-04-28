const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { getProfile } = require('../controllers/userController');

// Ruta para registrar un usuario
router.post('/register', register);
// Ruta para login
router.post('/login', login);
// Ruta privada
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
