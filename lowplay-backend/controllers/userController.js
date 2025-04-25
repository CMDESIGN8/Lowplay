    const pool = require('../models/db');

    const getUserData = async (req, res) => {
        const userId = req.userId; // Extraer el ID del usuario desde el token JWT

        try {
            // Consultar los datos del usuario
            const userResult = await pool.query(
                'SELECT nombre, email, billetera FROM usuarios WHERE id = $1',
                [userId]
            );

            // Verificar si el usuario existe
            if (userResult.rows.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            const user = userResult.rows[0];

            // Consultar el saldo del usuario
            const lowcoinsResult = await pool.query(
                'SELECT saldo FROM lowcoins WHERE usuario_id = $1',
                [userId]
            );

            const saldo = lowcoinsResult.rows[0]?.saldo || 0;

            res.status(200).json({
                nombre: user.nombre,
                email: user.email,
                billetera: user.billetera,
                saldo: saldo,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener datos del usuario.' });
        }
    };

    module.exports = { getUserData };