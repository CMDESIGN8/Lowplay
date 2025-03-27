import React, { useState } from 'react';
import '../styles/AvatarSelection.css'; // Importamos el archivo de estilos

const AvatarSelection = ({ onAvatarSelect }) => {
  const avatars = [
    '1.jpeg',
    '2.jpeg',
    '3.jpeg',
    '4.jpeg',
    '5.jpeg',
    '6.jpeg',
    '7.jpeg',
  ];

  const [showSelector, setShowSelector] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null); // Estado para el avatar seleccionado

  const handleAvatarClick = (avatar) => {
    setSelectedAvatar(avatar);
    onAvatarSelect(avatar); // Pasamos el avatar seleccionado al Dashboard
    setShowSelector(false); // Cierra la lista de avatares
  };

  return (
    <div>
      <button
        className="choose-avatar-button"
        onClick={() => setShowSelector(!showSelector)}
      >
        Seleccionar Avatar
      </button>

      {showSelector && (
        <div className="avatar-selector">
          {avatars.map((avatar, index) => (
            <img
              key={index}
              src={require(`../assets/avatars/${avatar}`)} // Usamos require para cargar las imágenes
              alt={`Avatar ${index + 1}`}
              className="avatar-option"
              onClick={() => handleAvatarClick(avatar)} // Al hacer clic, seleccionamos el avatar
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AvatarSelection;