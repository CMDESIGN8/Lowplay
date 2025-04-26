const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Ruta para obtener el perfil del usuario
router.get('/profile', authenticateJWT, getUserProfile);  // Protegemos la ruta con el middleware JWT


module.exports = router;