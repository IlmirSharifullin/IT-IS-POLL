import React, { useState } from 'react';
import '../styles/reg.css';

function Register() {
  const [formData, setFormData] = useState({
    username: 'admin',
    email: 'admin@mail.ru',
    password: 'admin',
    confirmPassword: 'admin',
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидация
    if (!formData.username.trim() || !formData.email.trim() || !formData.password) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          //'Authorization': `Bearer ${TOKEN}`, // Добавляем токен в заголовок
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Ошибка при регистрации');
      }

      alert('Регистрация прошла успешно!');
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

          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

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
  );
}

export default Register;
