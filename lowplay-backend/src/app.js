const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();
const missionsRoutes = require('./routes/missions');
const premiosRoutes = require('./routes/premios'); // Importa las rutas de premios
const cardsRoutes = require('./routes/cards.routes');

const app = express();
const port = process.env.PORT || 5000;

// Middleware para permitir solicitudes CORS
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = ['https://lowplay-1.onrender.com', 'http://localhost:5000'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Usar rutas de usuario
app.use('/api', userRoutes);

// Ruta para misiones
app.use('/api/missions', missionsRoutes);

// Ruta para premios
app.use('/api', premiosRoutes); // Prefijo '/api' para consistencia

// Ruta Clubes
const clubRoutes = require('./routes/clubRoutes');
app.use('/api/clubs', clubRoutes);

// Ruta socioes

const userClubRoutes = require('./routes/userClub.routes');
app.use('/api/user-clubs', userClubRoutes);

// Rutas cartas

app.use('/api/user-cards', cardsRoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});

module.exports = app;
