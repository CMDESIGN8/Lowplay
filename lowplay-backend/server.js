const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const verifyToken = require('./middlewares/verifyToken'); // Importar el middleware
const pool = require('./models/db'); // Asegúrate de que pool esté configurado correctamente
const cors = require('cors');

dotenv.config();

const app = express();
app.use(express.json()); // Para poder leer los cuerpos de las solicitudes en formato JSON

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:3000', // URL del frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  credentials: true, // Si necesitas enviar cookies
}));

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Ruta para obtener los datos del perfil
app.get('/profile', verifyToken, async (req, res) => {
  try {
    // Consultar los datos básicos del usuario
    const userResult = await pool.query(
      'SELECT id, nombre, email, foto_perfil, fecha_creacion, billetera FROM usuarios WHERE id = $1',
      [req.userId]
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Consultar el saldo de LOWCOINS
    const lowcoinsResult = await pool.query(
      'SELECT saldo FROM lowcoins WHERE usuario_id = $1',
      [req.userId]
    );

    // Si no se encuentra el saldo, se asume que es 0
    const saldo = lowcoinsResult.rows[0]?.saldo || 0;

    // Combinar los datos del usuario con el saldo
    const userProfile = {
      ...user,
      saldo: saldo,
    };

    // Enviar los datos combinados como respuesta
    res.json(userProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los datos del usuario.' });
  }
});

app.get('/misiones', verifyToken, async (req, res) => {
  try {
    // Obtener las misiones diarias y las misiones únicas que el usuario no ha completado
    const dailyMissions = await pool.query(
      `SELECT m.id, m.nombre, m.descripcion, m.recompensa, m.tipo
       FROM misiones m
       LEFT JOIN misiones_completadas mc ON m.id = mc.mision_id AND mc.usuario_id = $1
       WHERE (m.tipo = 'diaria' AND (mc.fecha_completada IS NULL OR mc.fecha_completada < NOW() - INTERVAL '1 day'))
          OR m.tipo = 'unica' AND mc.usuario_id IS NULL`,
      [req.userId]
    );

    res.json(dailyMissions.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las misiones.' });
  }
});

app.post('/misiones/completar', verifyToken, async (req, res) => {
  const { misionId } = req.body;

  try {
    // Verificar si la misión existe
    const missionResult = await pool.query(
      'SELECT * FROM misiones WHERE id = $1',
      [misionId]
    );

    const mission = missionResult.rows[0];
    if (!mission) {
      return res.status(404).json({ message: 'Misión no encontrada.' });
    }

    // Verificar si el usuario ya completó la misión diaria
    const missionCompletionResult = await pool.query(
      'SELECT fecha_completada FROM misiones_completadas WHERE usuario_id = $1 AND mision_id = $2 ORDER BY fecha_completada DESC LIMIT 1',
      [req.userId, misionId]
    );

    if (mission.tipo === 'diaria' && missionCompletionResult.rows.length > 0) {
      const lastCompleted = new Date(missionCompletionResult.rows[0].fecha_completada);
      const now = new Date();
      const timeDiff = now.getTime() - lastCompleted.getTime();

      // Verificar si fue completada en las últimas 24 horas
      if (timeDiff < 24 * 60 * 60 * 1000) {
        return res.status(400).json({ message: 'Ya completaste esta misión hoy.' });
      }
    }

    // Completar la misión y asignar los LOWCOINS
    const lowcoinsResult = await pool.query(
      'SELECT saldo FROM lowcoins WHERE usuario_id = $1',
      [req.userId]
    );

    const currentBalance = lowcoinsResult.rows[0]?.saldo || 0;
    const newBalance = currentBalance + mission.recompensa;

    // Actualizar el saldo de LOWCOINS
    await pool.query(
      'UPDATE lowcoins SET saldo = $1 WHERE usuario_id = $2',
      [newBalance, req.userId]
    );

    // Registrar que el usuario completó la misión
    await pool.query(
      'INSERT INTO misiones_completadas (usuario_id, mision_id, fecha_completada) VALUES ($1, $2, NOW())',
      [req.userId, misionId]
    );

    res.json({ message: `Misión completada con éxito. Has ganado ${mission.recompensa} LOWCOINS.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al completar la misión.' });
  }
});

// Ruta para obtener todos los movimientos de la billetera (recompensas + canjes)
app.get('/wallet/movimientos', verifyToken, async (req, res) => {
  try {
    // Obtener los movimientos de recompensas
    const movementsResult = await pool.query(
      `SELECT 
        m.id, 
        m.mision_id, 
        m.fecha_completada, 
        mi.nombre, 
        mi.recompensa,
        'recompensa' AS tipo_movimiento
      FROM misiones_completadas m
      JOIN misiones mi ON m.mision_id = mi.id
      WHERE m.usuario_id = $1
      ORDER BY m.fecha_completada DESC`,
      [req.userId]
    );

    // Obtener los canjes realizados por el usuario
    const canjesResult = await pool.query(
      `SELECT 
        c.id, 
        c.fecha_canje, 
        p.nombre AS premio_nombre, 
        p.costo_lowcoins, 
        'canje' AS tipo_movimiento
      FROM canjes c
      JOIN premios p ON c.premio_id = p.id
      WHERE c.usuario_id = $1
      ORDER BY c.fecha_canje DESC`,
      [req.userId]
    );

    // Combinar los resultados de movimientos y canjes
    const allMovements = [
      ...movementsResult.rows.map(movement => ({
        ...movement,
        fecha_completada: movement.fecha_completada || movement.fecha_canje,
      })),
      ...canjesResult.rows.map(canje => ({
        ...canje,
        fecha_completada: canje.fecha_canje,
      })),
    ];

    // Ordenar todos los movimientos por fecha
    allMovements.sort((a, b) => new Date(b.fecha_completada) - new Date(a.fecha_completada));

    // Enviar todos los movimientos combinados
    res.json(allMovements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los movimientos.' });
  }
});

// Endpoint para obtener premios disponibles
app.get('/api/premios', async (req, res) => {
  try {
    const query = `
      SELECT id, nombre, descripcion, costo_lowcoins, stock_disponible, imagen_url 
      FROM premios 
      WHERE stock_disponible > 0
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener premios:', error);
    res.status(500).json({ error: 'Error al obtener premios' });
  }
});

// Endpoint para canjear un premio
app.post('/api/premios/canjear', verifyToken, async (req, res) => {
  const { rewardId } = req.body;
  const usuarioId = req.userId; // Obtén el usuario del token

  try {
    // Verificar si el premio existe y obtener su costo
    const premioQuery = 'SELECT id, nombre, costo_lowcoins, stock_disponible FROM premios WHERE id = $1';
    const premioResult = await pool.query(premioQuery, [rewardId]);

    if (premioResult.rows.length === 0) {
      return res.status(404).json({ message: 'Premio no encontrado' });
    }

    const premio = premioResult.rows[0];

    // Verificar si el usuario tiene suficientes LOWCOINS
    const saldoQuery = 'SELECT saldo FROM lowcoins WHERE usuario_id = $1';
    const saldoResult = await pool.query(saldoQuery, [usuarioId]);

    if (saldoResult.rows.length === 0 || saldoResult.rows[0].saldo < premio.costo_lowcoins) {
      return res.status(400).json({ message: 'No tienes suficientes LOWCOINS para canjear este premio' });
    }

    // Verificar si hay stock disponible
    if (premio.stock_disponible <= 0) {
      return res.status(400).json({ message: 'El premio ya no está disponible' });
    }

    // Registrar el canje del premio
    const canjeQuery = 'INSERT INTO canjes (usuario_id, premio_id) VALUES ($1, $2) RETURNING id';
    const canjeResult = await pool.query(canjeQuery, [usuarioId, rewardId]);

    // Actualizar el stock del premio
    const updateStockQuery = 'UPDATE premios SET stock_disponible = stock_disponible - 1 WHERE id = $1';
    await pool.query(updateStockQuery, [rewardId]);

    // Descontar los LOWCOINS del usuario
    const newSaldo = saldoResult.rows[0].saldo - premio.costo_lowcoins;
    const updateSaldoQuery = 'UPDATE lowcoins SET saldo = $1 WHERE usuario_id = $2';
    await pool.query(updateSaldoQuery, [newSaldo, usuarioId]);

    res.json({ message: 'Premio canjeado exitosamente', canjeId: canjeResult.rows[0].id });
  } catch (error) {
    console.error('Error al canjear premio:', error);
    res.status(500).json({ error: 'Error al canjear premio' });
  }
});


// Ruta para crear una tarea
app.post('/api/tasks', verifyToken, async (req, res) => {
  const { title, description, due_date } = req.body;

  try {
    const query = `
      INSERT INTO tasks (user_id, title, description, due_date)
      VALUES ($1, $2, $3, $4)
      RETURNING id, title, description, due_date, completed, created_at
    `;
    const result = await pool.query(query, [req.userId, title, description, due_date]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear tarea:', error);
    res.status(500).json({ error: 'Error al crear tarea' });
  }
});

// Ruta para obtener todas las tareas de un usuario
app.get('/api/tasks', verifyToken, async (req, res) => {
  try {
    const query = 'SELECT * FROM tasks WHERE user_id = $1 ORDER BY due_date';
    const result = await pool.query(query, [req.userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
});

// Ruta para marcar una tarea como completada
app.put('/api/tasks/:id/completar', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'UPDATE tasks SET completed = TRUE WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await pool.query(query, [id, req.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada o no pertenece al usuario' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al completar tarea:', error);
    res.status(500).json({ error: 'Error al completar tarea' });
  }
});

// Ruta para crear un recordatorio
app.post('/api/reminders', verifyToken, async (req, res) => {
  const { taskId, reminder_time, message } = req.body;

  try {
    const query = `
      INSERT INTO reminders (task_id, reminder_time, message)
      VALUES ($1, $2, $3)
      RETURNING id, task_id, reminder_time, message, notified
    `;
    const result = await pool.query(query, [taskId, reminder_time, message]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear recordatorio:', error);
    res.status(500).json({ error: 'Error al crear recordatorio' });
  }
});

// Ruta para obtener los recordatorios de un usuario
app.get('/api/reminders', verifyToken, async (req, res) => {
  try {
    const query = 'SELECT * FROM reminders WHERE task_id IN (SELECT id FROM tasks WHERE user_id = $1)';
    const result = await pool.query(query, [req.userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener recordatorios:', error);
    res.status(500).json({ error: 'Error al obtener recordatorios' });
  }
});

// Ruta para crear un evento
app.post('/api/events', verifyToken, async (req, res) => {
  const { title, description, start_time, end_time } = req.body;

  try {
    const query = `
      INSERT INTO events (user_id, title, description, start_time, end_time)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, title, description, start_time, end_time, created_at
    `;
    const result = await pool.query(query, [req.userId, title, description, start_time, end_time]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({ error: 'Error al crear evento' });
  }
});

// Ruta para obtener los eventos de un usuario
app.get('/api/events', verifyToken, async (req, res) => {
  try {
    const query = 'SELECT * FROM events WHERE user_id = $1 ORDER BY start_time';
    const result = await pool.query(query, [req.userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

// Iniciar el servidor
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});