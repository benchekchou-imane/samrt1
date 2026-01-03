import { useState } from 'react';
import { quizService } from '../services/quizService';

function useQuiz() {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateQuiz = async (sessionId, options = {}) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await quizService.generateQuiz(sessionId, options);
      
      if (response.ok) {
        setQuiz(response.quiz);
      } else {
        throw new Error(response.error || 'Erreur lors de la génération du quiz');
      }
    } catch (err) {
      setError(err.message);
      console.error('Quiz generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkAnswers = (userAnswers) => {
    if (!quiz || !quiz.questions) return { score: 0, results: [] };

    let score = 0;
    const results = quiz.questions.map((question, idx) => {
      const userAnswer = userAnswers[idx];
      const isCorrect = userAnswer === question.correct;
      if (isCorrect) score++;
      
      return {
        question: question.question,
        userAnswer: question.options[userAnswer],
        correctAnswer: question.options[question.correct],
        isCorrect
      };
    });

    return { score, total: quiz.questions.length, results };
  };

  const resetQuiz = () => {
    setQuiz(null);
    setError('');
  };

  return {
    quiz,
    loading,
    error,
    generateQuiz,
    checkAnswers,
    resetQuiz
  };
}

export default useQuiz;
