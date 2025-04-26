const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const { getUserData } = require('../controllers/userController');
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();



router.post('/register', registerUser);
router.post('/login', loginUser);

// Ruta para obtener el perfil del usuario
router.get('/profile', verifyToken, getUserData);  // Protegemos la ruta con el middleware JWT


module.exports = router;