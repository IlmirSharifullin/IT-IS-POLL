import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUwMjU5NjQ2LCJpYXQiOjE3NDc1ODEyNDYsImp0aSI6Ijk3MGQyNzkxOTY1MTRmOWRhZjdiNzU4ZDllYWMyMWVhIiwidXNlcl9pZCI6MX0.p-JNeKgSq7umjB1lm3A30FaUzExTDCQ6HDYp0Hgi9FA';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    username: 'admin',
    password: 'admin',
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setError(null);

    try {
      // Вход — обычно на отдельный эндпоинт, например /api/v1/login/
      // Если у тебя другой URL — замени здесь
      const response = await fetch('http://127.0.0.1:8000/api/v1/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Токен обычно не нужен при логине, но если нужен, добавь:
          'Authorization': `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Ошибка при входе');
      }

      const data = await response.json();

      // Сохраняем токен, который вернул сервер, если есть
      const tokenFromServer = data.token || TOKEN;

      localStorage.setItem('token', tokenFromServer);

      alert('Вход выполнен успешно!');
      setFormData({ username: '', password: '' });

      if (onLogin) {
        onLogin(tokenFromServer);
      }

      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
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

          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

          <button className="auth__button" type="submit">Войти</button>
        </form>

        <div className="auth__divider">или</div>

        <div className="auth__social">
          <button className="auth__social-btn auth__social-btn--google" type="button">
            Войти через Google
          </button>
          <button className="auth__social-btn auth__social-btn--GitHub" type="button">
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
  );
}

export default Login;
