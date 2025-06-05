import React, {useEffect, useState, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import '../styles/take-survey.css';
import {AuthContext} from '../context/AuthContext';

function SurveyTake({surveyId}) {
    const {token} = useContext(AuthContext);
    const [surveyData, setSurveyData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [completed, setCompleted] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchSurvey() {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/v1/polls/${surveyId}/`, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? {'Authorization': `Bearer ${token}`} : {}),
                    },
                });
                if (!response.ok) throw new Error('Ошибка загрузки опроса');
                const data = await response.json();
                setSurveyData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        async function checkCompleted() {
            if (!token) return;
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/v1/polls/${surveyId}/user-status/`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error('Ошибка проверки статуса опроса');
                const data = await res.json();
                setCompleted(data.completed);
            } catch (err) {
                console.error(err);
            }
        }

        checkCompleted();
        fetchSurvey();
    }, [surveyId, token]);

    const handleChange = (questionIndex, value, checked, type) => {
        setAnswers(prev => {
            const newAnswers = {...prev};

            if (type === 'checkbox') {
                const prevValues = newAnswers[questionIndex] || [];
                if (checked) {
                    newAnswers[questionIndex] = [...prevValues, value];
                } else {
                    newAnswers[questionIndex] = prevValues.filter(v => v !== value);
                }
            } else {
                newAnswers[questionIndex] = value;
            }
            return newAnswers;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            alert('Пожалуйста, войдите в систему, чтобы отправить ответы');
            return;
        }

        for (let i = 0; i < surveyData.questions.length; i++) {
            if (!answers[i] || (Array.isArray(answers[i]) && answers[i].length === 0)) {
                alert(`Пожалуйста, ответьте на вопрос №${i + 1}`);
                return;
            }
        }

        setSubmitting(true);

        try {
            const promises = surveyData.questions.map((q, i) => {
                return fetch('http://127.0.0.1:8000/api/v1/answers/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        question: q.id,
                        answers: answers[i],
                        poll: surveyId,
                    }),
                }).then(res => {
                    if (!res.ok) throw new Error(`Ошибка при отправке ответа на вопрос №${i + 1}`);
                    return res.json();
                });
            });

            await Promise.all(promises);

            alert('Спасибо за участие в опросе!');
            setAnswers({});
            navigate('/'); // редирект на страницу со списком опросов
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p>Загрузка опроса...</p>;
    if (error) return <p style={{color: 'red'}}>{error}</p>;
    if (completed) return <p style={{textAlign: 'center', marginTop: '40px', fontSize: '1.2rem'}}>Вы уже проходили этот
        опрос. Спасибо!</p>;
    if (!surveyData) return null;

    return (
        <main className="survey-take" role="main" aria-label="Прохождение опроса">
            <h1 className="survey-take__title">{surveyData.title}</h1>
            <p className="survey-take__description">{surveyData.description}</p>
            <p style={{textAlign: 'center', marginBottom: '20px', fontWeight: '600'}}>
                Вопросов: {surveyData.questions.length}
            </p>

            <form className="survey-take__form" onSubmit={handleSubmit} noValidate>
                {surveyData.questions.map((q, idx) => (
                    <div key={idx} className="survey-take__question">
                        <label className="survey-take__question-label">{q.question}</label>

                        {q.type === 'text' ? (
                            <input
                                type="text"
                                className="survey-take__text-input"
                                value={answers[idx] || ''}
                                onChange={e => handleChange(idx, e.target.value, null, 'text')}
                                required
                            />
                        ) : (
                            <div className="survey-take__options">
                                {q.options.map((option, i) => {
                                    const inputId = `q${idx}_option${i}`;
                                    return (
                                        <label key={i} className="survey-take__option-label" htmlFor={inputId}>
                                            <input
                                                type={q.type}
                                                id={inputId}
                                                name={`question_${idx}${q.type === 'checkbox' ? '[]' : ''}`}
                                                value={option}
                                                checked={
                                                    q.type === 'checkbox'
                                                        ? (answers[idx] || []).includes(option)
                                                        : answers[idx] === option
                                                }
                                                onChange={e => handleChange(idx, option, e.target.checked, q.type)}
                                                className="survey-take__option-input"
                                                required={q.type === 'radio'}
                                            />
                                            {option}
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}

                <button type="submit" className="survey-take__submit-btn" disabled={submitting}>
                    {submitting ? 'Отправка...' : 'Отправить ответы'}
                </button>
            </form>
        </main>
    );
}

export default SurveyTake;
