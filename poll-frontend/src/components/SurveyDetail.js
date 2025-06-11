import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import Modal from './Modal';
import BackgroundShapes from './BackgroundShapes';

function SurveyDetail() {
    const { pollId } = useParams();
    const { token } = useContext(AuthContext);
    const [pollDetails, setPollDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [questionStats, setQuestionStats] = useState({});
    const [loadingStats, setLoadingStats] = useState(false);
    const [activeQuestionId, setActiveQuestionId] = useState(null);
    const [surveyStats, setSurveyStats] = useState(null);
    const [showSurveyStats, setShowSurveyStats] = useState(false);

    useEffect(() => {
        async function fetchPollDetails() {
            try {
                const response = await fetch(`http://localhost:8000/api/v1/polls/${pollId}/`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) throw new Error('Ошибка загрузки опроса');
                const data = await response.json();
                setPollDetails(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (pollId && token) {
            fetchPollDetails();
        }
    }, [pollId, token]);

    const handleQuestionStats = async (questionId) => {
        setLoadingStats(true);
        try {
            const response = await fetch(`http://localhost:8000/api/v1/questions/${questionId}/statics/`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error('Ошибка загрузки статистики вопроса');
            const data = await response.json();
            
            setQuestionStats(prev => ({
                ...prev,
                [questionId]: data
            }));
            setActiveQuestionId(questionId);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingStats(false);
        }
    };

    const handleSurveyStats = async () => {
        setLoadingStats(true);
        try {
            const response = await fetch(`http://localhost:8000/api/v1/polls/${pollId}/statics/`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error('Ошибка загрузки статистики опроса');
            const data = await response.json();
            console.log('Survey statistics:', data);
            setSurveyStats(data);
            setShowSurveyStats(true);
        } catch (err) {
            console.error('Error loading survey statistics:', err);
            setError(err.message);
        } finally {
            setLoadingStats(false);
        }
    };

    const renderQuestionStat = (stat) => {
        if (!stat) return null;

        if (stat.type === 'single_choice') {
            return (
                <div className="question-stats">
                    <h3>{stat.question}</h3>
                    <p>Всего ответов: {stat.total_answers}</p>
                    <BarChart width={500} height={300} data={stat.options}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                </div>
            );
        } else if (stat.type === 'multiple_choice') {
            // Преобразуем данные для чекбоксов
            const chartData = stat.options.map(option => ({
                name: option.name,
                value: option.count || option.value, // поддерживаем оба формата
                percentage: ((option.count || option.value) / stat.total_answers * 100).toFixed(1)
            }));

            return (
                <div className="question-stats">
                    <h3>{stat.question}</h3>
                    <p>Всего ответов: {stat.total_answers}</p>
                    <BarChart width={500} height={300} data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={({ payload, label }) => {
                            if (payload && payload.length > 0) {
                                const data = payload[0].payload;
                                return (
                                    <div className="custom-tooltip">
                                        <p>{`${label}: ${data.value} (${data.percentage}%)`}</p>
                                    </div>
                                );
                            }
                            return null;
                        }} />
                        <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                </div>
            );
        } else if (stat.type === 'text') {
            return (
                <div className="question-stats">
                    <h3>{stat.question}</h3>
                    <p>Всего ответов: {stat.total_answers}</p>
                    {stat.word_cloud && (
                        <div className="word-cloud">
                            <img src={stat.word_cloud} alt="Word Cloud" style={{maxWidth: '100%'}} />
                        </div>
                    )}
                    {stat.top_words && (
                        <div className="top-words">
                            <h4>Топ слов:</h4>
                            <ul>
                                {stat.top_words.map(([word, count], index) => (
                                    <li key={index}>{word}: {count}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            );
        }

        return <div>Неподдерживаемый тип вопроса</div>;
    };

    const renderSurveyStats = (stats) => {
        console.log('Rendering survey stats:', stats);
        if (!stats) return null;

        // Преобразуем данные для графиков
        const countryData = stats.demographics?.countries || [];
        const genderData = [
            { name: 'Мужчины', value: stats.demographics?.gender?.male || 0 },
            { name: 'Женщины', value: stats.demographics?.gender?.female || 0 }
        ];

        return (
            <div className="survey-stats">
                <h2>Общая статистика опроса</h2>
                
                <div className="stats-section">
                    <h3>Основная информация</h3>
                    <p>Всего респондентов: {stats.poll?.total_respondents || 0}</p>
                    <p>Всего ответов: {stats.poll?.total_answers || 0}</p>
                </div>

                {stats.demographics?.age && (
                    <div className="stats-section">
                        <h3>Возрастная статистика</h3>
                        <p>Минимальный возраст: {stats.demographics.age.min || 'Нет данных'}</p>
                        <p>Максимальный возраст: {stats.demographics.age.max || 'Нет данных'}</p>
                        <p>Средний возраст: {stats.demographics.age.average ? stats.demographics.age.average.toFixed(1) : 'Нет данных'}</p>
                        
                        {stats.demographics.age.distribution && stats.demographics.age.distribution.length > 0 && (
                            <div className="age-distribution">
                                <h4>Распределение по возрасту</h4>
                                <BarChart 
                                    width={500} 
                                    height={250} 
                                    data={stats.demographics.age.distribution}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="range" />
                                    <YAxis />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#34353b',
                                            border: '1px solid #6366f1',
                                            borderRadius: '4px'
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#6366f1" />
                                </BarChart>
                            </div>
                        )}
                    </div>
                )}

                {genderData.some(item => item.value > 0) && (
                    <div className="stats-section">
                        <h3>Гендерная статистика</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <BarChart 
                                width={500} 
                                height={250} 
                                data={genderData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#34353b',
                                        border: '1px solid #6366f1',
                                        borderRadius: '4px'
                                    }}
                                />
                                <Bar dataKey="value" fill="#6366f1" />
                            </BarChart>
                        </div>
                    </div>
                )}

                {countryData.length > 0 && (
                    <div className="stats-section">
                        <h3>География</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <BarChart 
                                width={500} 
                                height={250} 
                                data={countryData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#34353b',
                                        border: '1px solid #6366f1',
                                        borderRadius: '4px'
                                    }}
                                />
                                <Bar dataKey="value" fill="#6366f1" />
                            </BarChart>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!pollDetails) return <div className="error">Опрос не найден</div>;

    return (
        <>
            <BackgroundShapes />
            <main className="survey-detail" role="main">
                <div className="survey-detail__content">
                    <h1 className="survey-detail__title">{pollDetails.title}</h1>
                    {pollDetails.description && (
                        <p className="survey-detail__description">{pollDetails.description}</p>
                    )}

                    <button
                        onClick={handleSurveyStats}
                        className="btn-statistics survey-stats-btn"
                        disabled={loadingStats}
                    >
                        {loadingStats ? 'Загрузка...' : 'Показать общую статистику'}
                    </button>

                    <div className="survey-detail__questions">
                        <h2>Вопросы опроса:</h2>
                        <ul className="questions-list">
                            {pollDetails.questions.map(question => (
                                <li key={question.id} className="question-item">
                                    <div className="question-content">
                                        <h3>{question.question}</h3>
                                        {question.type !== 'text' && (
                                            <div className="question-options">
                                                <p>Варианты ответов:</p>
                                                <ul>
                                                    {question.options.map((option, index) => (
                                                        <li key={index}>{option}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleQuestionStats(question.id)}
                                        className="btn-statistics"
                                        disabled={loadingStats}
                                    >
                                        {loadingStats ? 'Загрузка...' : 'Показать статистику'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <Modal
                    visible={!!activeQuestionId}
                    onClose={() => setActiveQuestionId(null)}
                >
                    {activeQuestionId && renderQuestionStat(questionStats[activeQuestionId])}
                </Modal>

                <Modal
                    visible={showSurveyStats}
                    onClose={() => setShowSurveyStats(false)}
                >
                    {surveyStats && renderSurveyStats(surveyStats)}
                </Modal>
            </main>

            <style>{`
                .survey-detail {
                    padding: 20px;
                    position: relative;
                    z-index: 1;
                    color: white;
                }
                .survey-detail__content {
                    max-width: 800px;
                    margin: 0 auto;
                    background-color: #232329;
                    border-radius: 12px;
                    padding: 20px;
                }
                .survey-detail__title {
                    margin-bottom: 16px;
                    color: #fff;
                }
                .survey-detail__description {
                    color: #9ca3af;
                    margin-bottom: 24px;
                }
                .questions-list {
                    list-style: none;
                    padding: 0;
                }
                .question-item {
                    background-color: #2a2b30;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                .question-content {
                    flex: 1;
                    margin-right: 16px;
                }
                .question-content h3 {
                    margin: 0 0 12px 0;
                    color: #fff;
                }
                .question-options {
                    margin-top: 8px;
                }
                .question-options p {
                    margin: 0 0 8px 0;
                    color: #9ca3af;
                }
                .question-options ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .question-options li {
                    background-color: #34353b;
                    padding: 8px 12px;
                    border-radius: 4px;
                    margin-bottom: 4px;
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
                    white-space: nowrap;
                }
                .btn-statistics:disabled {
                    background-color: #999;
                    cursor: not-allowed;
                }
                .btn-statistics:hover:not(:disabled) {
                    background-color: #4f46e5;
                }
                .question-stats {
                    padding: 20px;
                    background-color: #2a2b30;
                    border-radius: 8px;
                    color: white;
                }
                .word-cloud {
                    margin: 20px 0;
                    text-align: center;
                }
                .top-words {
                    margin-top: 20px;
                }
                .top-words ul {
                    list-style: none;
                    padding: 0;
                }
                .top-words li {
                    margin: 5px 0;
                }
                .custom-tooltip {
                    background-color: #34353b;
                    border-radius: 4px;
                    padding: 8px 12px;
                    border: 1px solid #6366f1;
                }
                .custom-tooltip p {
                    margin: 0;
                    color: white;
                }
                .survey-stats-btn {
                    margin: 20px 0;
                    width: 100%;
                    padding: 12px;
                    font-size: 1.1em;
                }
                .survey-stats {
                    padding: 24px;
                    background-color: #2a2b30;
                    border-radius: 12px;
                    color: white;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .stats-section {
                    margin-bottom: 32px;
                    background-color: #34353b;
                    padding: 20px;
                    border-radius: 8px;
                }
                .stats-section h3 {
                    color: #6366f1;
                    margin-bottom: 16px;
                    font-size: 1.2em;
                }
                .stats-section h4 {
                    color: #e0e0e0;
                    margin: 16px 0;
                    font-size: 1.1em;
                }
                .stats-section p {
                    margin: 8px 0;
                    color: #e0e0e0;
                    font-size: 1.1em;
                }
                .survey-stats h2 {
                    margin-bottom: 24px;
                    color: #fff;
                    text-align: center;
                    font-size: 1.5em;
                }
                .age-distribution {
                    margin-top: 20px;
                }
                .recharts-wrapper {
                    margin: 0 auto;
                }
            `}</style>
        </>
    );
}

export default SurveyDetail; 