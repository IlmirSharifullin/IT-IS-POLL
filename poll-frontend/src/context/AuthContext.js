import React, {createContext, useState, useEffect} from 'react';

export const AuthContext = createContext();

export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch('http://127.0.0.1:8000/api/v1/users/me/', {
                    headers: {Authorization: `Bearer ${token}`},
                });
                if (!res.ok) throw new Error('Не авторизован');
                const data = await res.json();
                console.log('User data from server:', data);
                setUser(data);
            } catch (err) {
                console.error('Error fetching user:', err);
                setUser(null);
                setToken(null);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, [token]);

    const login = async (username, password) => {
        const res = await fetch('http://127.0.0.1:8000/api/v1/jwt/create/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password}),
        });

        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error('Сервер вернул некорректный ответ');
        }

        if (!res.ok) {
            throw new Error(data.detail || 'Ошибка входа');
        }

        if (!data.access) {
            throw new Error('Токен не получен от сервера');
        }

        setToken(data.access);
        localStorage.setItem('token', data.access);

        // Получаем данные пользователя сразу после логина
        const userRes = await fetch('http://127.0.0.1:8000/api/v1/users/me/', {
            headers: {Authorization: `Bearer ${data.access}`},
        });
        if (!userRes.ok) throw new Error('Не удалось получить данные пользователя');
        const userData = await userRes.json();
        console.log('User data after login:', userData);
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{user, token, login, logout, loading}}>
            {children}
        </AuthContext.Provider>
    );
}
