// models/missions.js
const pool = require('../config/db');

// Crear misión
const createMission = async (mission) => {
  const { nombre, descripcion, tipo, recompensa_xp, recompensa_coins, fecha_inicio, fecha_fin, categoria, activo } = mission;
  const query = `
    INSERT INTO missions 
      (nombre, descripcion, tipo, recompensa_xp, recompensa_coins, fecha_inicio, fecha_fin, categoria, activo)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *;
  `;
  const values = [nombre, descripcion, tipo, recompensa_xp, recompensa_coins, fecha_inicio, fecha_fin, categoria, activo];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Obtener todas las misiones
const getMissions = async () => {
  const { rows } = await pool.query('SELECT * FROM missions ORDER BY id ASC;');
  return rows;
};

// Obtener misión por id
const getMissionById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM missions WHERE id=$1;', [id]);
  return rows[0];
};

// Actualizar misión
const updateMission = async (id, mission) => {
  const { nombre, descripcion, tipo, recompensa_xp, recompensa_coins, fecha_inicio, fecha_fin, categoria, activo } = mission;
  const query = `
    UPDATE missions
    SET nombre=$1, descripcion=$2, tipo=$3, recompensa_xp=$4, recompensa_coins=$5, fecha_inicio=$6, fecha_fin=$7, categoria=$8, activo=$9
    WHERE id=$10
    RETURNING *;
  `;
  const values = [nombre, descripcion, tipo, recompensa_xp, recompensa_coins, fecha_inicio, fecha_fin, categoria, activo, id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Eliminar misión
const deleteMission = async (id) => {
  const { rows } = await pool.query('DELETE FROM missions WHERE id=$1 RETURNING *;', [id]);
  return rows[0];
};

module.exports = {
  createMission,
  getMissions,
  getMissionById,
  updateMission,
  deleteMission
};
