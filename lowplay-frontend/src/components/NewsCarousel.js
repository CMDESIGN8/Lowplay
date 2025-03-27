import React, { useState, useEffect } from 'react';
import '../styles/NewsCarousel.css'; // Asegúrate de tener el archivo CSS correspondiente

const NewsCarousel = () => {
    const [news, setNews] = useState([]); // Estado para almacenar las noticias
    const [currentIndex, setCurrentIndex] = useState(0);
  
    // Cargar las noticias desde el archivo JSON local
    useEffect(() => {
      const fetchNews = async () => {
        try {
          const response = await fetch('/assets/news.json'); // Ruta al archivo JSON
          const data = await response.json();
          setNews(data); // Guardar las noticias en el estado
        } catch (error) {
          console.error('Error al cargar las noticias:', error);
        }
      };
  
      fetchNews();
    }, []); // Este useEffect solo se ejecutará una vez al cargar el componente
  
    // Cambiar automáticamente la noticia cada 10 segundos
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % news.length);
      }, 5000); // 5 segundos
  
      return () => clearInterval(interval); // Limpiar intervalo al desmontar
    }, [news.length]);
  
    // Si no hay noticias, muestra un mensaje de carga
    if (news.length === 0) {
      return <p>Cargando noticias...</p>;
    }
  
    const currentNews = news[currentIndex];
  
    return (
      <div className="news-carousel">
        <div className="news-card">
          <img src={currentNews.image} alt={currentNews.title} className="news-image" />
          <div className="news-content">
            <h3 className="news-heading">{currentNews.title}</h3>
            <p className="news-description">{currentNews.description}</p>
          </div>
          <button className="news-button">Leer más</button>
        </div>
      </div>
    );
  };
  
  export default NewsCarousel;