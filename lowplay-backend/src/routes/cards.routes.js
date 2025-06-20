const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Función para generar stats entre 70 y 99
function generateStats() {
  return {
    pace: Math.floor(Math.random() * (99 - 70 + 1)) + 70,
    shooting: Math.floor(Math.random() * (99 - 70 + 1)) + 70,
    passing: Math.floor(Math.random() * (99 - 70 + 1)) + 70,
    dribbling: Math.floor(Math.random() * (99 - 70 + 1)) + 70,
    defense: Math.floor(Math.random() * (99 - 70 + 1)) + 70,
    physical: Math.floor(Math.random() * (99 - 70 + 1)) + 70,
  };
}

// Crear una carta nueva
router.post('/create', async (req, res) => {
  const { userId, playerName } = req.body;
  if (!userId || !playerName) {
    return res.status(400).json({ message: 'Faltan userId o playerName' });
  }

  const stats = generateStats();

  const query = `
    INSERT INTO cards
      (user_id, name, pace, shooting, passing, dribbling, defense, physical)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;

  const values = [
    userId,
    playerName,
    stats.pace,
    stats.shooting,
    stats.passing,
    stats.dribbling,
    stats.defense,
    stats.physical,
  ];

  try {
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando carta:', error);
    res.status(500).json({ message: 'Error al crear carta' });
  }
});

// Listar cartas de un usuario
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const query = 'SELECT * FROM cards WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener cartas:', error);
    res.status(500).json({ message: 'Error al obtener cartas' });
  }
});

module.exports = router;
