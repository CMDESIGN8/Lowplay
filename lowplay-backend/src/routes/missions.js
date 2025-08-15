const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Obtener todas las misiones con progreso del usuario
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const missionsRes = await pool.query(`
      SELECT m.*, 
             COALESCE(um.progreso_actual, 0) AS progreso_actual,
             CASE WHEN um.completed_at IS NOT NULL THEN true ELSE false END AS completada
      FROM missions m
      LEFT JOIN user_missions um
        ON m.id = um.mission_id AND um.user_id = $1
      ORDER BY m.id ASC
    `, [userId]);

    res.json({ missions: missionsRes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener misiones' });
  }
});

// Actualizar progreso / completar misión
router.post('/progress', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { missionId, cantidad = 1 } = req.body;

  try {
    const missionRes = await pool.query('SELECT * FROM missions WHERE id = $1', [missionId]);
    const mission = missionRes.rows[0];
    if (!mission) return res.status(404).json({ error: 'Misión no encontrada' });

    // Buscar registro de progreso
    const userMissionRes = await pool.query(
      'SELECT * FROM user_missions WHERE user_id=$1 AND mission_id=$2',
      [userId, missionId]
    );

    let progreso = cantidad;
    let completed_at = null;

    if (userMissionRes.rows.length > 0) {
      progreso = userMissionRes.rows[0].progreso_actual + cantidad;
      if (progreso >= mission.meta) completed_at = new Date();
      await pool.query(
        'UPDATE user_missions SET progreso_actual=$1, completed_at=$2 WHERE id=$3',
        [progreso, completed_at, userMissionRes.rows[0].id]
      );
    } else {
      if (progreso >= mission.meta) completed_at = new Date();
      await pool.query(
        'INSERT INTO user_missions (user_id, mission_id, progreso_actual, completed_at) VALUES ($1,$2,$3,$4)',
        [userId, missionId, progreso, completed_at]
      );
    }

    // Si completada, sumar lowcoins y mejorar carta
    if (progreso >= mission.meta) {
      await pool.query(
        `UPDATE user_cards
         SET lowcoins = lowcoins + $1,
             ${mission.atributo_afectado} = ${mission.atributo_afectado} + $2
         WHERE user_id=$3`,
        [mission.recompensa, mission.valor_por_completacion, userId]
      );
    }

    res.json({
      progreso,
      completada: progreso >= mission.meta,
      recompensa: progreso >= mission.meta ? mission.recompensa : 0,
      atributo_afectado: mission.atributo_afectado,
      valor_por_completacion: mission.valor_por_completacion
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar misión' });
  }
});

module.exports = router;
