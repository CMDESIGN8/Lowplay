// controllers/missionController.js
const Mission = require("../models/Mission");

exports.getMissions = async (req, res) => {
  try {
    const missions = await Mission.findAll();
    res.json(missions);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener misiones" });
  }
};

exports.createMission = async (req, res) => {
  try {
    const mission = await Mission.create(req.body);
    res.json(mission);
  } catch (error) {
    res.status(500).json({ error: "Error al crear misión" });
  }
};
