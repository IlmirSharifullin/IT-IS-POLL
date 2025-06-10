import React, {useEffect, useState, useContext, useCallback} from 'react';
import {AuthContext} from '../context/AuthContext';
import '../styles/news_feed.css';

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

function NewsFeed() {
    const {user, token} = useContext(AuthContext);
    const [newsList, setNewsList] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commentTexts, setCommentTexts] = useState({});
    const [submittingComment, setSubmittingComment] = useState({});
    const [likes, setLikes] = useState({});

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/v1/users/', {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? {Authorization: `Bearer ${token}`} : {}),
                    },
                });
                if (!res.ok) throw new Error('Ошибка загрузки пользователей');
                const data = await res.json();
                setUsers(Array.isArray(data) ? data : (data.results || []));
            } catch {
                setUsers([]);
            }
        }

        async function fetchNews() {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/v1/news/', {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? {Authorization: `Bearer ${token}`} : {}),
                    },
                });
                if (!res.ok) throw new Error('Ошибка загрузки новостей');
                const data = await res.json();
                setNewsList(Array.isArray(data) ? data : (data.results || []));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
        fetchNews();
    }, [token]);

    useEffect(() => {
        if (!token || newsList.length === 0) return;

        async function fetchLikes() {
            try {
                const newLikes = {};
                for (const news of newsList) {
                    const res = await fetch(`http://127.0.0.1:8000/api/v1/news/${news.id}/reactions/`, {
                        headers: {Authorization: `Bearer ${token}`},
                    });
                    if (!res.ok) continue;
                    const data = await res.json();
                    const reactions = Array.isArray(data) ? data : (data.results || []);
                    const likeCount = reactions.filter(r => r.is_like).length;
                    const userLike = reactions.find(r => r.author === user.id && r.is_like);
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
    }, [newsList, token, user]);

    const handleLikeToggle = async newsId => {
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
                if (!res.ok) throw new Error('Ошибка при удалении лайка');

                setLikes(prevLikes => ({
                    ...prevLikes,
                    [newsId]: {
                        liked: false,
                        reactionId: null,
                        count: Math.max(0, (prevLikes[newsId]?.count || 1) - 1),
                    },
                }));
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
                const data = await res.json();

                setLikes(prevLikes => ({
                    ...prevLikes,
                    [newsId]: {
                        liked: true,
                        reactionId: data.id,
                        count: (prevLikes[newsId]?.count || 0) + 1,
                    },
                }));
            }
        } catch (err) {
            alert(err.message);
        }
    };

    const handleCommentChange = (newsId, text) => {
        setCommentTexts(prev => ({...prev, [newsId]: text}));
    };

    const addCommentToList = useCallback(
        (newsId, newComment) => {
            setNewsList(prevNewsList =>
                prevNewsList.map(news => {
                    if (news.id === newsId) {
                        const comments = news.comments ? [...news.comments, newComment] : [newComment];
                        return {...news, comments};
                    }
                    return news;
                })
            );
        },
        [setNewsList]
    );

    const getAuthorName = authorId => {
        const user = users.find(u => u.id === authorId);
        return user ? user.username : `Пользователь #${authorId}`;
    };

    if (loading) return <p>Загрузка новостей...</p>;
    if (error) return <p style={{color: 'red'}}>Ошибка: {error}</p>;

    return (
        <>
            <BackgroundShapes/>
            <main className="news-feed" style={{position: 'relative', zIndex: 1, padding: '20px'}}>
                <h1>Новости</h1>

                {newsList.length === 0 && <p>Новостей пока нет.</p>}
                {newsList.map(news => (
                    <article key={news.id} className="news-item" aria-label={`Новость: ${news.title}`}>
                        <h2>{news.title}</h2>
                        <p className="text">{news.text}</p>
                        {news.image && <img src={news.image} alt={news.title}/>}
                        {news.tags && news.tags.length > 0 && (
                            <div className="news-tags">
                                {news.tags.map((tag, index) => (
                                    <span key={index} className="news-tag">{tag}</span>
                                ))}
                            </div>
                        )}

                        <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 10}}>
                            <button
                                onClick={() => handleLikeToggle(news.id)}
                                aria-pressed={likes[news.id]?.liked || false}
                                className={`like-btn ${likes[news.id]?.liked ? 'liked' : ''}`}
                            >
                                {likes[news.id]?.liked ? '❤️ Лайк' : '🤍 Лайк'}
                            </button>
                            <span style={{color: '#6366F1', fontWeight: 700}}>{likes[news.id]?.count || 0} лайков</span>
                        </div>

                        <section className="comments-section" aria-label="Комментарии">
                            <h3>Комментарии</h3>
                            <Comments
                                newsId={news.id}
                                users={users}
                                getAuthorName={getAuthorName}
                                commentTexts={commentTexts}
                                onCommentChange={handleCommentChange}
                                submittingComment={submittingComment}
                                setSubmittingComment={setSubmittingComment}
                                addCommentToList={addCommentToList}
                                token={token}
                            />
                        </section>
                    </article>
                ))}
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
        .news-tags {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }
        .news-tag {
          background-color: var(--color-accent, #6366F1);
          color: var(--color-bg, #fff);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.8rem;
        }
      `}</style>
        </>
    );
}

function Comments({
                      newsId,
                      users,
                      getAuthorName,
                      commentTexts,
                      onCommentChange,
                      submittingComment,
                      setSubmittingComment,
                      addCommentToList,
                      token,
                  }) {
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(true);

    useEffect(() => {
        async function fetchComments() {
            setLoadingComments(true);
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/v1/news/${newsId}/comments/`);
                if (!res.ok) throw new Error('Ошибка загрузки комментариев');
                const data = await res.json();
                setComments(Array.isArray(data) ? data : (data.results || []));
            } catch {
                setComments([]);
            } finally {
                setLoadingComments(false);
            }
        }

        fetchComments();
    }, [newsId]);

    const handleSubmit = async e => {
        e.preventDefault();
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
                body: JSON.stringify({news: newsId, text}),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'Ошибка при отправке комментария');
            }
            const newComment = await res.json();
            setComments(prev => [...prev, newComment]);
            addCommentToList(newsId, newComment);
            onCommentChange(newsId, '');
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmittingComment(prev => ({...prev, [newsId]: false}));
        }
    };

    if (loadingComments) return <p>Загрузка комментариев...</p>;
    if (!comments.length) return (
        <>
            <p>Комментариев пока нет.</p>
            <form onSubmit={handleSubmit} className="comment-form">
        <textarea
            value={commentTexts[newsId] || ''}
            onChange={e => onCommentChange(newsId, e.target.value)}
            rows={3}
            placeholder="Оставьте комментарий"
            required
        />
                <button type="submit" disabled={submittingComment[newsId]}>
                    {submittingComment[newsId] ? 'Отправка...' : 'Отправить'}
                </button>
            </form>
        </>
    );

    return (
        <>
            <ul className="comments-list" aria-label="Список комментариев">
                {comments.map(comment => (
                    <li key={comment.id} aria-label={`Комментарий пользователя ${getAuthorName(comment.author)}`}>
                        <strong>{getAuthorName(comment.author)}:</strong> {comment.text}
                    </li>
                ))}
            </ul>
            <form onSubmit={handleSubmit} className="comment-form">
        <textarea
            value={commentTexts[newsId] || ''}
            onChange={e => onCommentChange(newsId, e.target.value)}
            rows={3}
            placeholder="Оставьте комментарий"
            required
        />
                <button type="submit" disabled={submittingComment[newsId]}>
                    {submittingComment[newsId] ? 'Отправка...' : 'Отправить'}
                </button>
            </form>
        </>
    );
}

export default NewsFeed;
