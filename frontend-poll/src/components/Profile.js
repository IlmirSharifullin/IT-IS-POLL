import React, {useContext, useEffect, useState} from 'react';
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

function Modal({children, onClose}) {
    React.useEffect(() => {
        function onKeyDown(e) {
            if (e.key === 'Escape') onClose();
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    return (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Закрыть модальное окно">&times;</button>
                {children}
            </div>
            <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background: var(--color-panel, #232329);
          border-radius: 12px;
          padding: 20px;
          max-width: 600px;
          width: 90%;
          color: var(--color-text, #fff);
          position: relative;
          box-shadow: 0 0 15px rgba(0,0,0,0.7);
          max-height: 80vh;
          overflow-y: auto;
        }
        .modal-close {
          position: absolute;
          top: 10px;
          right: 15px;
          background: transparent;
          border: none;
          font-size: 1.8rem;
          color: var(--color-text, #fff);
          cursor: pointer;
        }
        .stat-section {
          margin-bottom: 15px;
        }
        .stat-section strong {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
        }
        .stat-list span {
          display: inline-block;
          margin-right: 10px;
          font-size: 0.9rem;
          color: var(--color-accent, #6366F1);
        }
      `}</style>
        </div>
    );
}

function Profile() {
    const {user, token} = useContext(AuthContext);
    const [createdSurveys, setCreatedSurveys] = useState([]);
    const [loadingSurveys, setLoadingSurveys] = useState(true);
    const [loadingStat, setLoadingStat] = useState(false);
    const [error, setError] = useState(null);
    const [selectedSurveyStat, setSelectedSurveyStat] = useState(null);

    useEffect(() => {
        async function fetchCreatedSurveys() {
            if (!user || !token) return;

            setLoadingSurveys(true);
            setError(null);
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/v1/polls/?author_id=${user.id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error(`Ошибка загрузки созданных опросов: ${response.status}`);

                const data = await response.json();
                setCreatedSurveys(data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoadingSurveys(false);
            }
        }

        fetchCreatedSurveys();
    }, [user, token]);

    async function openStatModal(survey) {
        if (!token) return;
        setLoadingStat(true);
        setError(null);
        setSelectedSurveyStat(null);

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/v1/polls/${survey.id}/statistic/`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error(`Ошибка загрузки статистики: ${res.status}`);

            const statData = await res.json();
            setSelectedSurveyStat({survey, statData});
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingStat(false);
        }
    }

    function closeModal() {
        setSelectedSurveyStat(null);
        setError(null);
    }

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

                    {loadingSurveys && <p>Загрузка созданных опросов...</p>}
                    {error && <p style={{color: 'red'}}>Ошибка: {error}</p>}

                    {createdSurveys.length === 0 && !loadingSurveys && <p>Вы ещё не создали опросы.</p>}

                    {createdSurveys.length > 0 && (
                        <>
                            <h3>Созданные опросы:</h3>
                            <ul className="survey-list">
                                {createdSurveys.map(survey => (
                                    <li
                                        key={survey.id}
                                        className="survey-list__item"
                                        tabIndex={0}
                                        role="button"
                                        onClick={() => openStatModal(survey)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') openStatModal(survey);
                                        }}
                                    >
                                        <h4 className="survey-title">{survey.title}</h4>
                                        {survey.description &&
                                            <p className="survey-description">{survey.description}</p>}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </section>
            </main>

            {selectedSurveyStat && (
                <Modal onClose={closeModal}>
                    <h2>Статистика опроса: {selectedSurveyStat.survey.title}</h2>
                    {loadingStat && <p>Загрузка статистики...</p>}
                    {!loadingStat && selectedSurveyStat.statData && (
                        <>
                            <div className="stat-section">
                                <strong>Всего ответивших:</strong> {selectedSurveyStat.statData.total_respondents}
                            </div>
                            <div className="stat-section">
                                <strong>Страны:</strong>
                                {selectedSurveyStat.statData.countries && Object.keys(selectedSurveyStat.statData.countries).length > 0 ? (
                                    <div className="stat-list">
                                        {Object.entries(selectedSurveyStat.statData.countries).map(([country, count]) => (
                                            <span key={country}>{country}: {count}</span>
                                        ))}
                                    </div>
                                ) : (
                                    <p>Нет данных</p>
                                )}
                            </div>
                            <div className="stat-section">
                                <strong>Возраст:</strong>
                                {selectedSurveyStat.statData.age_statistics ? (
                                    <p>
                                        мин: {selectedSurveyStat.statData.age_statistics.min ?? '-'},
                                        макс: {selectedSurveyStat.statData.age_statistics.max ?? '-'},
                                        средний: {selectedSurveyStat.statData.age_statistics.average ? selectedSurveyStat.statData.age_statistics.average.toFixed(1) : '-'}
                                    </p>
                                ) : (
                                    <p>Нет данных</p>
                                )}
                            </div>
                            <div className="stat-section">
                                <strong>Пол:</strong>
                                {selectedSurveyStat.statData.gender_statistics ? (
                                    <p>
                                        мужчины: {selectedSurveyStat.statData.gender_statistics.male},
                                        женщины: {selectedSurveyStat.statData.gender_statistics.female}
                                    </p>
                                ) : (
                                    <p>Нет данных</p>
                                )}
                            </div>
                        </>
                    )}
                </Modal>
            )}
        </>
    );
}

export default Profile;
