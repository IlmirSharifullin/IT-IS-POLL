import React, {useEffect, useState, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import '../styles/news_feed.css';
import {AuthContext} from '../context/AuthContext';

function NewsFeed() {
    const {user, token} = useContext(AuthContext);
    const [newsList, setNewsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commentTexts, setCommentTexts] = useState({});
    const [submittingComment, setSubmittingComment] = useState({});
    const [likes, setLikes] = useState({});
    const [refreshFlag, setRefreshFlag] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchNews() {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/v1/news/', {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? {Authorization: `Bearer ${token}`} : {}),
                    },
                });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.detail || 'Ошибка загрузки новостей');
                }
                const data = await res.json();
                setNewsList(data.results || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchNews();
    }, [token, refreshFlag]);

    useEffect(() => {
        if (!token) return;

        async function fetchLikes() {
            try {
                const newLikes = {};
                for (const news of newsList) {
                    const res = await fetch(`http://127.0.0.1:8000/api/v1/news/${news.id}/reactions/`, {
                        headers: {Authorization: `Bearer ${token}`},
                    });
                    if (!res.ok) continue;
                    const data = await res.json();
                    const likeCount = data.results.filter(r => r.is_like).length;
                    const userLike = data.results.find(r => r.author === user.id && r.is_like);
                    if (userLike) {
                        newLikes[news.id] = {liked: true, reactionId: userLike.id, count: likeCount};
                    } else {
                        newLikes[news.id] = {liked: false, reactionId: null, count: likeCount};
                    }
                }
                setLikes(newLikes);
            } catch {
                // Игнорируем ошибки
            }
        }

        fetchLikes();
    }, [newsList, token, user, refreshFlag]);

    const handleLikeToggle = async (newsId) => {
        if (!token) {
            alert('Только авторизованные пользователи могут ставить лайки');
            return;
        }
        const likeInfo = likes[newsId] || {liked: false, reactionId: null, count: 0};

        try {
            if (likeInfo.liked && likeInfo.reactionId) {
                const res = await fetch(`http://127.0.0.1:8000/api/v1/news/${newsId}/reactions/${likeInfo.reactionId}/`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) {
                    throw new Error('Ошибка при удалении лайка');
                }
                setRefreshFlag(f => !f);
            } else {
                const res = await fetch(`http://127.0.0.1:8000/api/v1/news/${newsId}/reactions/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({is_like: true}),
                });
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.detail || 'Ошибка при постановке лайка');
                }
                setRefreshFlag(f => !f);
            }
        } catch (err) {
            alert(err.message);
        }
    };

    const handleCommentChange = (newsId, text) => {
        setCommentTexts(prev => ({...prev, [newsId]: text}));
    };

    const handleCommentSubmit = async (newsId) => {
        if (!token) {
            alert('Только авторизованные пользователи могут оставлять комментарии');
            return;
        }
        const text = commentTexts[newsId];
        if (!text || text.trim() === '') {
            alert('Введите текст комментария');
            return;
        }
        setSubmittingComment(prev => ({...prev, [newsId]: true}));
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/v1/news/${newsId}/comments/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({text}),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'Ошибка при отправке комментария');
            }
            setCommentTexts(prev => ({...prev, [newsId]: ''}));
            setRefreshFlag(f => !f);
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmittingComment(prev => ({...prev, [newsId]: false}));
        }
    };

    // Кнопка создания новости только для админов
    const isAdmin = user && user.is_superuser;

    if (loading) return <p>Загрузка новостей...</p>;
    if (error) return <p style={{color: 'red'}}>Ошибка: {error}</p>;

    return (
        <main className="news-feed">
            <h1>Новости</h1>

            {isAdmin && (
                <button
                    className="create-news-btn"
                    onClick={() => navigate('/create-news')}
                    style={{
                        marginBottom: 24,
                        padding: '12px 24px',
                        borderRadius: 8,
                        background: '#6366F1',
                        color: '#fff',
                        border: 'none',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        cursor: 'pointer'
                    }}
                >
                    + Создать новость
                </button>
            )}

            {newsList.length === 0 && <p>Новостей пока нет.</p>}

            {newsList.map(news => (
                <article key={news.id} className="news-item" aria-label={`Новость: ${news.title}`}>
                    <h2>{news.title}</h2>
                    <p className="text">{news.text}</p>
                    {news.image && <img src={news.image} alt={news.title}/>}

                    <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 10}}>
                        <button
                            onClick={() => handleLikeToggle(news.id)}
                            aria-pressed={likes[news.id]?.liked || false}
                            className={`like-btn ${likes[news.id]?.liked ? 'liked' : ''}`}
                        >
                            {likes[news.id]?.liked ? '❤️ Лайк' : '🤍 Лайк'}
                        </button>
                        <span style={{color: '#6366F1', fontWeight: 700}}>
                            {likes[news.id]?.count || 0} лайков
                        </span>
                    </div>

                    <section className="comments-section" aria-label="Комментарии">
                        <h3>Комментарии</h3>
                        <Comments newsId={news.id} refreshFlag={refreshFlag}/>

                        <form
                            onSubmit={e => {
                                e.preventDefault();
                                handleCommentSubmit(news.id);
                            }}
                            className="comment-form"
                        >
                            <textarea
                                value={commentTexts[news.id] || ''}
                                onChange={e => handleCommentChange(news.id, e.target.value)}
                                rows={3}
                                placeholder="Оставьте комментарий"
                                required
                            />
                            <button type="submit" disabled={submittingComment[news.id]}>
                                {submittingComment[news.id] ? 'Отправка...' : 'Отправить'}
                            </button>
                        </form>
                    </section>
                </article>
            ))}
        </main>
    );
}

// Компонент комментариев для одной новости
function Comments({newsId, refreshFlag}) {
    const [comments, setComments] = React.useState([]);
    const [loadingComments, setLoadingComments] = React.useState(true);

    React.useEffect(() => {
        async function fetchComments() {
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/v1/news/${newsId}/comments/`);
                if (!res.ok) throw new Error('Ошибка загрузки комментариев');
                const data = await res.json();
                setComments(Array.isArray(data.results) ? data.results : []);
            } catch (e) {
                setComments([]);
            } finally {
                setLoadingComments(false);
            }
        }

        fetchComments();
    }, [newsId, refreshFlag]);

    if (loadingComments) return <p>Загрузка комментариев...</p>;
    if (!comments || comments.length === 0) return <p>Комментариев пока нет.</p>;

    return (
        <ul className="comments-list" aria-label="Список комментариев">
            {comments.map(comment => (
                <li key={comment.id} aria-label={`Комментарий пользователя ${comment.author}`}>
                    <strong>Пользователь #{comment.author}:</strong> {comment.text}
                </li>
            ))}
        </ul>
    );
}

export default NewsFeed;
