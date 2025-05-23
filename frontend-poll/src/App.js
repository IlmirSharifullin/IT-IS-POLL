import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import SurveyList from './components/SurveyList';
import SurveyCreate from './components/SurveyCreate';
import SurveyTakeWrapper from './components/SurveyTakeWrapper';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<SurveyList />} />
        <Route path="/create" element={<SurveyCreate />} />
        <Route path="/survey/:surveyId" element={<SurveyTakeWrapper />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
