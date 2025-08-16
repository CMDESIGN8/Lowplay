// models/Mission.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // tu conexión a la DB

const Mission = sequelize.define("Mission", {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.ENUM("diaria", "semanal", "mensual", "club"),
    allowNull: false,
  },
  recompensa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
  },
  meta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  progreso: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  fecha_fin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Mission;
