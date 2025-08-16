const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middlewares/authMiddleware');
const multer = require('multer');
// GET - Misiones activas
router.get("/", async (req, res) => {
  const missions = await Mission.findAll({ where: { activo: true }});
  res.json(missions);
});

// POST - Registrar progreso en misión
router.post("/:id/progreso", async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  let userMission = await UserMission.findOne({ where: { userId, missionId: id }});
  if (!userMission) {
    userMission = await UserMission.create({ userId, missionId: id, progreso: 0 });
  }

  userMission.progreso += 1;
  if (userMission.progreso >= userMission.meta) {
    userMission.progreso = userMission.meta;
  }
  await userMission.save();

  res.json(userMission);
});

// POST - Completar misión
router.post("/:id/completar", async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  const mission = await Mission.findByPk(id);
  const userMission = await UserMission.findOne({ where: { userId, missionId: id }});

  if (!userMission || userMission.completada) {
    return res.status(400).json({ error: "Misión ya completada o inexistente" });
  }

  if (userMission.progreso < mission.meta) {
    return res.status(400).json({ error: "No alcanzaste la meta aún" });
  }

  userMission.completada = true;
  userMission.fecha_completada = new Date();
  await userMission.save();

  // Sumar XP y monedas
  let userXP = await UserXP.findOne({ where: { userId }});
  if (!userXP) {
    userXP = await UserXP.create({ userId, xp_total: 0, nivel: 1 });
  }
  userXP.xp_total += mission.recompensa_xp;
  userXP.nivel = Math.floor(userXP.xp_total / 100) + 1;
  await userXP.save();

  res.json({ message: "Misión completada", xp: userXP.xp_total, nivel: userXP.nivel });
});

module.exports = router;