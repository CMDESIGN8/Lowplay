const pool = require('../config/db');

const getCardsByUser = async (userId) => {
  const query = 'SELECT * FROM cards WHERE user_id = $1 ORDER BY created_at DESC';
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

const createCard = async (cardData) => {
  const {
    user_id,
    club_id,
    name,
    logo_url,
    pace,
    shooting,
    passing,
    dribbling,
    defense,
    physical,
  } = cardData;

  const query = `
    INSERT INTO cards
    (user_id, club_id, name, logo_url, pace, shooting, passing, dribbling, defense, physical)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *;
  `;

  const values = [
    user_id,
    club_id,
    name,
    logo_url,
    pace,
    shooting,
    passing,
    dribbling,
    defense,
    physical,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

module.exports = {
  getCardsByUser,
  createCard,
};
