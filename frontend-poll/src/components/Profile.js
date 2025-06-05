import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AuthContext} from '../context/AuthContext';
import '../styles/profile.css';

const NUM_SHAPES = 5;

function BackgroundShapes() {
    const [shapes, setShapes] = useState([]);

    useEffect(() => {
        const initialShapes = [];
        for (let i = 0; i < NUM_SHAPES; i++) {
            initialShapes.push({
                id: i,
                size: 200 + Math.random() * 200,
                top: Math.random() * 80 + 10,
                left: Math.random() * 80 + 10,
                directionX: Math.random() > 0.5 ? 1 : -1,
                directionY: Math.random() > 0.5 ? 1 : -1,
                speedX: 0.02 + Math.random() * 0.03,
                speedY: 0.01 + Math.random() * 0.02,
                blur: 80 + Math.random() * 40,
                color: i % 2 === 0 ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 36, 36, 0.3)',
            });
        }
        setShapes(initialShapes);
    }, []);

    useEffect(() => {
        let animationFrameId;

        function animate() {
            setShapes(prevShapes =>
                prevShapes.map(shape => {
                    let newLeft = shape.left + shape.speedX * shape.directionX;
                    let newTop = shape.top + shape.speedY * shape.directionY;

                    if (newLeft > 90) {
                        newLeft = 90;
                        shape.directionX = -1;
                    } else if (newLeft < 5) {
                        newLeft = 5;
                        shape.directionX = 1;
                    }

                    if (newTop > 90) {
                        newTop = 90;
                        shape.directionY = -1;
                    } else if (newTop < 5) {
                        newTop = 5;
                        shape.directionY = 1;
                    }

                    return {
                        ...shape,
                        left: newLeft,
                        top: newTop,
                        directionX: shape.directionX,
                        directionY: shape.directionY,
                    };
                })
            );

            animationFrameId = requestAnimationFrame(animate);
        }

        animationFrameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <div className="background-shapes">
            {shapes.map(shape => (
                <div
                    key={shape.id}
                    className="background-shape"
                    style={{
                        width: shape.size,
                        height: shape.size,
                        top: `${shape.top}%`,
                        left: `${shape.left}%`,
                        background: `radial-gradient(circle at center, ${shape.color}, transparent 70%)`,
                        filter: `blur(${shape.blur}px)`,
                    }}
                />
            ))}
        </div>
    );
}

function Profile() {
    const {user, token} = useContext(AuthContext);
    const [createdSurveys, setCreatedSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchCreatedSurveys() {
            if (!user || !token) return;

            setLoading(true);
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/v1/polls/?author_id=${user.id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка загрузки созданных опросов: ${response.status}`);
                }

                const data = await response.json();
                setCreatedSurveys(data.results || []);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        fetchCreatedSurveys();
    }, [user, token]);

    if (!user) {
        return (
            <>
                <BackgroundShapes/>
                <main className="profile-wrapper">
                    <section className="profile-container profile-container--empty">
                        <h2 className="profile-message">Пожалуйста, войдите в систему, чтобы увидеть профиль.</h2>
                    </section>
                </main>
            </>
        );
    }

    return (
        <>
            <BackgroundShapes/>
            <main className="profile-wrapper">
                <section className="profile-container">
                    <h1 className="profile-title">Профиль пользователя</h1>
                    <p className="profile-nickname">
                        <span className="profile-nickname--highlight">{user.username}</span>
                    </p>

                    {loading && <p>Загрузка созданных опросов...</p>}
                    {error && <p style={{color: 'red'}}>Ошибка: {error}</p>}

                    {createdSurveys.length > 0 ? (
                        <>
                            <h3>Созданные опросы:</h3>
                            <ul className="survey-list">
                                {createdSurveys.map(survey => (
                                    <li
                                        key={survey.id}
                                        className="survey-list__item"
                                        tabIndex={0}
                                        role="button"
                                        onClick={() => navigate(`/survey/${survey.id}`)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') navigate(`/survey/${survey.id}`);
                                        }}
                                    >
                                        <h4 className="survey-title">{survey.title}</h4>
                                        {survey.description &&
                                            <p className="survey-description">{survey.description}</p>}
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p>Вы ещё не создали опросы.</p>
                    )}
                </section>
            </main>
        </>
    );
}

export default Profile;
