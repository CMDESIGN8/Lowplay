const express = require('express');
const router = express.Router();
const pool = require('../db'); // tu pool de conexión
const authenticateToken = require('../middleware/auth'); // tu middleware JWT

// GET todas las misiones
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const missions = await pool.query(`
      SELECT m.*, 
        CASE 
          WHEN um.completed_at IS NULL THEN false
          WHEN m.tipo = 'única' THEN true
          WHEN m.tipo = 'diaria' AND DATE(um.completed_at) = CURRENT_DATE THEN true
          ELSE false
        END AS completada
      FROM missions m
      LEFT JOIN user_missions um 
        ON m.id = um.mission_id AND um.user_id = $1
    `, [userId]);

    res.json({ missions: missions.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener misiones' });
  }
});

// POST completar misión
router.post('/complete', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { missionId } = req.body;

  try {
    const missionRes = await pool.query('SELECT * FROM missions WHERE id = $1', [missionId]);
    const mission = missionRes.rows[0];
    if (!mission) return res.status(404).json({ error: 'Misión no encontrada' });

    // Verificar si ya la completó
    const existingRes = await pool.query(`
      SELECT * FROM user_missions 
      WHERE user_id = $1 AND mission_id = $2
      ${mission.tipo === 'diaria' ? "AND DATE(completed_at) = CURRENT_DATE" : ""}
    `, [userId, missionId]);

    if (existingRes.rows.length > 0) {
      return res.status(400).json({ message: 'Ya completaste esta misión' });
    }

    // Insertar en user_missions
    await pool.query(`
      INSERT INTO user_missions (user_id, mission_id) 
      VALUES ($1, $2)
    `, [userId, missionId]);

    // Sumar lowcoins
    await pool.query(`
      UPDATE users SET lowcoins = lowcoins + $1 WHERE id = $2
    `, [mission.recompensa, userId]);

    res.json({ success: true, recompensa: mission.recompensa });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al completar misión' });
  }
});

module.exports = router;
