const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Extraer el token eliminando el prefijo "Bearer "
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Token no proporcionado' });
    }

    jwt.verify(token, 'lowcargo2024', (err, decoded) => {
        if (err) {
            console.error('Error al verificar el token:', err); // Mostrar el error exacto
            return res.status(401).json({ message: 'Token no válido' });
        }

        console.log('Token decodificado:', decoded); // Mostrar el contenido decodificado del token
        req.userId = decoded.userId;
        next();
    });
};

module.exports = verifyToken;