import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify'; // Importar react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Importar los estilos de react-toastify

const EditProfile = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función que maneja el cambio en los campos del formulario
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Marca el estado como "enviando"

    try {
      const token = localStorage.getItem('token'); // Obtener token de localStorage
      const res = await axios.put('https://lowplay.onrender.com/api/profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Muestra el mensaje exitoso usando toast
      toast.success(res.data.message); // Muestra el mensaje de éxito

      setIsSubmitting(false); // Finaliza el estado de envío
    } catch (err) {
      setIsSubmitting(false); // Finaliza el estado de envío
      console.error(err);
      toast.error('Hubo un error al actualizar el perfil'); // Muestra el mensaje de error
    }
  };

  return (
    <div>
      <h2>Editar Perfil</h2>

      {/* Contenedor de Toast */}
      <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        hideProgressBar={true} 
        newestOnTop={true} 
        closeOnClick
        rtl={false}
      />

      <form onSubmit={handleSubmit}>
        <div>
          <input 
            type="text" 
            name="name" 
            placeholder="Nombre" 
            value={formData.name} 
            onChange={handleChange} 
            required
          />
        </div>
        
        <div>
          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            value={formData.email} 
            onChange={handleChange} 
            required
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
