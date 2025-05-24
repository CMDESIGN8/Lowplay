const { associateUserToClub, getUserClubs } = require('../models/userClub.model');

const associateClub = async (req, res) => {
  const socio_id = req.user.id;
  const { club_id } = req.body;

  if (!club_id) {
    return res.status(400).json({ message: 'Falta el club_id' });
  }

  try {
    const association = await associateUserToClub(socio_id, club_id);

    if (!association) {
      return res.status(200).json({ message: 'Ya estabas asociado a este club.' });
    }

    res.status(201).json({ message: 'Asociación exitosa con el club', association });
  } catch (error) {
    console.error('Error al asociar usuario con club:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getMyClubs = async (req, res) => {
  const socio_id = req.user.id;

  try {
    const clubs = await getUserClubs(socio_id);
    res.status(200).json({ clubs });
  } catch (error) {
    console.error('Error al obtener clubes del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  associateClub,
  getMyClubs,
};
