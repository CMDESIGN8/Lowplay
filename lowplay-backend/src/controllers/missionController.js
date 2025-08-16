const Mission = require("../models/missions"); // <-- usa el modelo con pg

// GET todas las misiones
exports.getMissions = async (req, res) => {
  try {
    const missions = await Mission.getMissions(); // <-- llama a la función del modelo
    res.json(missions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener misiones" });
  }
};

// POST nueva misión
exports.createMission = async (req, res) => {
  try {
    const mission = await Mission.createMission(req.body); // <-- llama a la función del modelo
    res.json(mission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear misión" });
  }
};
