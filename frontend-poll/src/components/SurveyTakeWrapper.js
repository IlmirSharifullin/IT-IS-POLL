import React from 'react';
import { useParams } from 'react-router-dom';
import SurveyTake from './SurveyTake';

const SurveyTakeWrapper = () => {
  const { surveyId } = useParams();
  return <SurveyTake surveyId={surveyId} />;
};

export default SurveyTakeWrapper;
