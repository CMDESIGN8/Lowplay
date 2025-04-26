// server.js
const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const verifyToken = require('./middlewares/verifyToken');
const pool = require('./models/db');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator'); // Para validación
const morgan = require('morgan');
const logger = require('./utils/logger'); // Asume que tienes un logger configurado

dotenv.config();

// Imprimir configuración de la base de datos al inicio (para depuración)
logger.info('--- Database Configuration ---');
logger.info(`DB_HOST: ${process.env.DB_HOST}`);
logger.info(`DB_PORT: ${process.env.DB_PORT}`);
logger.info(`DB_USER: ${process.env.DB_USER}`);
logger.info(`DB_NAME: ${process.env.DB_NAME}`);
logger.info('----------------------------');

const app = express();

// Middleware de seguridad
app.use(helmet());

// Rate limiting para prevenir ataques de fuerza bruta
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 solicitudes por IP en cada ventana
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo en 15 minutos.',
});
app.use(limiter);

app.use(express.json());

// Configuración de CORS (ajusta la origin para producción)
app.use(cors({
    origin: ['http://localhost:3000', 'https://lowplay-1.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

// Middleware de logging (opcional)
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Función para intentar la conexión a la base de datos con reintento
async function connectDBWithRetry(maxAttempts = 5, delay = 2000) {
    let attempts = 0;
    while (attempts < maxAttempts) {
        try {
            await pool.connect();
            logger.info('Conexión exitosa a la base de datos!');
            const res = await pool.query('SELECT NOW()');
            logger.info(`Fecha y hora del servidor: ${res.rows[0].now}`);
            return true;
        } catch (err) {
            attempts++;
            logger.error(`Intento ${attempts} de conexión fallido: ${err.message}`);
            await new Promise(resolve => setTimeout(resolve, delay * attempts));
        }
    }
    logger.error('No se pudo conectar a la base de datos después de varios intentos.');
    process.exit(1); // Terminar la aplicación si no se puede conectar
}

// Conectar a la base de datos al inicio
connectDBWithRetry();

// Rutas de autenticación
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes); // ¡Esto es clave!


// Ruta para obtener los datos del perfil
app.get('/profile', verifyToken, async (req, res) => {
    try {
        const userResult = await pool.query(
            'SELECT id, nombre, email, foto_perfil, fecha_creacion, billetera FROM usuarios WHERE id = $1',
            [req.userId]
        );
        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const lowcoinsResult = await pool.query(
            'SELECT saldo FROM lowcoins WHERE usuario_id = $1',
            [req.userId]
        );

        const saldo = lowcoinsResult.rows[0]?.saldo || 0;

        res.json({ ...user, saldo });
    } catch (error) {
        logger.error('Error al obtener los datos del usuario:', error);
        res.status(500).json({ message: 'Error al obtener los datos del usuario.' });
    }
});

app.get('/misiones', verifyToken, async (req, res) => {
    try {
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
        logger.error('Error al obtener las misiones:', error);
        res.status(500).json({ message: 'Error al obtener las misiones.' });
    }
});

app.post('/misiones/completar', verifyToken, [
    body('misionId').isInt().withMessage('El ID de la misión debe ser un entero.'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { misionId } = req.body;

    try {
        const missionResult = await pool.query(
            'SELECT * FROM misiones WHERE id = $1',
            [misionId]
        );
        const mission = missionResult.rows[0];
        if (!mission) {
            return res.status(404).json({ message: 'Misión no encontrada.' });
        }

        const missionCompletionResult = await pool.query(
            'SELECT fecha_completada FROM misiones_completadas WHERE usuario_id = $1 AND mision_id = $2 ORDER BY fecha_completada DESC LIMIT 1',
            [req.userId, misionId]
        );

        if (mission.tipo === 'diaria' && missionCompletionResult.rows.length > 0) {
            const lastCompleted = new Date(missionCompletionResult.rows[0].fecha_completada);
            const now = new Date();
            if (now.toDateString() === lastCompleted.toDateString()) {
                return res.status(400).json({ message: 'Ya completaste esta misión hoy.' });
            }
        }

        const lowcoinsResult = await pool.query(
            'SELECT saldo FROM lowcoins WHERE usuario_id = $1',
            [req.userId]
        );
        const currentBalance = lowcoinsResult.rows[0]?.saldo || 0;
        const newBalance = currentBalance + mission.recompensa;

        await pool.query(
            'UPDATE lowcoins SET saldo = $1 WHERE usuario_id = $2',
            [newBalance, req.userId]
        );

        await pool.query(
            'INSERT INTO misiones_completadas (usuario_id, mision_id, fecha_completada) VALUES ($1, $2, NOW())',
            [req.userId, misionId]
        );

        res.json({ message: `Misión completada con éxito. Has ganado ${mission.recompensa} LOWCOINS.` });
    } catch (error) {
        logger.error('Error al completar la misión:', error);
        res.status(500).json({ message: 'Error al completar la misión.' });
    }
});

// Ruta para obtener todos los movimientos de la billetera (recompensas + canjes)
app.get('/wallet/movimientos', verifyToken, async (req, res) => {
    try {
        const movementsResult = await pool.query(
            `SELECT
                mc.fecha_completada AS fecha,
                m.nombre AS descripcion,
                m.recompensa AS cantidad,
                'recompensa' AS tipo
            FROM misiones_completadas mc
            JOIN misiones m ON mc.mision_id = m.id
            WHERE mc.usuario_id = $1
            UNION ALL
            SELECT
                c.fecha_canje AS fecha,
                p.nombre AS descripcion,
                -p.costo_lowcoins AS cantidad,
                'canje' AS tipo
            FROM canjes c
            JOIN premios p ON c.premio_id = p.id
            WHERE c.usuario_id = $1
            ORDER BY fecha DESC`,
            [req.userId]
        );
        res.json(movementsResult.rows);
    } catch (error) {
        logger.error('Error al obtener los movimientos:', error);
        res.status(500).json({ message: 'Error al obtener los movimientos.' });
    }
});

// Endpoint para obtener premios disponibles
app.get('/premios', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, nombre, descripcion, costo_lowcoins, stock_disponible, imagen_url FROM premios WHERE stock_disponible > 0'
        );
        res.json(result.rows);
    } catch (error) {
        logger.error('Error al obtener premios:', error);
        res.status(500).json({ error: 'Error al obtener premios' });
    }
});

// Endpoint para canjear un premio
app.post('/premios/canjear', verifyToken, [
    body('rewardId').isInt().withMessage('El ID del premio debe ser un entero.'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rewardId } = req.body;
    const usuarioId = req.userId;

    try {
        const premioResult = await pool.query(
            'SELECT id, nombre, costo_lowcoins, stock_disponible FROM premios WHERE id = $1',
            [rewardId]
        );
        const premio = premioResult.rows[0];
        if (!premio) {
            return res.status(404).json({ message: 'Premio no encontrado' });
        }

        const saldoResult = await pool.query(
            'SELECT saldo FROM lowcoins WHERE usuario_id = $1',
            [usuarioId]
        );
        if (!saldoResult.rows[0] || saldoResult.rows[0].saldo < premio.costo_lowcoins) {
            return res.status(400).json({ message: 'No tienes suficientes LOWCOINS para canjear este premio' });
        }

        if (premio.stock_disponible <= 0) {
            return res.status(400).json({ message: 'El premio ya no está disponible' });
        }

        await pool.query('BEGIN'); // Iniciar transacción

        try {
            const canjeResult = await pool.query(
                'INSERT INTO canjes (usuario_id, premio_id) VALUES ($1, $2) RETURNING id',
                [usuarioId, rewardId]
            );

            await pool.query(
                'UPDATE premios SET stock_disponible = stock_disponible - 1 WHERE id = $1',
                [rewardId]
            );

            const newSaldo = saldoResult.rows[0].saldo - premio.costo_lowcoins;
            await pool.query(
                'UPDATE lowcoins SET saldo = $1 WHERE usuario_id = $2',
                [newSaldo, usuarioId]
            );

            await pool.query('COMMIT'); // Confirmar transacción

            res.json({ message: 'Premio canjeado exitosamente', canjeId: canjeResult.rows[0].id });
        } catch (transactionError) {
            await pool.query('ROLLBACK'); // Revertir transacción en caso de error
            logger.error('Error durante la transacción de canje:', transactionError);
            res.status(500).json({ error: 'Error al canjear premio' });
        }
    } catch (error) {
        logger.error('Error al canjear premio:', error);
        res.status(500).json({ error: 'Error al canjear premio' });
    }
});

// Rutas para tareas
app.post('/tasks', verifyToken, [
    body('title').notEmpty().trim().escape().withMessage('El título es requerido.'),
    body('description').optional().trim().escape(),
    body('due_date').optional().isISO8601().withMessage('La fecha debe ser válida (ISO 8601).'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, due_date } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO tasks (user_id, title, description, due_date) VALUES ($1, $2, $3, $4) RETURNING id, title, description, due_date, completed, created_at',
            [req.userId, title, description, due_date]
        );
        res.json(result.rows[0]);
    } catch (error) {
        logger.error('Error al crear tarea:', error);
        res.status(500).json({ error: 'Error al crear tarea' });
    }
});

app.get('/tasks', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM tasks WHERE user_id = $1 ORDER BY due_date',
            [req.userId]
        );
        res.json(result.rows);
    } catch (error) {
        logger.error('Error al obtener tareas:', error);
        res.status(500).json({ error: 'Error al obtener tareas' });
    }
});

app.put('/tasks/:id/completar', verifyToken, [
    body('id').isInt().withMessage('El ID de la tarea debe ser un entero.'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    try {
        const result = await pool.query(
            'UPDATE tasks SET completed = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tarea no encontrada o no pertenece al usuario' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        logger.error('Error al completar tarea:', error);
        res.status(500).json({ error: 'Error al completar tarea' });
    }
});

// Rutas para recordatorios
app.post('/reminders', verifyToken, [
    body('taskId').isInt().withMessage('El ID de la tarea debe ser un entero.'),
    body('reminder_time').isISO8601().withMessage('La hora del recordatorio debe ser válida (ISO 8601).'),
    body('message').optional().trim().escape(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { taskId, reminder_time, message } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO reminders (task_id, reminder_time, message) VALUES ($1, $2, $3) RETURNING id, task_id, reminder_time, message, notified',
            [taskId, reminder_time, message]
        );
        res.json(result.rows[0]);
    } catch (error) {
        logger.error('Error al crear recordatorio:', error);
        res.status(500).json({ error: 'Error al crear recordatorio' });
    }
});

app.get('/reminders', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM reminders WHERE task_id IN (SELECT id FROM tasks WHERE user_id = $1)',
            [req.userId]
        );
        res.json(result.rows);
    } catch (error) {
        logger.error('Error al obtener recordatorios:', error);
        res.status(500).json({ error: 'Error al obtener recordatorios' });
    }
});

// ... (código anterior)

// Rutas para eventos (continuación)
app.post('/events', verifyToken, [
  body('title').notEmpty().trim().escape().withMessage('El título es requerido.'),
  body('description').optional().trim().escape(),
  body('start_time').isISO8601().withMessage('La hora de inicio debe ser válida (ISO 8601).'),
  body('end_time').isISO8601().withMessage('La hora de fin debe ser válida (ISO 8601).'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, start_time, end_time } = req.body;
  try {
      const result = await pool.query(
          'INSERT INTO events (user_id, title, description, start_time, end_time) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, description, start_time, end_time, created_at',
          [req.userId, title, description, start_time, end_time]
      );
      res.json(result.rows[0]);
  } catch (error) {
      logger.error('Error al crear evento:', error);
      res.status(500).json({ error: 'Error al crear evento' });
  }
});

app.get('/events', verifyToken, async (req, res) => {
  try {
      const result = await pool.query(
          'SELECT * FROM events WHERE user_id = $1 ORDER BY start_time',
          [req.userId]
      );
      res.json(result.rows);
  } catch (error) {
      logger.error('Error al obtener eventos:', error);
      res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

// Iniciar el servidor
const port = process.env.PORT || 5000;
app.listen(port, () => {
  logger.info(`Servidor corriendo en puerto ${port}`);
});

module.exports = app; // Exportar la aplicación para pruebas (opcional)