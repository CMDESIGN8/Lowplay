const express = require('express');
const cors = require('cors');
const pool = require('./config/db'); // Importamos la conexión a la base de datos
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Ruta básica para test
app.get('/', (req, res) => {
  res.send('LowPlay backend funcionando!');
});

// Ruta de prueba para consultar la base de datos
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]); // Retorna la fecha y hora actual de la base de datos
  } catch (error) {
    console.error('Error de conexión a la base de datos:', error);
    res.status(500).send('Error al conectar a la base de datos');
  }
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
