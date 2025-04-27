const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes'); // Importamos las rutas

const app = express();

app.use(cors());
app.use(bodyParser.json()); // Para parsear el JSON en las peticiones

app.use('/api/auth', authRoutes); // Registramos las rutas de auth

app.get('/', (req, res) => {
  res.send('Bienvenido a la API de LowPlay');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server corriendo en el puerto ${PORT}`);
});
