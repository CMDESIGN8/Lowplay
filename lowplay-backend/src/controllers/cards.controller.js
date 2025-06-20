const db = require('../db'); // tu conexión y acceso a BD (ajusta según tu implementación)

function randomStat() {
  return Math.floor(Math.random() * 50) + 50; // stats entre 50 y 99
}

const createUserCard = async (req, res) => {
  try {
    const { userId, playerName, clubId } = req.body;

    if (!userId || !playerName) {
      return res.status(400).json({ message: 'Faltan datos obligatorios.' });
    }

    // Crear objeto carta con stats aleatorias
    const newCard = {
      userId,
      name: playerName,
      clubId: clubId || null,
      pace: randomStat(),
      shooting: randomStat(),
      passing: randomStat(),
      dribbling: randomStat(),
      defense: randomStat(),
      physical: randomStat(),
      createdAt: new Date(),
    };

    // Guardar en base de datos
    // Ejemplo con PostgreSQL (ajusta según tu DB):
    const query = `
      INSERT INTO user_cards
      (user_id, name, club_id, pace, shooting, passing, dribbling, defense, physical, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *;
    `;

    const values = [
      newCard.userId,
      newCard.name,
      newCard.clubId,
      newCard.pace,
      newCard.shooting,
      newCard.passing,
      newCard.dribbling,
      newCard.defense,
      newCard.physical,
      newCard.createdAt,
    ];

    const result = await db.query(query, values);
    const createdCard = result.rows[0];

    res.status(201).json({ card: createdCard });
  } catch (error) {
    console.error('Error creando carta:', error);
    res.status(500).json({ message: 'Error al crear la carta' });
  }
};

const getUserCards = async (req, res) => {
  try {
    const userId = req.user.id; // asumido de authMiddleware
    const query = `SELECT * FROM user_cards WHERE user_id = $1 ORDER BY created_at DESC`;
    const result = await db.query(query, [userId]);
    res.json({ cards: result.rows });
  } catch (error) {
    console.error('Error obteniendo cartas:', error);
    res.status(500).json({ message: 'Error al obtener cartas' });
  }
};

module.exports = { createUserCard, getUserCards };
