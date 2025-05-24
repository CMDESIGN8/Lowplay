const express = require('express');
const router = express.Router();
const { associateClub, getMyClubs } = require('../controllers/userClub.controller');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/asociar', authenticateToken, associateClub);
router.get('/mis-clubes', authenticateToken, getMyClubs);

module.exports = router;
