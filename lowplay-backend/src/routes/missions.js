// src/routes/missions.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middlewares/authMiddleware');

// POST para actualizar progreso
router.post('/progress', authenticateToken, async (req, res) => {
  const { missionId, cantidad } = req.body;
  const userId = req.user.id;

  try {
    // Traer misión
    const missionRes = await pool.query('SELECT * FROM missions WHERE id = $1', [missionId]);
    const mission = missionRes.rows[0];
    if (!mission) return res.status(404).json({ error: 'Misión no encontrada' });

    // Revisar progreso actual
    const existingRes = await pool.query(`
      SELECT * FROM user_missions 
      WHERE user_id = $1 AND mission_id = $2
    `, [userId, missionId]);

    let progreso = cantidad;
    let completada = false;

    if (existingRes.rows.length > 0) {
      progreso = existingRes.rows[0].progreso_actual + cantidad;
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

    // Sumar lowcoins
    await pool.query(`UPDATE users SET lowcoins = lowcoins + $1 WHERE id = $2`, [mission.recompensa, userId]);

    // Subir atributo de carta si completada
    if (completada) {
      await pool.query(`
        UPDATE user_cards 
        SET ${mission.atributo_afectado} = ${mission.atributo_afectado} + ${mission.valor_por_completacion}
        WHERE user_id=$1
      `, [userId]);
    }

    res.json({ progreso, completada, recompensa: mission.recompensa, atributo_afectado: mission.atributo_afectado, valor_por_completacion: mission.valor_por_completacion });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar progreso de misión' });
  }
});

module.exports = router;
