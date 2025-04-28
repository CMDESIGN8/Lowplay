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

// Ruta de perfil de usuario
app.get('/api/profile', (req, res) => {
  // Aquí deberías manejar la autenticación con el token y devolver los datos del perfil
  const token = req.headers['authorization']?.split(' ')[1];  // Obtener token
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  // Suponiendo que validas el token y encuentras al usuario
  const user = {
    name: 'Juan Pérez',
    email: 'juanperez@example.com',
    wallet: '1000',
    lowcoins: '500',
    profile_completed: true
  };

  res.json(user);
});

// Usar rutas de usuario
app.use('/api', userRoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});

module.exports = app;
