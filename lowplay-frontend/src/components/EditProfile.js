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

      if (response.data && response.data.message) {
        alert(response.data.message);  // Muestra el mensaje que viene del backend
      } else {
        alert('Perfil actualizado con éxito');
      }

      // Opcional: recargar el usuario o redirigir si querés
      // window.location.reload(); 

    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Error al actualizar el perfil');
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
