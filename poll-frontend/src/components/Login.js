import React, {useState, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {AuthContext} from '../context/AuthContext';
import '../styles/auth.css';

const NUM_SHAPES = 5;

function BackgroundShapes() {
    const [shapes, setShapes] = React.useState([]);

    React.useEffect(() => {
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

    React.useEffect(() => {
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
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                zIndex: 0,
                pointerEvents: 'none',
                background: 'var(--color-bg, #18181B)',
            }}
        >
            {shapes.map(shape => (
                <div
                    key={shape.id}
                    style={{
                        position: 'absolute',
                        width: shape.size,
                        height: shape.size,
                        top: `${shape.top}%`,
                        left: `${shape.left}%`,
                        background: `radial-gradient(circle at center, ${shape.color}, transparent 70%)`,
                        borderRadius: '50%',
                        filter: `blur(${shape.blur}px)`,
                        transform: 'translate(-50%, -50%)',
                        transition: 'background 0.3s',
                    }}
                />
            ))}
        </div>
    );
}

function Login() {
    const {login} = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = e => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Здесь вызываем функцию login из контекста, которая должна быть реализована с проверкой JSON
            await login(formData.username, formData.password);
            setLoading(false);
            navigate('/');
        } catch (err) {
            setLoading(false);
            setError(err.message);
        }
    };

    return (
        <>
            <BackgroundShapes/>
            <div className="auth-wrapper">
                <div className="auth">
                    <div className="auth__container">
                        <h1 className="auth__title">Вход</h1>
                        <form className="auth__form" onSubmit={handleSubmit} noValidate>
                            <div className="auth__field">
                                <label className="auth__label" htmlFor="username">Логин</label>
                                <input
                                    className="auth__input"
                                    type="text"
                                    id="username"
                                    name="username"
                                    placeholder="Введите логин"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                            <div className="auth__field">
                                <label className="auth__label" htmlFor="password">Пароль</label>
                                <input
                                    className="auth__input"
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Введите пароль"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}

                            <button className="auth__button" type="submit" disabled={loading}>
                                {loading ? 'Вход...' : 'Войти'}
                            </button>
                        </form>

                        <div className="auth__divider">или</div>

                        <div className="auth__social">
                            <button className="auth__social-btn auth__social-btn--google" type="button"
                                    disabled={loading}>
                                Войти через Google
                            </button>
                            <button className="auth__social-btn auth__social-btn--GitHub" type="button"
                                    disabled={loading}>
                                Войти через GitHub
                            </button>
                        </div>
                    </div>

                    <div className="auth__side">
                        <div className="auth__side-content">
                            <p className="auth__side-text">
                                Отличные опросы ждут вас - войдите сейчас!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;
