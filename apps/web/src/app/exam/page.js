"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from 'components/layouts/AppHeader';
import AppNav from 'components/layouts/AppNav';
import {
  checkAttemptQuestion,
  getQuizDetail,
  getQuizzes,
  startAttempt,
  submitAttempt,
} from 'lib/api';
import { useLang } from 'hooks/useLang';
import { logoutWithToken } from 'lib/auth';
import { TEXT } from 'lib/i18n';
import { getStoredAuth } from 'lib/session';

export default function ExamPage() {
  const optionLabels = ['A', 'B', 'C'];
  const router = useRouter();
  const { lang, setLang } = useLang('es');
  const [questionLang, setQuestionLang] = useState('es');
  const [examMode, setExamMode] = useState('review');
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [checkedMap, setCheckedMap] = useState({});
  const [reviewByQuestion, setReviewByQuestion] = useState({});
  const [result, setResult] = useState(null);

  const t = TEXT[lang];
  const currentQuestion = quiz?.questions?.[currentIndex] || null;
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const isExamInProgress = Boolean(quiz && currentQuestion && !result);

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth.token) {
      router.replace('/');
      return;
    }

    setToken(auth.token);
    setUser(auth.user);
  }, [router]);

  useEffect(() => {
    if (!token) {
      return;
    }

    loadQuizzes();
  }, [token, lang]);

  useEffect(() => {
    if (!quiz || !selectedQuizId) {
      return;
    }

    reloadQuizForQuestionLang();
  }, [questionLang]);

  useEffect(() => {
    if (!isExamInProgress) {
      return;
    }

    const onCopyLikeAction = (event) => {
      event.preventDefault();
    };

    const onKeyDown = (event) => {
      const key = String(event.key || '').toLowerCase();
      const withCommandKey = event.ctrlKey || event.metaKey;

      if (withCommandKey && (key === 'c' || key === 'p')) {
        event.preventDefault();
      }
    };

    document.addEventListener('copy', onCopyLikeAction);
    document.addEventListener('contextmenu', onCopyLikeAction);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('copy', onCopyLikeAction);
      document.removeEventListener('contextmenu', onCopyLikeAction);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isExamInProgress]);

  async function loadQuizzes() {
    try {
      const quizData = await getQuizzes(lang);
      setQuizzes(quizData);
      if (!selectedQuizId && quizData.length) {
        setSelectedQuizId(quizData[0].id);
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function onLogout() {
    await logoutWithToken(token);
    router.replace('/');
  }

  function onChangeLang(nextLang) {
    setLang(nextLang);
  }

  async function startExam() {
    if (!selectedQuizId || !token) {
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const started = await startAttempt(selectedQuizId, token);
      const detail = await getQuizDetail(selectedQuizId, questionLang);
      setAttemptId(started.attempt_id);
      setQuiz(detail);
      setCurrentIndex(0);
      setAnswers({});
      setCheckedMap({});
      setReviewByQuestion({});
      setResult(null);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function reloadQuizForQuestionLang() {
    try {
      const detail = await getQuizDetail(selectedQuizId, questionLang);
      setQuiz(detail);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function submitExam() {
    if (!attemptId || !token) {
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const payload = await submitAttempt(attemptId, answers, token, lang);
      const detailsMap = (payload.details || []).reduce((acc, item) => {
        acc[item.question_id] = item;
        return acc;
      }, {});

      setReviewByQuestion(detailsMap);

      setResult(payload);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function onCheckCurrentQuestion() {
    if (!attemptId || !token || !currentQuestion) {
      return;
    }

    const selectedAnswerId = answers[currentQuestion.id];
    if (!selectedAnswerId) {
      setMessage(t.noSelection);
      return;
    }

    try {
      const checked = await checkAttemptQuestion(
        attemptId,
        currentQuestion.id,
        selectedAnswerId,
        token
      );

      setCheckedMap((prev) => ({
        ...prev,
        [currentQuestion.id]: checked,
      }));
    } catch (error) {
      setMessage(error.message);
    }
  }

  function getAnswerText(question, answerId) {
    if (!answerId) {
      return t.noSelection;
    }

    const found = (question.answers || []).find((item) => Number(item.id) === Number(answerId));
    return found ? found.answer_text : t.noSelection;
  }

  const reviewItems = useMemo(() => {
    if (!quiz?.questions?.length) {
      return [];
    }

    return [...quiz.questions].sort((a, b) => {
      const aDetail = reviewByQuestion[a.id] || {};
      const bDetail = reviewByQuestion[b.id] || {};
      const aWrong = aDetail.is_correct === false ? 0 : 1;
      const bWrong = bDetail.is_correct === false ? 0 : 1;

      if (aWrong !== bWrong) {
        return aWrong - bWrong;
      }

      return Number(a.order_number) - Number(b.order_number);
    });
  }, [quiz, reviewByQuestion]);

  return (
    <main className={isExamInProgress ? 'dgt-page exam-guard' : 'dgt-page'}>
      <AppHeader t={t} lang={lang} onChangeLang={onChangeLang} user={user} />
      <AppNav t={t} onLogout={onLogout} user={user} />

      {!quiz && (
        <section className="panel exam-picker">
          <h2>{t.examPicker}</h2>
          <label style={{ marginTop: 10 }}>
            {t.examMode}
            <select value={examMode} onChange={(e) => setExamMode(e.target.value)}>
              <option value="instant">{t.modeInstant}</option>
              <option value="review">{t.modeReview}</option>
            </select>
          </label>
          <div className="grid quiz-list">
            {quizzes.map((item) => (
              <button
                key={item.id}
                className={selectedQuizId === item.id ? 'quiz-card selected' : 'quiz-card'}
                onClick={() => setSelectedQuizId(item.id)}
              >
                <h3>{item.title}</h3>
                <p className="meta">{item.description || '...'}</p>
              </button>
            ))}
          </div>
          <div className="actions-row">
            <button className="btn-start" onClick={startExam} disabled={loading || !selectedQuizId}>
              {t.startExam}
            </button>
          </div>
        </section>
      )}

      {quiz && currentQuestion && (
        <section className="panel exam-shell">
          <header className="exam-header">
            <div>
              <h2>{quiz.title}</h2>
              <p className="meta">
                {t.answered}: {answeredCount}/{quiz.questions.length}
              </p>
            </div>
            <div>
              <p className="meta" style={{ marginBottom: 8 }}>{t.questionLanguage}</p>
              <div className="lang-switch" style={{ marginBottom: 8 }}>
                <button
                  className={questionLang === 'vi' ? 'chip active' : 'chip'}
                  onClick={() => setQuestionLang('vi')}
                >
                  VI
                </button>
                <button
                  className={questionLang === 'es' ? 'chip active' : 'chip'}
                  onClick={() => setQuestionLang('es')}
                >
                  ES
                </button>
              </div>
              <div className="counter-pill">
                {t.question} {currentIndex + 1}/{quiz.questions.length}
              </div>
            </div>
          </header>

          <div className="exam-grid">
            <aside className="media-pane">
              {currentQuestion.image_url ? (
                <img src={currentQuestion.image_url} alt="question" className="question-image" />
              ) : (
                <div className="image-placeholder">No image</div>
              )}
            </aside>

            <article className="question-pane">
              <h3>
                {t.question} {currentQuestion.order_number}. {currentQuestion.question_text}
              </h3>

              <div>
                {currentQuestion.answers.slice(0, 3).map((answer, index) => (
                  <label
                    key={answer.id}
                    className={
                      answers[currentQuestion.id] === answer.id ? 'answer active' : 'answer'
                    }
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      checked={answers[currentQuestion.id] === answer.id}
                      disabled={examMode === 'instant' && !!checkedMap[currentQuestion.id]}
                      onChange={() => setAnswers({ ...answers, [currentQuestion.id]: answer.id })}
                    />
                    <strong>{optionLabels[index]}. </strong>{answer.answer_text}
                  </label>
                ))}
              </div>

              {examMode === 'instant' && (
                <div className="panel" style={{ marginTop: 10 }}>
                  {!checkedMap[currentQuestion.id] ? (
                    <>
                      <p className="meta">{t.notCheckedYet}</p>
                      <button className="secondary" onClick={onCheckCurrentQuestion}>{t.checkAnswer}</button>
                    </>
                  ) : (
                    <>
                      <p className={checkedMap[currentQuestion.id].is_correct ? 'badge-ok' : 'badge-wrong'}>
                        {checkedMap[currentQuestion.id].is_correct ? t.correctBadge : t.wrongBadge}
                      </p>
                      <p className="meta">
                        {t.yourAnswer}: {getAnswerText(currentQuestion, checkedMap[currentQuestion.id].selected_answer_id)}
                      </p>
                      <p className="meta">
                        {t.correctAnswerLabel}: {getAnswerText(currentQuestion, checkedMap[currentQuestion.id].correct_answer_id)}
                      </p>
                      <p className="meta">
                        {t.explanationLabel}: {currentQuestion.explanation || '...'}
                      </p>
                    </>
                  )}
                </div>
              )}

              <div className="dgt-nav">
                <button
                  className="dgt-btn prev"
                  onClick={() => setCurrentIndex((v) => Math.max(v - 1, 0))}
                  disabled={currentIndex === 0}
                >
                  {t.previous}
                </button>
                <button
                  className="dgt-btn next"
                  onClick={() => setCurrentIndex((v) => Math.min(v + 1, quiz.questions.length - 1))}
                  disabled={currentIndex === quiz.questions.length - 1}
                >
                  {t.next}
                </button>
                <button className="dgt-btn finish" onClick={submitExam} disabled={loading}>
                  {t.finish}
                </button>
              </div>
            </article>
          </div>

          <div className="question-tracker">
            {quiz.questions.map((q, index) => (
              <button
                key={q.id}
                className={`tracker-item ${index === currentIndex ? 'active' : ''} ${answers[q.id] ? 'answered' : ''}`}
                onClick={() => setCurrentIndex(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </section>
      )}

      {result && (
        <section className="panel result-panel">
          <h2>{t.result}</h2>
          <p>
            {t.score}: <strong>{result.score}</strong> / {result.total_points}
          </p>
          <p>
            {t.correct}: <strong>{result.correct_count}</strong> / {result.total_questions}
          </p>
          <p>
            {t.total}: <strong>{result.percentage}%</strong>
          </p>

          {examMode === 'review' && reviewItems.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <h3>{t.reviewAnswers}</h3>
              {reviewItems.map((question) => {
                const detail = reviewByQuestion[question.id] || {};
                return (
                  <div key={question.id} className="history-item" style={{ marginTop: 8 }}>
                    <p className={detail.is_correct ? 'badge-ok' : 'badge-wrong'}>
                      {detail.is_correct ? t.correctBadge : t.wrongBadge}
                    </p>
                    <strong>
                      {t.question} {question.order_number}. {question.question_text}
                    </strong>
                    <p className="meta">
                      {t.yourAnswer}: {getAnswerText(question, detail.selected_answer_id)}
                    </p>
                    <p className="meta">
                      {t.correctAnswerLabel}: {getAnswerText(question, detail.correct_answer_id)}
                    </p>
                    <p className="meta">
                      {t.explanationLabel}: {question.explanation || '...'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <button
            className="secondary"
            onClick={() => {
              setQuiz(null);
              setAttemptId(null);
              setAnswers({});
              setCheckedMap({});
              setReviewByQuestion({});
              setResult(null);
            }}
          >
            {t.menuExam}
          </button>
        </section>
      )}

      {!!message && <p className="panel meta error-msg">{message}</p>}
    </main>
  );
}
