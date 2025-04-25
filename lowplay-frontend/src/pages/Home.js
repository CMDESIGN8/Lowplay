import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Login from './Login';
import '../styles/home.css';

function Home() {
    const [userCount, setUserCount] = useState(0);
    const [plantelCount, setPlantelCount] = useState(0);
    const [competitionCount, setCompetitionCount] = useState(0);
    const [currentStep, setCurrentStep] = useState(1);
    const [showAttributes, setShowAttributes] = useState(false);

    const introSectionRef = useRef(null);
    const howItWorksSectionRef = useRef(null);
    const ctaLoginSectionRef = useRef(null);
    const communitySectionRef = useRef(null);

    useEffect(() => {
        const animateNumber = (setCount, target, duration = 2000) => {
            const end = parseInt(target.replace(/[,+]/g, ''), 10);
            const increment = Math.ceil(end / (duration / 10));

            let current = 0;
            const timer = setInterval(() => {
                current += increment;
                if (current >= end) {
                    clearInterval(timer);
                    setCount(end);
                } else {
                    setCount(current);
                }
            }, 10);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section-visible');
                    observer.unobserve(entry.target);
                    if (entry.target === communitySectionRef.current) {
                        animateNumber(setUserCount, '350+');
                        animateNumber(setPlantelCount, '11+');
                        animateNumber(setCompetitionCount, '10+');
                    }
                }
            });
        }, {
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
        });

        const sections = [
            introSectionRef,
            howItWorksSectionRef,
            ctaLoginSectionRef,
            communitySectionRef,
        ];

        sections.forEach((sectionRef) => {
            if (sectionRef.current) {
                sectionRef.current.classList.add('section-hidden');
                observer.observe(sectionRef.current);
            }
        });

        return () => {
            sections.forEach((sectionRef) => {
                if (sectionRef.current) {
                    observer.unobserve(sectionRef.current);
                }
            });
        };
    }, []);

    const nextStep = () => {
        setCurrentStep(prevStep => prevStep < 3 ? prevStep + 1 : 1);
        setShowAttributes(true);
    };

    const generateAttributes = () => {
        const names = ['Mateo Mercado', 'Luca Fernández', 'Sofía Ríos'];

        const imageUrls = [
            '../assets/img/mateo1.png',
            '../assets/img/mateo1.png',
            '../assets/img/mateo1.png',
            '../assets/img/mateo.png',
            '../assets/img/mateo.png',

        ];

        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomImageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];

        const attributes = {
            RIT: Math.floor(Math.random() * (99 - 60 + 1)) + 60,
            TIR: Math.floor(Math.random() * (99 - 60 + 1)) + 60,
            PAS: Math.floor(Math.random() * (99 - 60 + 1)) + 60,
            DEF: Math.floor(Math.random() * (99 - 60 + 1)) + 60,
            REG: Math.floor(Math.random() * (99 - 60 + 1)) + 60,
            FIS: Math.floor(Math.random() * (99 - 60 + 1)) + 60,
        };

        return {
            name: randomName,
            imageUrl: randomImageUrl,
            attributes: attributes,
        };
    };
   
    const steps = document.querySelectorAll('.step');



steps.forEach(step => {

    let isDragging = false;

    let previousMouseX = 0;

    let previousMouseY = 0;

    let rotateX = 0;

    let rotateY = 0;



    step.addEventListener('mousedown', (e) => {

        isDragging = true;

        previousMouseX = e.clientX;

        previousMouseY = e.clientY;

    });



    step.addEventListener('mousemove', (e) => {

        if (!isDragging) return;



        const deltaX = e.clientX - previousMouseX;

        const deltaY = e.clientY - previousMouseY;



        previousMouseX = e.clientX;

        previousMouseY = e.clientY;



        rotateX += deltaY * 0.1; // Reducir la sensibilidad de la rotación en X

        rotateY -= deltaX * 0.1; // Reducir la sensibilidad de la rotación en Y



        // Limitar los ángulos de rotación para evitar giros bruscos

        rotateX = Math.max(Math.min(rotateX, 45), -45); // Limitar la rotación en X a +/- 45 grados

        rotateY = Math.max(Math.min(rotateY, 45), -45); // Limitar la rotación en Y a +/- 45 grados



        step.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    });



    step.addEventListener('mouseup', () => {

        isDragging = false;

    });



    step.addEventListener('mouseleave', () => {

        isDragging = false;

    });

});
    

    const news = [
        {
            id: 1,
            title: 'Nueva Actualización Disponible',
            description: 'Se ha lanzado una nueva actualización con mejoras y correcciones de errores.',
            image: '../assets/img/app1.jpeg',
            link: 'https://www.lowcargo.lat',
        },
        
        // ... más noticias ...
    ];

    return (
        <div id="app-container">
            <div className="app-content">
                <div className="home-container">
                    <header className="home-header">
                        <div className="logo">
                            <img src="../assets/img/1.png" alt="Logo de LOW PLAY" />
                        </div>
                        <div className="header-content">
                            <p className="lema">Crea tu carta de jugador, arma planteles invencibles y domina las competencias.</p>
                            <br></br><br></br>
                            <div className="header-buttons">
                            <Link to="/register" className="cta-login-button">¡Regístrate Ahora!</Link>
                                <a href="/learn-more" className="learn-btn">Aprende Más</a>
                            </div>
                        </div>
                    </header>

                    <main className="home-main">
                        <section className="intro-section" ref={introSectionRef}>
                            <div className="intro-visual">
                                <img src="../assets/img/intro.png" alt="Imagen de introducción" />
                            </div>
                            <div className="intro-text">
                                <h2>¿Qué es LOW PLAY?</h2>
                                <p id="typing-text">LOW PLAY es la plataforma integral que revoluciona la experiencia de los clubes deportivos y sus socios, creando una comunidad deportiva digital vibrante. Aquí, puedes diseñar tu propia carta de jugador al estilo FIFA, armar planteles invencibles y competir en emocionantes torneos virtuales.</p>
                                <div className="features-list-container">
                                    <ul className="features-list">
                                        <li>&#x1F3C5; Asociate a tu club favorito.</li>
                                        <li>&#x1F45F; Compra indumentaria y accesorios de tu Equipo.</li>
                                        <li>&#x1F4B3; Gestiona pagos y vencimientos de tus cuotas.</li>
                                        <li>&#x1F91D; Conéctate con socios de otros clubes.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section className="how-it-works-section" ref={howItWorksSectionRef}>
                            <h2>Hace Click para ver como funciona</h2>
                            <div className="steps">
                                <div
                                    className={`step ${currentStep === 1 ? 'active' : ''}`}
                                    onClick={nextStep}
                                >
                                    <div className="step-header">
                                        <i className="fas fa-user-plus fa-3x"></i>
                                        <h3>1.<br></br> Regístrate</h3>
                                        <p>Crea tu cuenta en LowPlay</p>
                                    </div>
                                    {currentStep === 1 && (
                                        <>
                                            
                                            {showAttributes && (
                                                <div className="attributes">
                                                    <div className="player-info">
                                                        <img src={generateAttributes().imageUrl} alt="Player" className="player-image" />
                                                        <p className="player-name">{generateAttributes().name}</p>
                                                    </div>
                                                    <br></br>

                                                    {Object.entries(generateAttributes().attributes).map(([key, value]) => (
                                                        <p key={key} className="attribute">
                                                            {value} {key}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div
                                    className={`step ${currentStep === 2 ? 'active' : ''}`}
                                    onClick={nextStep}
                                >
                                    <div className="step-header">
                                    <br></br><br></br>
                                    <p>Selecciona a tus jugadores favoritos y crea un equipo invencible para competir.</p>
                                    </div>
                                    {currentStep === 2 && (
                                        <>
                                            
                                            {showAttributes && (
                                                <div className="attributes">
                                                    <div className="player-info">
                                                        <img src={generateAttributes().imageUrl} alt="Player" className="player-image" />
                                                        <p className="player-name">{generateAttributes().name}</p>
                                                    </div>
                                                    <br></br>

                                                    {Object.entries(generateAttributes().attributes).map(([key, value]) => (
                                                        <p key={key} className="attribute">
                                                            {value} {key}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div
                                    className={`step ${currentStep === 3 ? 'active' : ''}`}
                                    onClick={nextStep}
                                >
                                    <div className="step-header">
                                    <br></br><br></br>
                                    <p>Participa en torneos y desafíos para demostrar que eres el mejor estratega.</p>
                                    </div>
                                    {currentStep === 3 && (
                                        <> 
                                            {showAttributes && (
                                                <div className="attributes">
                                                    <div className="player-info">
                                                        <img src={generateAttributes().imageUrl} alt="Player" className="player-image" />
                                                        <p className="player-name">{generateAttributes().name}</p>
                                                    </div>
                                                    <br></br>

                                                    {Object.entries(generateAttributes().attributes).map(([key, value]) => (
                                                        <p key={key} className="attribute">
                                                            {value} {key}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </section>
                        <section className="cta-login-section" ref={ctaLoginSectionRef}>
                            <div className="cta-login-container">
                                <div className="cta-login-content">
                                    <h2>Únete a la Comunidad LOW PLAY</h2>
                                    <p>Conéctate con otros apasionados del deporte, crea tu leyenda y forma parte de la comunidad LOW PLAY. ¡Tu aventura comienza aquí!</p>
                                    <Link to="/register" className="cta-login-button">¡Regístrate Ahora!</Link>
                                </div>
                                <div>
                                    <Login />
                                </div>
                            </div>
                        </section>
                        <section className="community-section" ref={communitySectionRef}>
                            <div className="stats">
                                <div className="stat">
                                    <i className="fas fa-user-plus fa-3x"></i>
                                    <h3>{userCount.toLocaleString()}</h3>
                                    <p>Usuarios Registrados</p>
                                </div>
                                <div className="stat">
                                    <i className="fas fa-users fa-3x"></i>
                                    <h3>{plantelCount.toLocaleString()}</h3>
                                    <p>Planteles Creados</p>
                                </div>
                                <div className="stat">
                                    <i className="fas fa-trophy fa-3x"></i>
                                    <h3>{competitionCount.toLocaleString()}</h3>
                                    <p>Competencias Activas</p>
                                </div>
                            </div>
                        </section>
                    </main>

                    <section className="news-section">
    <h2>Últimas Noticias</h2>
    <ul className="news-list">
        {news.map((newsItem) => (
            <li className="news-item" key={newsItem.id}>
                <img src={newsItem.image} alt={newsItem.title} className="news-image" />
                <div className="news-content">
                    <h3>{newsItem.title}</h3>
                    <p>{newsItem.description}</p>
                    <a href={newsItem.link} target="_blank" rel="noopener noreferrer">Leer más</a>
                </div>
            </li>
        ))}
    </ul>
</section>

                    <footer className="home-footer">
                        <div className="footer-links">
                            <div className="social-links">
                                <Link to="https://www.facebook.com"><i className="fab fa-facebook-f"></i></Link>
                                <Link to="https://www.twitter.com"><i className="fab fa-twitter"></i></Link>
                                <Link to="https://www.instagram.com"><i className="fab fa-instagram"></i></Link>
                            </div>
                            <br />
                            <a href="/terms">Términos de Servicio</a>
                            <a href="/privacy">Política de Privacidad</a>
                            <a href="/contact">Contacto</a>
                        </div>
                        <p>&copy; {new Date().getFullYear()} LOW PLAY</p>
                    </footer>
                </div>
            </div>
        </div>
    );
}

export default Home;