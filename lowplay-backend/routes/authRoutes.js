const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');  // Asegúrate de la ruta correcta


router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', verifyToken);

module.exports = router;