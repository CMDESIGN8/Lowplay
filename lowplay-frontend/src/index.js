import React from 'react';
import ReactDOM from 'react-dom/client';  // Cambiar a 'react-dom/client'
import App from './App';

// Crear el root con createRoot
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderizar la aplicación
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);