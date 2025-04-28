const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware para permitir solicitudes CORS
// Aquí defines los orígenes permitidos, puedes especificar un dominio exacto.
app.use(cors({
  origin: 'https://lowplay-1.onrender.com', // Reemplaza con la URL de tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'],  // Headers permitidos
}));
app.use(bodyParser.json()); // Para poder procesar solicitudes JSON
// Usar rutas de usuario
app.use('/api', userRoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
  
module.exports = app;
