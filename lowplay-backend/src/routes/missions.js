const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middlewares/authMiddleware');

// GET todas las misiones del usuario
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const missionsRes = await pool.query(`
      SELECT m.*, 
        COALESCE(um.progreso_actual, 0) AS progreso_actual,
        COALESCE(um.completada, false) AS completada,
        um.evidencia_url
      FROM missions m
      LEFT JOIN user_missions um 
        ON m.id = um.mission_id AND um.user_id = $1
      ORDER BY m.categoria, m.id
    `, [userId]);

    res.json({ missions: missionsRes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener misiones' });
  }
});

// POST completar misión
router.post('/complete', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { missionId, evidencia_url } = req.body;

  try {
    // Obtener misión
    const missionRes = await pool.query('SELECT * FROM missions WHERE id = $1', [missionId]);
    const mission = missionRes.rows[0];
    if (!mission) return res.status(404).json({ error: 'Misión no encontrada' });

    // Verificar si ya completó
    const userMissionRes = await pool.query(
      'SELECT * FROM user_missions WHERE user_id = $1 AND mission_id = $2',
      [userId, missionId]
    );

    if (userMissionRes.rows.length > 0 && userMissionRes.rows[0].completada) {
      return res.status(400).json({ message: 'Ya completaste esta misión' });
    }

    // Insertar o actualizar progreso
    if (userMissionRes.rows.length === 0) {
      await pool.query(
        `INSERT INTO user_missions 
         (user_id, mission_id, progreso_actual, completada, evidencia_url, completed_at) 
         VALUES ($1,$2,$3,$4,$5,NOW())`,
        [userId, missionId, mission.meta, true, evidencia_url || null]
      );
    } else {
      await pool.query(
        `UPDATE user_missions SET 
           progreso_actual=$1, completada=$2, evidencia_url=$3, completed_at=NOW() 
         WHERE id=$4`,
        [mission.meta, true, evidencia_url || null, userMissionRes.rows[0].id]
      );
    }

    // Sumar lupicoins al usuario
    await pool.query('UPDATE users SET lowcoins = lowcoins + $1 WHERE id = $2', [mission.recompensa, userId]);

    res.json({ success: true, recompensa: mission.recompensa });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al completar misión' });
  }
});

module.exports = router;
