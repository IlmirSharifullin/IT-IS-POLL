import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import '../styles/SurveyList.css';

function SurveyList() {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchSurveys() {
            try {
                const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUwMjU5NjQ2LCJpYXQiOjE3NDc1ODEyNDYsImp0aSI6Ijk3MGQyNzkxOTY1MTRmOWRhZjdiNzU4ZDllYWMyMWVhIiwidXNlcl9pZCI6MX0.p-JNeKgSq7umjB1lm3A30FaUzExTDCQ6HDYp0Hgi9FA";
                if (!token) {
                    throw new Error('Пользователь не авторизован');
                }

                const response = await fetch('http://127.0.0.1:8000/api/v1/polls/', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Ошибка загрузки списка опросов');
                }

                const data = await response.json();
                setSurveys(data.results || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchSurveys();
    }, []);

    if (loading) return <p>Загрузка опросов...</p>;
    if (error) return <p style={{color: 'red'}}>Ошибка: {error}</p>;
    if (surveys.length === 0) return <p>Опросы не найдены.</p>;

    return (
        <main className="survey-list" role="main" aria-label="Список опросов" style={{padding: '20px'}}>
            <h1 className="survey-list__title">Доступные опросы</h1>

            <div style={{marginBottom: '20px'}}>
                <button
                    onClick={() => navigate('/create')}
                    style={{marginRight: '10px', padding: '10px 15px', cursor: 'pointer'}}
                >
                    Создать новый опрос
                </button>
            </div>

            <ul className="survey-list__items" style={{listStyle: 'none', padding: 0}}>
                {surveys.map((survey) => (
                    <li
                        key={survey.id}
                        className="survey-list__item"
                        tabIndex={0}
                        role="button"
                        onClick={() => navigate(`/survey/${survey.id}`)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') navigate(`/survey/${survey.id}`);
                        }}
                        style={{
                            padding: '20px',
                            borderBottom: '1px solid #393942',
                            cursor: 'pointer',
                            color: '#fff',
                            backgroundColor: '#232329',
                            marginBottom: '8px',
                            borderRadius: '8px',
                        }}
                    >
                        <h2 style={{margin: '0 0 8px 0'}}>{survey.title}</h2>
                        <p style={{margin: 0, opacity: 0.85}}>{survey.description}</p>
                    </li>
                ))}
            </ul>
        </main>
    );
}

export default SurveyList;
