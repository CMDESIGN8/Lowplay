const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();
const missionsRoutes = require('./routes/missions');
const premiosRoutes = require('./routes/premios'); // Importa las rutas de premios
const app = express();
const port = process.env.PORT || 3000;

// Middleware para permitir solicitudes CORS
app.use(cors({ origin: 'https://lowplay-1.onrender.com' }));
app.use(bodyParser.json()); // Para poder procesar solicitudes JSON

// Usar rutas de usuario
app.use('/api', userRoutes);

// Ruta para misiones
app.use('/api/missions', missionsRoutes);

// Ruta para premios
app.use('/api', premiosRoutes); // Prefijo '/api' para consistencia

// Ruta Clubes
const clubRoutes = require('./routes/clubRoutes');
app.use('/api/clubs', clubRoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});

module.exports = app;
