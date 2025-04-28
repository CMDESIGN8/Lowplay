const pool = require('../config/db');

const registerUser = async (name, email, password, wallet) => {
  const query = `
    INSERT INTO users (name, email, password, wallet, lowcoins)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const values = [name, email, password, wallet, 50]; // 50 lowcoins al registrarse

  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = { registerUser };
