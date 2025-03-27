import React, { useState, useEffect } from 'react';
import { getTasks } from '../services/taskService'; // Asumiendo que tienes un servicio para obtener las tareas
import '../styles/tareas.css'; // Importamos el archivo de estilos

const Tareas = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const taskData = await getTasks();
        setTasks(taskData);
      } catch (error) {
        console.error('Error al obtener las tareas:', error);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="tareas-container">
      <h3 className="tareas-title">Tareas</h3>
      <ul className="tareas-list">
        {tasks.map((task) => (
          <li key={task.id} className="tareas-item">
            <span className="task-name">{task.nombre}</span> - <span className="task-description">{task.descripcion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tareas;