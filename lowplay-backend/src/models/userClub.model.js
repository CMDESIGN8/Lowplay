const pool = require('../config/db');

const associateUserToClub = async (socio_id, club_id) => {
  const query = `
    INSERT INTO socios_clubes (socio_id, club_id)
    VALUES ($1, $2)
    ON CONFLICT (socio_id, club_id) DO NOTHING
    RETURNING *;
  `;
  const result = await pool.query(query, [socio_id, club_id]);
  return result.rows[0];
};

const getUserClubs = async (socio_id) => {
  const query = `
    SELECT c.*
    FROM clubs c
    JOIN socios_clubes sc ON c.id = sc.club_id
    WHERE sc.socio_id = $1;
  `;
  const result = await pool.query(query, [socio_id]);
  return result.rows;
};

module.exports = {
  associateUserToClub,
  getUserClubs,
};
