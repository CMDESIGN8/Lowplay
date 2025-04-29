import axios from 'axios';
import { useState } from 'react';

const EditProfile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSave = async () => {
    try {
      const response = await axios.put('/api/usuarios/edit-profile', {
        name,
        email
      });
  
      console.log('Respuesta completa del servidor:', response.data); // 👈
  
      if (response.data && response.data.message) {
        alert(response.data.message);
      } else {
        alert('Perfil actualizado con éxito (sin mensaje personalizado)');
      }
  
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert('Error: ' + error.response.data.message);
      } else {
        alert('Error desconocido al actualizar perfil');
      }
    }
  };
  

  return (
    <div className="edit-profile">
      <h2>Editar Perfil</h2>
      <input
        type="text"
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleSave}>Guardar cambios</button>
    </div>
  );
};

export default EditProfile;
