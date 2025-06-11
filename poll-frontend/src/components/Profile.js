import React, {useContext, useEffect, useState} from "react";
import {AuthContext} from "../context/AuthContext";
import '../styles/profile.css';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
} from "recharts";

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
                color: i % 2 === 0 ? "rgba(99, 102, 241, 0.3)" : "rgba(255, 36, 36, 0.3)",
            });
        }
        setShapes(initialShapes);
    }, []);

    useEffect(() => {
        let animationFrameId;

        function animate() {
            setShapes((prevShapes) =>
                prevShapes.map((shape) => {
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
            {shapes.map((shape) => (
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

function Modal({visible, onClose, children}) {
    if (!visible) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    ×
                </button>
                {children}
            </div>
            <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: #232329;
          padding: 20px;
          border-radius: 10px;
          max-width: 90vw;
          max-height: 90vh;
          overflow-y: auto;
          color: white;
          position: relative;
        }
        .modal-close {
          position: absolute;
          top: 10px; right: 15px;
          background: transparent;
          border: none;
          font-size: 24px;
          color: white;
          cursor: pointer;
        }
      `}</style>
        </div>
    );
}

function Profile() {
    const {user, token} = useContext(AuthContext);
    const [createdSurveys, setCreatedSurveys] = useState([]);
    const [surveyStats, setSurveyStats] = useState({});
    const [questionStats, setQuestionStats] = useState({});
    const [loadingSurveys, setLoadingSurveys] = useState(true);
    const [loadingStatsIds, setLoadingStatsIds] = useState({});
    const [loadingQuestionStats, setLoadingQuestionStats] = useState({});
    const [error, setError] = useState(null);
    const [activeQuestionId, setActiveQuestionId] = useState(null);

    useEffect(() => {
        async function fetchCreatedSurveys() {
            if (!user || !token) return;

            setLoadingSurveys(true);
            setError(null);
            try {
                const response = await fetch(
                    `http://localhost:8000/api/v1/polls/?author_id=${user.id}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok)
                    throw new Error(`Ошибка загрузки созданных опросов: ${response.status}`);

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

    async function fetchSurveyStatistics(pollId) {
        setLoadingStatsIds((prev) => ({...prev, [pollId]: true}));
        setError(null);
        try {
            const res = await fetch(
                `http://localhost:8000/api/v1/polls/${pollId}/statics/`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!res.ok) throw new Error(`Ошибка загрузки статистики опроса`);
            const stat = await res.json();

            const countries = stat.countries
                ? Object.entries(stat.countries).map(([name, value]) => ({name, value}))
                : [];
            const age = {
                min: stat.age_statistics?.min,
                max: stat.age_statistics?.max,
                average: stat.age_statistics?.average,
                distribution: [],
            };
            const gender = {
                male: stat.gender_statistics?.male ?? 0,
                female: stat.gender_statistics?.female ?? 0,
            };

            setSurveyStats((prev) => ({
                ...prev,
                [pollId]: {
                    poll: {
                        id: stat.poll_id,
                        title: stat.poll_title,
                        total_answers: stat.total_respondents,
                        total_respondents: stat.total_respondents,
                        questions: stat.questions || [],
                    },
                    demographics: {countries, age, gender},
                },
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingStatsIds((prev) => ({...prev, [pollId]: false}));
        }
    }

    async function fetchQuestionStatistics(questionId) {
        setLoadingQuestionStats((prev) => ({...prev, [questionId]: true}));
        setError(null);
        try {
            const res = await fetch(
                `http://localhost:8000/api/v1/questions/${questionId}/statics/`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!res.ok) throw new Error(`Ошибка загрузки статистики вопроса`);
            const stat = await res.json();

            const options = stat.answers_count
                ? Object.entries(stat.answers_count).map(([name, value]) => ({name, value}))
                : [];

            setQuestionStats((prev) => ({
                ...prev,
                [questionId]: {
                    question: stat.question || "Вопрос",
                    options,
                    raw: stat,
                },
            }));

            setActiveQuestionId(questionId);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingQuestionStats((prev) => ({...prev, [questionId]: false}));
        }
    }

    function renderDemographics(demographics) {
        if (!demographics) return null;

        return (
            <div className="demographics">
                {demographics.countries.length > 0 && (
                    <div className="countries">
                        <strong>Страны:</strong>
                        <BarChart width={400} height={200} data={demographics.countries}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="name"/>
                            <YAxis/>
                            <Tooltip/>
                            <Bar dataKey="value" fill="#8884d8"/>
                        </BarChart>
                    </div>
                )}

                {demographics.age && (
                    <div className="age">
                        <strong>Возраст:</strong>
                        <p>
                            Мин: {demographics.age.min ?? "—"}, Макс: {demographics.age.max ?? "—"}, Средний:{" "}
                            {demographics.age.average ?? "—"}
                        </p>
                    </div>
                )}

                {demographics.gender && (
                    <div className="gender">
                        <strong>Пол:</strong>
                        <p>Мужчины: {demographics.gender.male}</p>
                        <p>Женщины: {demographics.gender.female}</p>
                        <PieChart width={300} height={200}>
                            <Pie
                                data={[
                                    {name: "Мужчины", value: demographics.gender.male},
                                    {name: "Женщины", value: demographics.gender.female},
                                ]}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                fill="#8884d8"
                                label
                            >
                                <Cell fill="#0088FE"/>
                                <Cell fill="#00C49F"/>
                            </Pie>
                            <Tooltip/>
                        </PieChart>
                    </div>
                )}
            </div>
        );
    }

    function renderQuestionStat(stat) {
        if (!stat) return null;

        if (stat.options && stat.options.length > 0) {
            return (
                <div>
                    <h5>{stat.question}</h5>
                    <BarChart width={400} height={200} data={stat.options}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="name"/>
                        <YAxis allowDecimals={false}/>
                        <Tooltip/>
                        <Bar dataKey="value" fill="#8884d8"/>
                    </BarChart>
                </div>
            );
        }

        return <div>Нет данных для отображения статистики вопроса</div>;
    }

    return (
        <>
            <BackgroundShapes/>
            <main className="profile-wrapper">
                <section className="profile-container">
                    <h1 className="profile-title">Профиль пользователя</h1>
                    <p className="profile-nickname">
                        <span className="profile-nickname--highlight">{user?.username}</span>
                    </p>

                    {loadingSurveys && <p>Загрузка созданных опросов...</p>}
                    {error && <p style={{color: "red"}}>Ошибка: {error}</p>}

                    {!loadingSurveys && createdSurveys.length === 0 && (
                        <p>Вы ещё не создали опросы.</p>
                    )}

                    {createdSurveys.length > 0 && (
                        <>
                            <h3>Созданные опросы:</h3>
                            <ul className="survey-list">
                                {createdSurveys.map((survey) => {
                                    const stat = surveyStats[survey.id];
                                    return (
                                        <li key={survey.id} className="survey-list__item">
                                            <h4 className="survey-title">{survey.title}</h4>
                                            {survey.description && (
                                                <p className="survey-description">{survey.description}</p>
                                            )}
                                            <button
                                                onClick={() => fetchSurveyStatistics(survey.id)}
                                                disabled={loadingStatsIds[survey.id]}
                                                className="btn-statistics"
                                            >
                                                {loadingStatsIds[survey.id]
                                                    ? "Загрузка статистики..."
                                                    : "Показать статистику опроса"}
                                            </button>
                                            {stat && (
                                                <div className="survey-statistics">
                                                    <p>Всего ответов: {stat.poll.total_answers}</p>
                                                    <p>Всего респондентов: {stat.poll.total_respondents}</p>
                                                    {renderDemographics(stat.demographics)}

                                                    {stat.poll.questions && stat.poll.questions.length > 0 && (
                                                        <div style={{marginTop: 20}}>
                                                            <h5>Вопросы опроса:</h5>
                                                            <ul>
                                                                {stat.poll.questions.map((q) => (
                                                                    <li key={q.id} style={{marginBottom: 10}}>
                                                                        <span>{q.question}</span>
                                                                        <button
                                                                            className="btn-statistics"
                                                                            style={{marginLeft: 10}}
                                                                            onClick={() => {
                                                                                console.log("Клик по вопросу", q.id);
                                                                                fetchQuestionStatistics(q.id);
                                                                            }}
                                                                            disabled={loadingQuestionStats[q.id]}
                                                                        >
                                                                            {loadingQuestionStats[q.id] ? "Загрузка..." : "Показать статистику вопроса"}
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>

                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </>
                    )}
                </section>
            </main>

            <Modal
                visible={!!activeQuestionId}
                onClose={() => setActiveQuestionId(null)}
            >
                {activeQuestionId && renderQuestionStat(questionStats[activeQuestionId])}
            </Modal>

            <style>{`
        .profile-wrapper {
          position: relative;
          z-index: 1;
          color: white;
        }
        .profile-container {
          background-color: #232329;
          border-radius: 12px;
          padding: 20px;
        }
        .profile-title {
          margin-bottom: 10px;
        }
        .profile-nickname {
          font-size: 1.2em;
          margin-bottom: 20px;
        }
        .profile-nickname--highlight {
          color: #6366f1;
          font-weight: 600;
        }
        .survey-list {
          list-style: none;
          padding: 0;
        }
        .survey-list__item {
          background-color: #34353b;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 10px;
        }
        .survey-title {
          margin: 0 0 5px 0;
        }
        .survey-description {
          margin: 0 0 10px 0;
          color: #aaa;
        }
        .btn-statistics {
          background-color: #6366f1;
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.3s ease;
        }
        .btn-statistics:disabled {
          background-color: #999;
          cursor: not-allowed;
        }
        .btn-statistics:hover:not(:disabled) {
          background-color: #4f46e5;
        }
        .survey-statistics {
          margin-top: 10px;
          padding: 10px;
          border-radius: 8px;
          background-color: #444;
        }
        .demographics {
          margin-top: 10px;
        }
        .demographics > div {
          margin-bottom: 20px;
          padding: 15px;
          border-radius: 8px;
          background-color: #444;
        }
        .demographics strong {
          display: block;
          margin-bottom: 5px;
          color: #ddd;
        }
      `}</style>
        </>
    );
}

export default Profile;
