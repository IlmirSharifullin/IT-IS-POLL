import React, {useEffect, useState, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {AuthContext} from '../context/AuthContext';
import '../styles/survey_list.css';

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
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!usersRes.ok) throw new Error('Ошибка загрузки пользователей');
                const usersData = await usersRes.json();

                const surveysRes = await fetch('http://127.0.0.1:8000/api/v1/polls/', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!surveysRes.ok) throw new Error('Ошибка загрузки опросов');
                const surveysData = await surveysRes.json();

                setUsers(usersData.results || []);
                setSurveys(surveysData.results || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [token]);

    const getUsernameById = (id) => {
        const user = users.find(u => u.id === id);
        return user ? user.username : `id${id}`;
    };

    if (loading) return <p>Загрузка опросов...</p>;
    if (error) return <p style={{color: 'red'}}>Ошибка: {error}</p>;
    if (surveys.length === 0) return <p>Опросы не найдены.</p>;

    return (
        <main className="survey-list" role="main" aria-label="Список опросов" style={{padding: '20px'}}>
            <h1 className="survey-list__title">Доступные опросы</h1>
            <ul className="survey-list__items">
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
                    >
                        <h2 className="survey-list__item-title">{survey.title}</h2>
                        <p className="survey-list__item-description">{survey.description}</p>
                        <div className="survey-list__meta">
                            <span className="survey-list__author">Автор: {getUsernameById(survey.author_id)}</span>
                            <span className="survey-list__date">Создан: {formatDate(survey.created_at)}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </main>
    );
}

export default SurveyList;
