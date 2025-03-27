import React, { useState, useEffect } from 'react';
import { getEvents } from '../services/eventService'; // Asumiendo que tienes un servicio para obtener los eventos
import '../styles/eventos.css'; // Importamos el archivo de estilos

const Eventos = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventData = await getEvents();
        setEvents(eventData);
      } catch (error) {
        console.error('Error al obtener los eventos:', error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="eventos-container">
      <h3 className="eventos-title">Eventos</h3>
      <ul className="eventos-list">
        {events.map((event) => (
          <li key={event.id} className="eventos-item">
            <span className="event-name">{event.nombre}</span> - <span className="event-date">{event.fecha}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Eventos;