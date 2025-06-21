const db = require('../db'); // tu conexión a la base de datos

// Genera un número aleatorio entre 50 y 99
function randomStat() {
  return Math.floor(Math.random() * 50) + 50;
}

// Crear una carta FIFA para el usuario autenticado
const createUserCard = async (req, res) => {
  try {
    const { playerName, club_id, stats } = req.body;
    const userId = req.user.id;

    if (!userId || !playerName) {
      return res.status(400).json({ message: 'Faltan usuario o nombre del jugador.' });
    }

    const newCard = {
      userId,
      name: playerName,
      clubId: club_id || null,
      pace: stats?.pace || randomStat(),
      shooting: stats?.shooting || randomStat(),
      passing: stats?.passing || randomStat(),
      dribbling: stats?.dribbling || randomStat(),
      defense: stats?.defense || randomStat(),
      physical: stats?.physical || randomStat(),
      createdAt: new Date(),
    };

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

// Obtener todas las cartas del usuario autenticado
const getUserCards = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `SELECT * FROM user_cards WHERE user_id = $1 ORDER BY created_at DESC`;
    const result = await db.query(query, [userId]);

    res.json({ cards: result.rows });
  } catch (error) {
    console.error('Error obteniendo cartas:', error);
    res.status(500).json({ message: 'Error al obtener cartas' });
  }
};

module.exports = {
  createUserCard,
  getUserCards,
};
