import React, {useContext} from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';

import Navbar from './components/Navbar';
import SurveyList from './components/SurveyList';
import SurveyCreate from './components/SurveyCreate';
import SurveyTakeWrapper from './components/SurveyTakeWrapper';
import Register from './components/Register';
import Login from './components/Login';
import NewsFeed from './components/NewsFeed';
import Profile from './components/Profile';  // Импортируем профиль

import {AuthProvider, AuthContext} from './context/AuthContext';

// Компонент для защиты приватных маршрутов
function PrivateRoute({children}) {
    const {user, loading} = useContext(AuthContext);

    if (loading) {
        return <div>Загрузка...</div>; // Можно заменить на спиннер
    }

    if (!user) {
        return <Navigate to="/login" replace/>;
    }

    return children;
}

function App() {
    return (
        <AuthProvider>
            <Navbar/>
            <Routes>
                <Route path="/news" element={<NewsFeed/>}/>
                <Route path="/" element={<SurveyList/>}/>
                <Route
                    path="/create"
                    element={
                        <PrivateRoute>
                            <SurveyCreate/>
                        </PrivateRoute>
                    }
                />
                <Route path="/survey/:surveyId" element={<SurveyTakeWrapper/>}/>
                <Route path="/profile" element={
                    <PrivateRoute>
                        <Profile/>
                    </PrivateRoute>
                }/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="*" element={<Navigate to="/" replace/>}/>
            </Routes>
        </AuthProvider>
    );
}

export default App;
