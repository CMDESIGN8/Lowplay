const express = require('express');
const router = express.Router();
const pool = require('../db'); // tu pool de conexión
const { authenticateToken } = require('../middlewares/authMiddleware');

// Lista de atributos válidos de la carta
const validAttributes = ['pace','shooting','passing','dribbling','defense','physical'];

// GET todas las misiones
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const missions = await pool.query(`
      SELECT m.*, 
        CASE 
          WHEN um.completed_at IS NULL THEN false
          WHEN m.tipo = 'única' THEN COALESCE(um.completada,false)
          WHEN m.tipo = 'diaria' AND DATE(um.completed_at) = CURRENT_DATE THEN COALESCE(um.completada,false)
          ELSE false
        END AS completada,
        COALESCE(um.progreso_actual, 0) AS progreso_actual
      FROM missions m
      LEFT JOIN user_missions um 
        ON m.id = um.mission_id AND um.user_id = $1
      ORDER BY m.id ASC
    `, [userId]);

    res.json({ missions: missions.rows });
  } catch (err) {
    console.error('Error GET /missions:', err);
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

    // Revisar progreso actual
    const existingRes = await pool.query(`
      SELECT * FROM user_missions 
      WHERE user_id = $1 AND mission_id = $2
      ${mission.tipo === 'diaria' ? "AND DATE(completed_at) = CURRENT_DATE" : ""}
    `, [userId, missionId]);

    let progreso = 1;
    let completada = false;

    if (existingRes.rows.length > 0) {
      progreso = existingRes.rows[0].progreso_actual + 1;
      completada = progreso >= mission.meta;
      await pool.query(`
        UPDATE user_missions 
        SET progreso_actual=$1, completada=$2, completed_at=NOW() 
        WHERE id=$3
      `, [progreso, completada, existingRes.rows[0].id]);
    } else {
      completada = progreso >= mission.meta;
      await pool.query(`
        INSERT INTO user_missions (user_id, mission_id, progreso_actual, completada, completed_at)
        VALUES ($1,$2,$3,$4,NOW())
      `, [userId, missionId, progreso, completada]);
    }

    // Sumar lowcoins al usuario
    await pool.query(`UPDATE users SET lowcoins = lowcoins + $1 WHERE id = $2`, [mission.recompensa, userId]);

    // Subir atributo de la carta si completada
    if (completada && validAttributes.includes(mission.atributo_afectado)) {
      await pool.query(`
        UPDATE user_cards 
        SET ${mission.atributo_afectado} = ${mission.atributo_afectado} + $1
        WHERE user_id=$2
      `, [mission.valor_por_completacion, userId]);
    }

    res.json({ success: true, recompensa: mission.recompensa, progreso, completada });
  } catch (err) {
    console.error('Error POST /missions/complete:', err);
    res.status(500).json({ error: 'Error al completar misión' });
  }
});

module.exports = router;
