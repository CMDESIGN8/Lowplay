// routes/missions.js
const express = require("express");
const router = express.Router();
const missionController = require("../controllers/missionController");

// GET todas las misiones
router.get("/", missionController.getMissions);

// POST nueva misión
router.post("/", missionController.createMission);

module.exports = router;
