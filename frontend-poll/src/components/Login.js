import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
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
      const response = await fetch('http://localhost:8000/api/v1/login/', { // замени URL, если нужно
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Ошибка при входе');
      }

      // Предполагается, что сервер возвращает токен в поле data.token
      const tokenFromServer = data.token;
      if (!tokenFromServer) {
        throw new Error('Токен не получен от сервера');
      }

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
