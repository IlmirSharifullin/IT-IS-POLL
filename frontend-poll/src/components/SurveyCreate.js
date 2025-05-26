import React, { useState } from 'react';
import '../styles/survey_creation.css';

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUwMjU5NjQ2LCJpYXQiOjE3NDc1ODEyNDYsImp0aSI6Ijk3MGQyNzkxOTY1MTRmOWRhZjdiNzU4ZDllYWMyMWVhIiwidXNlcl9pZCI6MX0.p-JNeKgSq7umjB1lm3A30FaUzExTDCQ6HDYp0Hgi9FA';

function SurveyCreate() {
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [questions, setQuestions] = useState([{ text: '', type: 'radio', options: '' }]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '', type: 'radio', options: '' }]);
  };

  const handleRemoveQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx, field, value) => {
    setQuestions(questions.map((q, i) => (i === idx ? { ...q, [field]: value } : q)));
  };

  const validateForm = () => {
    if (!surveyTitle.trim()) {
      setError('Введите название опроса');
      return false;
    }
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) {
        setError(`Введите текст для вопроса №${i + 1}`);
        return false;
      }
      if (
        (questions[i].type === 'radio' || questions[i].type === 'checkbox') &&
        questions[i].options.split(',').map(o => o.trim()).filter(Boolean).length === 0
      ) {
        setError(`Введите варианты для вопроса №${i + 1}`);
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const questionsData = questions.map(q => ({
      question: q.text,
      type: q.type,
      options: q.type === 'text' ? [] : q.options.split(',').map(o => o.trim()).filter(Boolean),
    }));

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/polls/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
          title: surveyTitle,
          description: surveyDescription,
          questions: questionsData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка при создании опроса');
      }

      await response.json();
      alert('Опрос успешно создан!');
      setSurveyTitle('');
      setSurveyDescription('');
      setQuestions([{ text: '', type: 'radio', options: '' }]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="survey-create">
      <form className="survey-create__form" onSubmit={handleSubmit} noValidate>
        <h1 className="survey-create__title">Создать опрос</h1>

        <div className="survey-create__field">
          <label className="survey-create__label" htmlFor="surveyTitle">Название опроса</label>
          <input
            id="surveyTitle"
            type="text"
            className="survey-create__input"
            value={surveyTitle}
            onChange={e => setSurveyTitle(e.target.value)}
            required
          />
        </div>

        <div className="survey-create__field">
          <label className="survey-create__label" htmlFor="surveyDescription">Описание опроса</label>
          <textarea
            id="surveyDescription"
            className="survey-create__textarea"
            value={surveyDescription}
            onChange={e => setSurveyDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="survey-create__field">
          <label className="survey-create__label">Вопросы</label>
          <div className="survey-create__questions" aria-live="polite" aria-relevant="additions removals">
            {questions.map((q, idx) => (
              <div className="survey-create__question" key={idx}>
                <div className="survey-create__question-number">Вопрос {idx + 1}</div>

                <input
                  type="text"
                  className="survey-create__input survey-create__question-text"
                  placeholder="Введите текст вопроса"
                  value={q.text}
                  onChange={e => handleQuestionChange(idx, 'text', e.target.value)}
                  required
                />

                <label className="survey-create__label" htmlFor={`question-type-${idx}`}>Тип вопроса</label>
                <select
                  id={`question-type-${idx}`}
                  className="survey-create__input survey-create__select"
                  value={q.type}
                  onChange={e => handleQuestionChange(idx, 'type', e.target.value)}
                >
                  <option value="radio">Одиночный выбор</option>
                  <option value="checkbox">Множественный выбор</option>
                  <option value="text">Текстовый ответ</option>
                </select>

                {(q.type === 'radio' || q.type === 'checkbox') && (
                  <input
                    type="text"
                    className="survey-create__input survey-create__question-options"
                    placeholder="Варианты ответов через запятую"
                    value={q.options}
                    onChange={e => handleQuestionChange(idx, 'options', e.target.value)}
                    required
                  />
                )}

                <button
                  type="button"
                  className="survey-create__remove-btn"
                  aria-label="Удалить вопрос"
                  onClick={() => handleRemoveQuestion(idx)}
                  disabled={questions.length === 1}
                  style={{ opacity: questions.length === 1 ? 0.5 : 1 }}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="survey-create__add-question-btn"
            aria-label="Добавить вопрос"
            onClick={handleAddQuestion}
          >
            + Добавить вопрос
          </button>
        </div>

        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

        <button
          type="submit"
          className="survey-create__submit-btn"
          disabled={loading}
        >
          {loading ? 'Создаём...' : 'Создать опрос'}
        </button>
      </form>
      <div className="survey-create__preview">
        <div className="survey-create__preview-title">{surveyTitle || 'Название опроса'}</div>
        <div className="survey-create__preview-description">{surveyDescription || 'Описание опроса...'}</div>
        {questions.map((q, idx) => (
          <div className="survey-create__preview-question" key={idx}>
            <div className="survey-create__preview-question-title">{q.text || 'Текст вопроса...'}</div>
            {(q.type === 'radio' || q.type === 'checkbox') && (
              <ul className="survey-create__preview-options">
                {q.options.split(',').map((opt, i) =>
                  <li className="survey-create__preview-option" key={i}>{opt.trim() || 'Вариант'}</li>
                )}
              </ul>
            )}
            {q.type === 'text' && <div className="survey-create__preview-option" style={{opacity: 0.7}}>Текстовый ответ</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SurveyCreate;
