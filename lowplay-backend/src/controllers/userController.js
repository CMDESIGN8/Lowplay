// Función para generar una wallet única
const generateUniqueWallet = async (baseWallet) => {
    let wallet = baseWallet;
    let count = 1;
  
    // Comprobamos si la wallet ya existe en la base de datos
    const result = await pool.query('SELECT * FROM users WHERE wallet = $1', [wallet]);
  
    // Si la wallet ya existe, añadimos un número incremental hasta encontrar una wallet libre
    while (result.rows.length > 0) {
      wallet = `${baseWallet.split('.LC')[0]}-${count}.LC`;
      count++;
    }
  
    return wallet;
  };
  
  // Función para registrar un nuevo usuario
  const register = async (req, res) => {
    const { name, email, password } = req.body;
  
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Faltan datos para registrar al usuario.' });
    }
  
    try {
      // Generar la wallet base
      const baseWallet = `${email.split('@')[0]}.LC`;
      
      // Generar una wallet única
      const wallet = await generateUniqueWallet(baseWallet);
  
      // Insertar el nuevo usuario en la base de datos
      const result = await pool.query(
        'INSERT INTO users (name, email, password, wallet, lowcoins) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, email, password, wallet, 50] // Asignamos los lowcoins directamente en la inserción
      );
  
      const newUser = result.rows[0];
  
      // Respuesta exitosa
      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: newUser,
      });
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
  };
  
  module.exports = { register };