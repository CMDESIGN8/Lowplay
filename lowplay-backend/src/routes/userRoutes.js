const express = require('express');
const router = express.Router();
const { register, login, editProfile  } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { getProfile } = require('../controllers/userController');

// Ruta para registrar un usuario
router.post('/register', register);
// Ruta para login
router.post('/login', login);
// Ruta privada
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, editProfile); // 👈 Nueva ruta para actualizar perfil



module.exports = router;
