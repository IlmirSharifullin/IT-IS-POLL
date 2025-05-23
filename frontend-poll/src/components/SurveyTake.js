import React, { useEffect, useState } from 'react';
import '../styles/take-survey.css';

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUwMjU5NjQ2LCJpYXQiOjE3NDc1ODEyNDYsImp0aSI6Ijk3MGQyNzkxOTY1MTRmOWRhZjdiNzU4ZDllYWMyMWVhIiwidXNlcl9pZCI6MX0.p-JNeKgSq7umjB1lm3A30FaUzExTDCQ6HDYp0Hgi9FA';

function SurveyTake({ surveyId }) {
  const [surveyData, setSurveyData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchSurvey() {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/polls/${surveyId}/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`,
          },
        });
        if (!response.ok) throw new Error('Ошибка загрузки опроса');
        const data = await response.json();
        setSurveyData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSurvey();
  }, [surveyId]);

  const handleChange = (questionIndex, value, checked, type) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };

      if (type === 'checkbox') {
        const prevValues = newAnswers[questionIndex] || [];
        if (checked) {
          newAnswers[questionIndex] = [...prevValues, value];
        } else {
          newAnswers[questionIndex] = prevValues.filter(v => v !== value);
        }
      } else {
        newAnswers[questionIndex] = value;
      }
      return newAnswers;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!surveyData) return;

    for (let i = 0; i < surveyData.questions.length; i++) {
      const q = surveyData.questions[i];
      const ans = answers[i];
      if (q.type === 'checkbox') {
        if (!ans || ans.length === 0) {
          alert(`Пожалуйста, ответьте на вопрос №${i + 1}`);
          return;
        }
      } else {
        if (!ans || ans.toString().trim() === '') {
          alert(`Пожалуйста, ответьте на вопрос №${i + 1}`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/polls/submit/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
          survey_id: surveyId,
          answers: answers,
        }),
      });
      if (!response.ok) throw new Error('Ошибка при отправке ответов');
      alert('Спасибо за участие в опросе!');
      setAnswers({});
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Загрузка опроса...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!surveyData) return null;

  return (
    <main className="survey-take" role="main" aria-label="Прохождение опроса">
      <h1 className="survey-take__title">{surveyData.title}</h1>
      <p className="survey-take__description">{surveyData.description}</p>

      <form className="survey-take__form" onSubmit={handleSubmit} noValidate>
        {surveyData.questions.map((q, idx) => (
          <div key={idx} className="survey-take__question">
            <label className="survey-take__question-label">{q.question}</label>

            {q.type === 'text' ? (
              <input
                type="text"
                className="survey-take__text-input"
                value={answers[idx] || ''}
                onChange={e => handleChange(idx, e.target.value, null, 'text')}
                required
              />
            ) : (
              <div className="survey-take__options">
                {q.options.map((option, i) => {
                  const inputId = `q${idx}_option${i}`;
                  return (
                    <label key={i} className="survey-take__option-label" htmlFor={inputId}>
                      <input
                        type={q.type}
                        id={inputId}
                        name={`question_${idx}${q.type === 'checkbox' ? '[]' : ''}`}
                        value={option}
                        checked={
                          q.type === 'checkbox'
                            ? (answers[idx] || []).includes(option)
                            : answers[idx] === option
                        }
                        onChange={e => handleChange(idx, option, e.target.checked, q.type)}
                        className="survey-take__option-input"
                        required={q.type === 'radio'}
                      />
                      {option}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        <button type="submit" className="survey-take__submit-btn" disabled={submitting}>
          {submitting ? 'Отправка...' : 'Отправить ответы'}
        </button>
      </form>
    </main>
  );
}

export default SurveyTake;
