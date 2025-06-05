import React, {useState, useEffect, useRef} from 'react';
import '../styles/reg.css';

const NUM_SHAPES = 5;

function BackgroundShapes() {
    const [shapes, setShapes] = useState([]);

    // Инициализация фигур
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
                speedX: 0.02 + Math.random() * 0.03, // медленная скорость
                speedY: 0.01 + Math.random() * 0.02, // медленная скорость
                blur: 80 + Math.random() * 40,
                color: i % 2 === 0 ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 36, 36, 0.3)',
            });
        }
        setShapes(initialShapes);
    }, []);

    // Анимация движения фигур
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
                        directionY: shape.directionY
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

function Register() {
    const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUwMjU5NjQ2LCJpYXQiOjE3NDc1ODEyNDYsImp0aSI6Ijk3MGQyNzkxOTY1MTRmOWRhZjdiNzU4ZDllYWMyMWVhIiwidXNlcl9pZCI6MX0.p-JNeKgSq7umjB1lm3A30FaUzExTDCQ6HDYp0Hgi9FA';

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username.trim() || !formData.email.trim() || !formData.password) {
            setError('Пожалуйста, заполните все обязательные поля');
            setSuccess(null);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают');
            setSuccess(null);
            return;
        }

        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('http://localhost:8000/api/v1/users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TOKEN}`,
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || JSON.stringify(data));
            }

            setSuccess('Регистрация прошла успешно!');
            setFormData({
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
            });
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <BackgroundShapes/>
            <div className="auth-wrapper">
                <div className="auth">
                    <div className="auth__container">
                        <h1 className="auth__title">Регистрация</h1>
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
                                />
                            </div>
                            <div className="auth__field">
                                <label className="auth__label" htmlFor="email">Email</label>
                                <input
                                    className="auth__input"
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Введите email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
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
                                />
                            </div>
                            <div className="auth__field">
                                <label className="auth__label" htmlFor="confirmPassword">Подтвердите пароль</label>
                                <input
                                    className="auth__input"
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Подтвердите пароль"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>

                            {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
                            {success && <div style={{color: 'green', marginBottom: '10px'}}>{success}</div>}

                            <button className="auth__button" type="submit">Зарегистрироваться</button>
                        </form>

                        <div className="auth__divider">или</div>

                        <div className="auth__social">
                            <button className="auth__social-btn auth__social-btn--google" type="button">
                                Зарегистрироваться через Google
                            </button>
                            <button className="auth__social-btn auth__social-btn--GitHub" type="button">
                                Зарегистрироваться через GitHub
                            </button>
                        </div>
                    </div>

                    <div className="auth__side">
                        <div className="auth__side-content">
                            <p className="auth__side-text">
                                Присоединяйтесь к нам - создавайте и проходите опросы легко!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Register;
