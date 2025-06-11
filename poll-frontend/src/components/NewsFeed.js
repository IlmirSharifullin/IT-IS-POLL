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

function Modal({children, onClose}) {
    useEffect(() => {
        function onKeyDown(e) {
            if (e.key === 'Escape') onClose();
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                {children}
            </div>
        </div>
    );
}

function NewsFeed() {
    const {user, token} = useContext(AuthContext);
    const [newsList, setNewsList] = useState([]);
    const [users, setUsers] = useState([]);
    const [tagsList, setTagsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commentTexts, setCommentTexts] = useState({});
    const [submittingComment, setSubmittingComment] = useState({});
    const [likes, setLikes] = useState({});
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newNewsData, setNewNewsData] = useState({
        title: '',
        text: '',
        image: '',
        tags: [],
    });
    const [creating, setCreating] = useState(false);

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

        async function fetchTags() {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/v1/tags/', {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!res.ok) throw new Error('Ошибка загрузки тегов');
                const data = await res.json();
                setTagsList(data);
            } catch {
                setTagsList([]);
            }
        }

        fetchUsers();
        fetchNews();
        fetchTags();
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

    const handleNewNewsChange = e => {
        const {name, value, options} = e.target;
        if (name === 'tags') {
            const selectedTags = Array.from(options)
                .filter(option => option.selected)
                .map(option => option.value);
            setNewNewsData(prev => ({...prev, tags: selectedTags}));
        } else {
            setNewNewsData(prev => ({...prev, [name]: value}));
        }
    };

    const handleCreateNews = async e => {
        e.preventDefault();
        if (!token) {
            alert('Требуется авторизация');
            return;
        }
        if (!newNewsData.title.trim() || !newNewsData.text.trim()) {
            alert('Заполните заголовок и текст новости');
            return;
        }
        setCreating(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/api/v1/news/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newNewsData),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'Ошибка при создании новости');
            }
            const createdNews = await res.json();
            setNewsList(prev => [createdNews, ...prev]);
            setShowCreateModal(false);
            setNewNewsData({title: '', text: '', image: '', tags: []});
        } catch (err) {
            alert(err.message);
        } finally {
            setCreating(false);
        }
    };

    if (loading) return <p>Загрузка новостей...</p>;
    if (error) return <p style={{color: 'red'}}>Ошибка: {error}</p>;

    return (
        <>
            <BackgroundShapes/>
            <main className="news-feed" style={{position: 'relative', zIndex: 1, padding: '20px'}}>
                <button
                    className="create-news-btn"
                    onClick={() => setShowCreateModal(true)}
                >
                    Создать новость
                </button>

                <h1>Новости</h1>


                {newsList.length === 0 && <p>Новостей пока нет.</p>}
                {newsList.map(news => (
                    <article key={news.id} className="news-item" aria-label={`Новость: ${news.title}`}>
                        <h2>{news.title}</h2>
                        <p className="text">{news.text}</p>
                        {news.image && <img src={news.image} alt={news.title} className="news-image"/>}
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
                                {likes[news.id]?.liked ? '❤️   ' : '🤍   '}
                                <span style={{color: '#d027b9', fontWeight: 700}}>{likes[news.id]?.count || 0}</span>
                            </button>

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

            {showCreateModal && (
                <Modal onClose={() => setShowCreateModal(false)}>
                    <div className="create-news-modal">
                        <h2>Создать новость</h2>
                        <form onSubmit={handleCreateNews}>
                            <div className="form-group">
                                <label htmlFor="title">Заголовок:</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={newNewsData.title}
                                    onChange={handleNewNewsChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="text">Текст:</label>
                                <textarea
                                    id="text"
                                    name="text"
                                    value={newNewsData.text}
                                    onChange={handleNewNewsChange}
                                    required
                                    rows={5}
                                />
                            </div>

                            <div>
                                <label htmlFor="image">Изображение:</label>
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    accept="image/*"

                                />

                            </div>


                            <div className="form-group">
                                <label htmlFor="tags">Теги:</label>
                                <select
                                    id="tags"
                                    name="tags"
                                    multiple
                                    value={newNewsData.tags}
                                    onChange={handleNewNewsChange}
                                    size={Math.min(tagsList.length, 5)}
                                >
                                    {tagsList.map(tag => (
                                        <option key={tag.id} value={tag.title}>
                                            {tag.title}
                                        </option>
                                    ))}
                                </select>
                                <small>Зажмите Ctrl для выбора нескольких тегов</small>
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={() => setShowCreateModal(false)}>Отмена</button>
                                <button type="submit" disabled={creating} className="submit-btn">
                                    {creating ? 'Создание...' : 'Создать'}
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}

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
        .news-header {
          text-align: center;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .create-news-btn {
          background-color: #6366F1;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .create-news-btn:hover {
          background-color: #4F46E5;
        }
        .news-image {
          max-width: 300px;
          height: auto;
          border-radius: 8px;
          margin: 10px 0;
        }
        .news-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 10px 0;
        }
        .news-tag {
          background-color: #6366F1;
          color: white;
          padding: 4px 10px;
          border-radius: 16px;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background-color: #232329;
          border-radius: 12px;
          padding: 24px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          font-size: 24px;
          color: #9CA3AF;
          cursor: pointer;
        }
        .create-news-modal h2 {
          margin-top: 0;
          margin-bottom: 20px;
          color: white;
          font-size: 1.5rem;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: white;
        }
        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #4B5563;
          background-color: #1F2937;
          color: white;
          font-size: 1rem;
        }
        .form-group small {
          display: block;
          margin-top: 4px;
          color: #9CA3AF;
          font-size: 0.8rem;
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }
        .form-actions button {
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
        }
        .form-actions button:first-child {
          background-color: transparent;
          border: 1px solid #4B5563;
          color: #E5E7EB;
        }
        .submit-btn {
          background-color: #6366F1;
          color: white;
          border: none;
        }
        .submit-btn:disabled {
          background-color: #4B5563;
          cursor: not-allowed;
        }
        .like-btn {
          background-color: transparent;
          border: 1px solid #6366F1;
          color: #6366F1;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .like-btn.liked {
          background-color: #6366F1;
          color: white;
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

    return (
        <div className="comments-container">
            {comments.length === 0 ? (
                <p>Комментариев пока нет.</p>
            ) : (
                <ul className="comments-list">
                    {comments.map(comment => (
                        <li key={comment.id} className="comment-item">
                            <div className="comment-author">{getAuthorName(comment.author)}</div>
                            <div className="comment-text">{comment.text}</div>
                        </li>
                    ))}
                </ul>
            )}

            <form onSubmit={handleSubmit} className="comment-form">
        <textarea
            value={commentTexts[newsId] || ''}
            onChange={e => onCommentChange(newsId, e.target.value)}
            rows={3}
            placeholder="Оставьте комментарий"
            required
            className="comment-input"
        />
                <button
                    type="submit"
                    disabled={submittingComment[newsId]}
                    className="comment-submit"
                >
                    {submittingComment[newsId] ? 'Отправка...' : 'Отправить'}
                </button>
            </form>

            <style jsx>{`
                .comments-container {
                    margin-top: 16px;
                }

                .comments-list {
                    list-style: none;
                    padding: 0;
                    margin: 0 0 16px 0;
                }

                .comment-item {
                    padding: 12px;
                    border-radius: 8px;
                    background-color: rgba(99, 102, 241, 0.1);
                    margin-bottom: 8px;
                }

                .comment-author {
                    font-weight: 600;
                    margin-bottom: 4px;
                    color: #6366F1;
                }

                .comment-text {
                    color: #E5E7EB;
                }

                .comment-form {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .comment-input {
                    width: 100%;
                    padding: 10px;
                    border-radius: 6px;
                    border: 1px solid #4B5563;
                    background-color: #1F2937;
                    color: white;
                    font-size: 1rem;
                    resize: vertical;
                }

                .comment-submit {
                    align-self: flex-end;
                    padding: 8px 16px;
                    background-color: #6366F1;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-weight: 500;
                    cursor: pointer;
                }

                .comment-submit:disabled {
                    background-color: #4B5563;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}

export default NewsFeed;
