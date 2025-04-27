const pool = require('../config/db');

// Función para registrar un nuevo usuario en la base de datos
const registerUser = async (name, email, password, wallet) => {
  const query = `
    INSERT INTO users (name, email, password, wallet)
    VALUES ($1, $2, $3, $4) 
    RETURNING id, name, email, wallet, lowcoins
  `;
  const values = [name, email, password, wallet];
  try {
    const result = await pool.query(query, values);
    return result.rows[0]; // Regresa el usuario recién creado
  } catch (err) {
    throw new Error('Error al registrar el usuario: ' + err.message);
  }
};

module.exports = { registerUser };
