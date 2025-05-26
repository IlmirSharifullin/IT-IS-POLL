import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import SurveyList from './components/SurveyList';
import SurveyCreate from './components/SurveyCreate';
import SurveyTakeWrapper from './components/SurveyTakeWrapper';
import Register from './components/Register';  // импорт страницы регистрации
import Login from './components/Login';        // импорт страницы входа (создай этот компонент)

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<SurveyList />} />
        <Route path="/create" element={<SurveyCreate />} />
        <Route path="/survey/:surveyId" element={<SurveyTakeWrapper />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
