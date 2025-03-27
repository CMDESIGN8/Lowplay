import React, { useState } from 'react';
import Calendar from 'react-calendar'; // Usamos una librería para el calendario
import '../styles/calendario.css'; // Importamos el archivo de estilos

const Calendario = () => {
  const [date, setDate] = useState(new Date());

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  return (
    <div className="calendario-container">
      <h3 className="calendario-title">Calendario</h3>
      <div className="calendar-wrapper">
        <Calendar onChange={handleDateChange} value={date} />
      </div>
    </div>
  );
};

export default Calendario;