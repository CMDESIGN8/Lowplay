const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middlewares/authMiddleware');
const multer = require('multer');

// Configuración de multer para subir evidencia
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Carpeta donde se guardan archivos
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Obtener todas las misiones
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const missions = await pool.query(`
      SELECT m.*, 
        CASE WHEN um.completed_at IS NOT NULL THEN true ELSE false END AS completada
      FROM missions m
      LEFT JOIN user_missions um 
        ON m.id = um.mission_id AND um.user_id = $1
      ORDER BY m.id
    `, [userId]);

    res.json({ missions: missions.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener misiones' });
  }
});

// Completar misión subiendo evidencia
router.post('/submit', authenticateToken, upload.single('evidence'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { missionId } = req.body;
    const filePath = req.file?.path;

    if (!filePath) return res.status(400).json({ error: 'Se requiere evidencia' });

    // Insertar en user_missions
    await pool.query(`
      INSERT INTO user_missions (user_id, mission_id, completed_at, evidencia)
      VALUES ($1, $2, NOW(), $3)
      ON CONFLICT (user_id, mission_id) DO NOTHING
    `, [userId, missionId, filePath]);

    // Sumar lupicoins
    const missionRes = await pool.query('SELECT recompensa FROM missions WHERE id = $1', [missionId]);
    const recompensa = missionRes.rows[0]?.recompensa || 0;

    await pool.query('UPDATE users SET lowcoins = lowcoins + $1 WHERE id = $2', [recompensa, userId]);

    res.json({ success: true, recompensa });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar misión' });
  }
});

module.exports = router;
