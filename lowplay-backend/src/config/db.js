const { Pool } = require('pg');

// Usamos las variables de entorno para seguridad
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
module.exports = pool;
