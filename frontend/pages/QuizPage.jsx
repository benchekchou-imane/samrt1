import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { quizService } from '../services/quizService';
import { summaryService } from '../services/summaryService';
import { transcriptionService } from '../services/transcriptionService';
import { authService } from '../services/authService';
import './QuizPage.css';

function QuizPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  
  // États pour la session
  const [session, setSession] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [transcript, setTranscript] = useState('');
  const [summaries, setSummaries] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState({
    summary: false,
    quiz: false
  });
  const [error, setError] = useState('');

  // Extraire l'ID de session depuis l'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    
    if (!id) {
      navigate('/history');
      return;
    }
    
    setSessionId(id);
  }, [location, navigate]);

  // Vérifier l'authentification et charger la session
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (sessionId) {
      loadSessionData();
    }
  }, [isAuthenticated, sessionId, navigate]);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      setError('');

      // Charger les données de la session
      const [sessionData, transcriptData, summariesData] = await Promise.all([
        quizService.getSession(sessionId),
        transcriptionService.getTranscript(sessionId),
        summaryService.getSummaries(sessionId)
      ]);

      if (sessionData.ok) {
        setSession(sessionData.session);
      } else {
        throw new Error(sessionData.error || 'Erreur lors du chargement de la session');
      }

      if (transcriptData.ok && transcriptData.transcripts?.length > 0) {
        setTranscript(transcriptData.transcripts.map(t => t.text).join(' '));
      } else {
        setTranscript('Aucune transcription disponible');
      }

      if (summariesData.ok) {
        setSummaries(summariesData.summaries || []);
      }

    } catch (err) {
      setError(`Erreur: ${err.message}`);
      console.error('Error loading session data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const generateSummary = async (type) => {
    try {
      setGenerating(prev => ({ ...prev, summary: true }));
      setError('');

      const response = await summaryService.generateSummary(sessionId, type);
      
      if (response.ok) {
        // Recharger les résumés
        const summariesData = await summaryService.getSummaries(sessionId);
        if (summariesData.ok) {
          setSummaries(summariesData.summaries || []);
        }
      } else {
        throw new Error(response.error || 'Échec de la génération');
      }
    } catch (err) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setGenerating(prev => ({ ...prev, summary: false }));
    }
  };

  const generateQuiz = async () => {
    try {
      setGenerating(prev => ({ ...prev, quiz: true }));
      setError('');
      setQuizResults(null);

      const response = await quizService.generateQuiz(sessionId, { numQuestions: 5 });
      
      if (response.ok) {
        setQuiz(response.quiz);
      } else {
        throw new Error(response.error || 'Échec de la génération du quiz');
      }
    } catch (err) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setGenerating(prev => ({ ...prev, quiz: false }));
    }
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const checkQuiz = () => {
    if (!quiz || !quiz.questions) return;

    let score = 0;
    const results = quiz.questions.map((q, idx) => {
      const userAnswer = quizAnswers[idx];
      const isCorrect = userAnswer === q.correct;
      if (isCorrect) score++;
      
      return {
        question: q.question,
        userAnswer: q.options[userAnswer],
        correctAnswer: q.options[q.correct],
        isCorrect,
        options: q.options
      };
    });

    setQuizResults({
      score,
      total: quiz.questions.length,
      results
    });
  };

  const downloadPDF = async (summaryId) => {
    try {
      const response = await summaryService.downloadSummaryPDF(sessionId, summaryId);
      if (response.ok) {
        // Créer un lien de téléchargement
        const url = window.URL.createObjectURL(response.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `resume-${summaryId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const typeLabels = {
    short: 'Court',
    detailed: 'Détaillé',
    keywords: 'Mots-clés'
  };

  if (loading) {
    return (
      <main className="container">
        <p className="loading">Chargement de la session...</p>
      </main>
    );
  }

  return (
    <main className="container">
      <header>
        <div className="logo-container">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="smart-summary-logo">
            <defs>
              <linearGradient id="gradBrain" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#a78bfa', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="gradRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#a78bfa', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path fill="none" stroke="url(#gradBrain)" strokeWidth="2.5" d="M 60 70 Q 50 60 50 80 Q 50 95 60 100 Q 65 102 70 100 Q 75 98 75 85 Q 75 70 65 65 Z" />
            <path fill="none" stroke="url(#gradBrain)" strokeWidth="2.5" d="M 140 70 Q 150 60 150 80 Q 150 95 140 100 Q 135 102 130 100 Q 125 98 125 85 Q 125 70 135 65 Z" />
            <circle fill="url(#gradBrain)" cx="65" cy="75" r="2" />
            <circle fill="url(#gradBrain)" cx="80" cy="80" r="2" />
            <circle fill="url(#gradBrain)" cx="100" cy="75" r="2" />
            <circle fill="url(#gradBrain)" cx="120" cy="80" r="2" />
            <circle fill="url(#gradBrain)" cx="135" cy="75" r="2" />
            <circle fill="url(#gradBrain)" cx="70" cy="95" r="2" />
            <circle fill="url(#gradBrain)" cx="100" cy="98" r="2" />
            <circle fill="url(#gradBrain)" cx="130" cy="95" r="2" />
            <line stroke="url(#gradBrain)" strokeWidth="1.5" x1="65" y1="75" x2="80" y2="80" />
            <line stroke="url(#gradBrain)" strokeWidth="1.5" x1="80" y1="80" x2="100" y2="75" />
            <line stroke="url(#gradBrain)" strokeWidth="1.5" x1="100" y1="75" x2="120" y2="80" />
            <line stroke="url(#gradBrain)" strokeWidth="1.5" x1="120" y1="80" x2="135" y2="75" />
            <line stroke="url(#gradBrain)" strokeWidth="1.5" x1="70" y1="95" x2="100" y2="98" />
            <line stroke="url(#gradBrain)" strokeWidth="1.5" x1="100" y1="98" x2="130" y2="95" />
            <path fill="none" stroke="url(#gradRing)" strokeWidth="3" strokeLinecap="round" d="M 70 140 A 60 25 0 0 1 130 140" strokeDasharray="95,120" />
            <circle cx="100" cy="100" r="95" fill="none" stroke="url(#gradRing)" strokeWidth="0.5" opacity="0.3" strokeDasharray="300" />
          </svg>
          <h1>SmartSummary</h1>
        </div>
        <div className="nav-buttons">
          <Link to="/history" className="nav-link">← Historique</Link>
        </div>
        <div>
          {user && (
            <span id="currentUser">
              {user.name} ({user.email})
            </span>
          )}
          <button id="logoutBtn" onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <section className="card">
        <h2 id="sessionTitle">
          {session?.title || 'Chargement...'}
        </h2>
        <p id="sessionDate" className="session-date">
          {session?.createdAt ? new Date(session.createdAt).toLocaleString('fr-FR') : ''}
        </p>

        <div className="section">
          <h3>📝 Transcription</h3>
          <div className="transcript-content">
            {transcript}
          </div>
        </div>

        <div className="section">
          <h3>📄 Résumés</h3>
          <div className="actions-row">
            <button 
              className="btn-primary" 
              onClick={() => generateSummary('short')}
              disabled={generating.summary}
            >
              {generating.summary ? 'Génération...' : 'Générer Résumé Court'}
            </button>
            <button 
              className="btn-primary" 
              onClick={() => generateSummary('detailed')}
              disabled={generating.summary}
            >
              {generating.summary ? 'Génération...' : 'Générer Résumé Détaillé'}
            </button>
            <button 
              className="btn-primary" 
              onClick={() => generateSummary('keywords')}
              disabled={generating.summary}
            >
              {generating.summary ? 'Génération...' : 'Générer Mots-clés'}
            </button>
          </div>
          
          <div id="summariesList">
            {summaries.length === 0 ? (
              <p className="empty-state">Aucun résumé généré</p>
            ) : (
              summaries.map((summary) => (
                <div key={summary.id} className="summary-card">
                  <div className="summary-header">
                    <strong>{typeLabels[summary.type] || summary.type}</strong>
                    <button 
                      className="btn-primary pdf-btn"
                      onClick={() => downloadPDF(summary.id)}
                    >
                      📥 PDF
                    </button>
                  </div>
                  <div className="summary-text">
                    {summary.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="section">
          <h3>🎯 Quiz</h3>
          <div className="actions-row">
            <button 
              className="btn-primary" 
              onClick={generateQuiz}
              disabled={generating.quiz}
            >
              {generating.quiz ? 'Génération...' : 'Générer Quiz'}
            </button>
          </div>
          
          <div id="quizArea">
            {quiz && quiz.questions && quiz.questions.length > 0 ? (
              <div className="quiz-container">
                {quiz.questions.map((question, idx) => (
                  <div key={idx} className="question-card">
                    <p className="question-text">
                      <strong>Question {idx + 1}:</strong> {question.question}
                    </p>
                    <div className="options-list">
                      {question.options.map((option, optIdx) => (
                        <label key={optIdx} className="option-label">
                          <input
                            type="radio"
                            name={`q${idx}`}
                            value={optIdx}
                            checked={quizAnswers[idx] === optIdx}
                            onChange={() => handleAnswerSelect(idx, optIdx)}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                
                <button className="btn-primary check-btn" onClick={checkQuiz}>
                  Vérifier les réponses
                </button>
              </div>
            ) : quizResults ? (
              <div className="quiz-results">
                <h4>Résultats du Quiz</h4>
                {quizResults.results.map((result, idx) => (
                  <div 
                    key={idx} 
                    className={`result-card ${result.isCorrect ? 'correct' : 'incorrect'}`}
                  >
                    <p>
                      <strong>Q{idx + 1}:</strong> {result.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                    </p>
                    {!result.isCorrect && (
                      <p>Bonne réponse: {result.correctAnswer}</p>
                    )}
                  </div>
                ))}
                <p className="score-display">
                  Score: {quizResults.score}/{quizResults.total}
                </p>
              </div>
            ) : (
              <p className="empty-state">Générez un quiz pour commencer</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default QuizPage;
