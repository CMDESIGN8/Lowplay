const express = require('express');
const router = express.Router();
const pool = require('../db'); // tu pool de conexión
const { authenticateToken } = require('../middlewares/authMiddleware');

// GET todas las misiones
// GET todas las misiones (con progreso)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const missions = await pool.query(`
      SELECT m.*, 
        COALESCE(um.progreso, 0) AS progreso,
        m.meta,
        CASE 
          WHEN um.completed_at IS NULL THEN false
          WHEN m.tipo = 'única' THEN true
          WHEN m.tipo = 'diaria' AND DATE(um.completed_at) = CURRENT_DATE THEN true
          ELSE false
        END AS completada
      FROM missions m
      LEFT JOIN user_missions um 
        ON m.id = um.mission_id AND um.user_id = $1
      WHERE (m.fecha_inicio IS NULL OR m.fecha_inicio <= CURRENT_DATE)
        AND (m.fecha_fin IS NULL OR m.fecha_fin >= CURRENT_DATE)
      ORDER BY m.tipo, m.id
    `, [userId]);

    res.json({ missions: missions.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener misiones' });
  }
});

// POST actualizar progreso de misión
router.post('/progress', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { missionId, cantidad } = req.body;

  try {
    const missionRes = await pool.query('SELECT * FROM missions WHERE id = $1', [missionId]);
    const mission = missionRes.rows[0];
    if (!mission) return res.status(404).json({ error: 'Misión no encontrada' });

    // Obtener progreso actual
    const userMissionRes = await pool.query(`
      SELECT progreso FROM user_missions
      WHERE user_id = $1 AND mission_id = $2
    `, [userId, missionId]);

    let nuevoProgreso = cantidad;
    if (userMissionRes.rows.length > 0) {
      nuevoProgreso += userMissionRes.rows[0].progreso;
      await pool.query(`
        UPDATE user_missions
        SET progreso = $1, ultima_actualizacion = NOW()
        WHERE user_id = $2 AND mission_id = $3
      `, [nuevoProgreso, userId, missionId]);
    } else {
      await pool.query(`
        INSERT INTO user_missions (user_id, mission_id, progreso)
        VALUES ($1, $2, $3)
      `, [userId, missionId, cantidad]);
    }

    // Si ya llegó a la meta → completar misión
    if (nuevoProgreso >= mission.meta) {
      await pool.query(`
        UPDATE user_missions
        SET completed_at = NOW()
        WHERE user_id = $1 AND mission_id = $2
      `, [userId, missionId]);

      await pool.query(`
        UPDATE users SET lowcoins = lowcoins + $1 WHERE id = $2
      `, [mission.recompensa, userId]);

      return res.json({ completada: true, recompensa: mission.recompensa });
    }

    res.json({ completada: false, progreso: nuevoProgreso, meta: mission.meta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar progreso' });
  }
});

module.exports = router;
