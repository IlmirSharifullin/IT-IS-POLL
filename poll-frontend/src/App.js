import React from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import Navbar from './components/Navbar';
import SurveyList from './components/SurveyList';
import SurveyCreate from './components/SurveyCreate';
import SurveyTakeWrapper from './components/SurveyTakeWrapper';
import SurveyDetail from './components/SurveyDetail';
import Profile from './components/Profile';
import Register from './components/Register';
import Login from './components/Login';
import NewsFeed from './components/NewsFeed';
import PrivateRoute from './components/PrivateRoute';

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
                <Route 
                    path="/survey/:pollId/details" 
                    element={
                        <PrivateRoute>
                            <SurveyDetail/>
                        </PrivateRoute>
                    }
                />
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
