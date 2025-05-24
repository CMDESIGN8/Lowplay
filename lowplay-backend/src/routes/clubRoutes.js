const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');

// Ruta de registro de club
router.post('/register', clubController.register);

module.exports = router;
