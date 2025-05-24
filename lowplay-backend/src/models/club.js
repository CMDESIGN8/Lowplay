const pool = require('../config/db');

const registerClub = async (name, email, password) => {
  const query = `
    INSERT INTO clubs (name, email, password, created_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING id, name, email, created_at;
  `;
  const values = [name, email, password];
  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = {
  registerClub,
};
