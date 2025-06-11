import React, {useEffect, useState, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {AuthContext} from '../context/AuthContext';
import '../styles/survey_list.css';

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

function formatDate(dateString) {
    const options = {year: 'numeric', month: 'long', day: 'numeric'};
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', options);
}

function SurveyList() {
    const {token} = useContext(AuthContext);
    const [surveys, setSurveys] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            try {
                if (!token) throw new Error('Пользователь не авторизован');

                const usersRes = await fetch('http://127.0.0.1:8000/api/v1/users/', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!usersRes.ok) throw new Error('Ошибка загрузки пользователей');
                const usersData = await usersRes.json();

                const surveysRes = await fetch('http://127.0.0.1:8000/api/v1/polls/', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!surveysRes.ok) throw new Error('Ошибка загрузки опросов');
                const surveysData = await surveysRes.json();

                setUsers(usersData.results || []);
                setSurveys(surveysData || []); // исправлено: данные - массив, без .results
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [token]);

    const getUsernameById = id => {
        const user = users.find(u => u.id === id);
        return user ? user.username : `id${id}`;
    };

    if (loading) return <p>Загрузка опросов...</p>;
    if (error) return <p style={{color: 'red'}}>Ошибка: {error}</p>;
    if (surveys.length === 0) return <p>Опросы не найдены.</p>;

    return (
        <>
            <BackgroundShapes/>
            <main
                className="survey-list"
                role="main"
                aria-label="Список опросов"
                style={{padding: '20px', position: 'relative', zIndex: 1}}
            >
                <h1 className="survey-list__title">Доступные опросы</h1>
                <ul className="survey-list__items">
                    {surveys.map(survey => (
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
                            <h2 className="survey-list__item-title">{survey.title}</h2>
                            <p className="survey-list__item-description">{survey.description}</p>

                            {survey.tags && survey.tags.length > 0 && (
                                <p className="survey-list__item-tags">
                                    Теги: {survey.tags.join(', ')}
                                </p>
                            )}

                            <div className="survey-list__meta">
                                <span className="survey-list__author">Автор: {getUsernameById(survey.author_id)}</span>
                                <span className="survey-list__date">Создан: {formatDate(survey.created_at)}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </main>
            <style>{`
        .background-shapes {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
          background: #18181B;
        }
        .background-shape {
          position: absolute;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: background 0.3s;
        }
        .survey-list__item-tags {
          margin: 8px 0;
          font-size: 0.9rem;
          color: #9ca3af;
          font-style: italic;
        }
      `}</style>
        </>
    );
}

export default SurveyList;
