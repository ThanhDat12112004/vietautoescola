import { apiFetch } from "./client";

export function getQuizzes(lang) {
  return apiFetch(`/api/quizzes?lang=${lang}`, { lang });
}

export function getQuizDetail(quizId, lang) {
  return apiFetch(`/api/quizzes/${quizId}?lang=${lang}`, { lang });
}

export function startAttempt(quizId, token) {
  return apiFetch("/api/attempts/start", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ quiz_id: Number(quizId) })
  });
}

export function submitAttempt(attemptId, answers, token, lang) {
  return apiFetch(`/api/attempts/${attemptId}/submit`, {
    method: "POST",
    lang,
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ answers })
  });
}

export function checkAttemptQuestion(attemptId, questionId, answerId, token) {
  return apiFetch(`/api/attempts/${attemptId}/check-question`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      question_id: Number(questionId),
      answer_id: Number(answerId)
    })
  });
}

export function createManualQuiz(payload, token, lang) {
  return apiFetch("/api/quizzes", {
    method: "POST",
    lang,
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}
