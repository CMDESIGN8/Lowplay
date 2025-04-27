// server.js
const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const verifyToken = require('./middlewares/verifyToken');
const pool = require('./models/db');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
const logger = require('./utils/logger');

dotenv.config();

// Imprimir configuración de la base de datos al inicio
logger.info('--- Database Configuration ---');
logger.info(`DB_HOST: ${process.env.DB_HOST}`);
logger.info(`DB_PORT: ${process.env.DB_PORT}`);
logger.info(`DB_USER: ${process.env.DB_USER}`);
logger.info(`DB_NAME: ${process.env.DB_NAME}`);
logger.info('----------------------------');

const app = express();

const corsOptions = {
    origin: 'https://lowplay-1.onrender.com', // Frontend permitido
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};
app.use(cors(corsOptions));

// Configuración de seguridad
app.set('trust proxy', false);
app.use(helmet());

// Rate limiting para evitar ataques de fuerza bruta
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 peticiones por IP
    message: 'Demasiadas solicitudes, por favor intente más tarde.',
    skipFailedRequests: true,
});
app.use(limiter);

// Configuración de middlewares
app.use(express.json());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Conexión a la base de datos con reintentos
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

// Intentar la conexión a la base de datos al inicio
connectDBWithRetry();

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes);

// Ruta para obtener perfil de usuario
app.get('/api/profile', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        const result = await pool.query(
            'SELECT id, nombre, email, billetera FROM usuarios WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({
            id: result.rows[0].id,
            nombre: result.rows[0].nombre,
            email: result.rows[0].email,
            billetera: result.rows[0].billetera,
        });
    } catch (error) {
        logger.error('Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
});

// Ruta para obtener misiones diarias y únicas
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

// Ruta para completar misión
app.post('/misiones/completar', verifyToken, [
    body('misionId').isInt().withMessage('El ID de la misión debe ser un entero.'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { misionId } = req.body;

    try {
        const missionResult = await pool.query('SELECT * FROM misiones WHERE id = $1', [misionId]);
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

// Ruta para obtener movimientos de la billetera
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

// Ruta para obtener premios disponibles
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

// Ruta para canjear premio
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
            return res.status(404).json({ message: 'Premio no encontrado.' });
        }

        if (premio.stock_disponible <= 0) {
            return res.status(400).json({ message: 'No hay stock disponible para este premio.' });
        }

        const saldoResult = await pool.query(
            'SELECT saldo FROM lowcoins WHERE usuario_id = $1',
            [usuarioId]
        );
        const saldoActual = saldoResult.rows[0]?.saldo || 0;

        if (saldoActual < premio.costo_lowcoins) {
            return res.status(400).json({ message: 'No tienes suficientes LOWCOINS para canjear este premio.' });
        }

        // Actualizar saldo
        const nuevoSaldo = saldoActual - premio.costo_lowcoins;
        await pool.query(
            'UPDATE lowcoins SET saldo = $1 WHERE usuario_id = $2',
            [nuevoSaldo, usuarioId]
        );

        // Reducir stock del premio
        await pool.query(
            'UPDATE premios SET stock_disponible = stock_disponible - 1 WHERE id = $1',
            [rewardId]
        );

        // Registrar el canje
        await pool.query(
            'INSERT INTO canjes (usuario_id, premio_id, fecha_canje) VALUES ($1, $2, NOW())',
            [usuarioId, rewardId]
        );

        res.json({ message: `Premio canjeado con éxito: ${premio.nombre}.` });
    } catch (error) {
        logger.error('Error al canjear premio:', error);
        res.status(500).json({ message: 'Error al canjear premio.' });
    }
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ message: 'Algo salió mal. Intenta de nuevo más tarde.' });
});

app.listen(process.env.PORT || 3000, () => {
    logger.info(`Servidor escuchando en puerto ${process.env.PORT || 3000}`);
});
