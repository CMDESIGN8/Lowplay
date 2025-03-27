const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../models/db');

const saltRounds = 10;

const registerUser = async (req, res) => {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ message: 'Por favor, complete todos los campos.' });
    }

    try {
        // Encriptar la contraseña con bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Guardar el usuario en la base de datos (en la tabla usuarios)
        const result = await pool.query(
            'INSERT INTO usuarios (nombre, email, password, fecha_creacion) VALUES ($1, $2, $3, NOW()) RETURNING id, nombre, email',
            [nombre, email, hashedPassword]
        );

        const newUser = result.rows[0];

        // Generar el número de billetera basado en el ID del usuario
        const walletNumber = `${newUser.id}.LC`;

        // Actualizar el usuario con el número de billetera
        await pool.query(
            'UPDATE usuarios SET billetera = $1 WHERE id = $2',
            [walletNumber, newUser.id]
        );

        // Asignar los 50 LOWCOINS al usuario en la tabla de saldos
        await pool.query(
            'INSERT INTO lowcoins (usuario_id, saldo, fecha_asignacion) VALUES ($1, $2, NOW())',
            [newUser.id, 50]
        );

        // Asignar la misión "Registrarse en la app" con el ID correspondiente (suponiendo que la misión tiene ID 1)
        const missionId = 1; // ID de la misión "Registrarse en la app"

        // Bloquear la misión "Registro completado" en la tabla de misiones del usuario
        await pool.query(
            'INSERT INTO misiones_completadas (usuario_id, mision_id, fecha_completada) VALUES ($1, $2, NOW())',
            [newUser.id, missionId]
        );

        // Generar un token JWT
        const token = jwt.sign(
            { userId: newUser.id },
            'lowcargo2024',
            { expiresIn: '1h' }
        );

        res.status(201).json({
            message: 'Usuario registrado',
            token,
            user: {
                id: newUser.id,
                nombre: newUser.nombre,
                email: newUser.email,
                billetera: walletNumber,
                saldoLowcoins: 50,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar usuario.' });
    }
};


const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    // Buscar al usuario en la base de datos
    const user = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }
  
    // Comparar la contraseña
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }
  
    // Generar un token JWT
    const token = jwt.sign({ userId: user.rows[0].id }, 'lowcargo2024', { expiresIn: '1h' });
    console.log('Generando token para el usuario con ID:', user.rows[0].id);

  
    res.status(200).json({ message: 'Inicio de sesión exitoso', token });
  };

module.exports = { registerUser, loginUser };