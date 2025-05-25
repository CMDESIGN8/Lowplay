const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');
const { register, getAllClubs } = require('../controllers/clubController');


// Ruta de registro de club
router.post('/register', clubController.register);
router.get('/', getAllClubs); // <-- esta es la nueva ruta


module.exports = router;
