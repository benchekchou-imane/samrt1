import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useRecording from '../hooks/useRecording';
import { recordingService } from '../services/recordingService';
import { authService } from '../services/authService';
import './RecordingPage.css';

function RecordingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const {
    isRecording,
    isPaused,
    transcript,
    recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording
  } = useRecording();
  
  const [sessionTitle, setSessionTitle] = useState('');
  const [isMeetingMode, setIsMeetingMode] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const transcriptRef = useRef(null);

  // Vérifier l'authentification
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Faire défiler automatiquement vers le bas de la transcription
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleStartRecording = async () => {
    if (!sessionTitle.trim()) {
      setError('Veuillez saisir un titre pour la session');
      return;
    }

    try {
      setError('');
      setLoading(true);

      // Créer une nouvelle session
      const sessionResponse = await recordingService.createSession({
        title: sessionTitle,
        isMeetingMode
      });

      if (sessionResponse.ok && sessionResponse.session) {
        setSessionInfo(sessionResponse.session);
        
        // Démarrer l'enregistrement
        await startRecording(sessionResponse.session.id);
      } else {
        throw new Error(sessionResponse.error || 'Erreur lors de la création de la session');
      }
    } catch (err) {
      setError(`Erreur: ${err.message}`);
      console.error('Error starting recording:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      setLoading(true);
      await stopRecording();
      
      if (sessionInfo) {
        // Rediriger vers la page de session après un court délai
        setTimeout(() => {
          navigate(`/session?id=${sessionInfo.id}`);
        }, 1000);
      }
    } catch (err) {
      setError(`Erreur: ${err.message}`);
      console.error('Error stopping recording:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (isRecording) {
      return isPaused ? 'En pause' : `Enregistrement... ${formatTime(recordingTime)}`;
    }
    return 'Inactif';
  };

  const getStatusColor = () => {
    if (isRecording) {
      return isPaused ? 'var(--warning)' : 'var(--error)';
    }
    return 'var(--text-secondary)';
  };

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
          <Link to="/dashboard" className="nav-link">← Retour</Link>
          <Link to="/history" className="nav-link">📚 Historique</Link>
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
        <h2>🎙️ Enregistrement en temps réel</h2>
        
        <div className="input-group">
          <label>
            Titre de la session
            <input
              type="text"
              id="sessionTitle"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="Ex: Cours de Mathématiques - Chapitre 3"
              disabled={isRecording}
              className="title-input"
            />
          </label>
        </div>

        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              id="isMeetingMode"
              checked={isMeetingMode}
              onChange={(e) => setIsMeetingMode(e.target.checked)}
              disabled={isRecording}
            />
            Mode Réunion (pour comptes-rendus professionnels)
          </label>
        </div>

        <div className="recorder-controls">
          <div className="recorder-buttons">
            <button
              id="recordBtn"
              className={`btn-primary ${isRecording ? 'recording-active' : ''}`}
              onClick={handleStartRecording}
              disabled={isRecording || loading || !sessionTitle.trim()}
            >
              🎙️ {isRecording ? 'Enregistrement en cours...' : 'Démarrer l\'enregistrement'}
            </button>
            
            {isRecording && (
              <button
                id="pauseBtn"
                className="btn-warning"
                onClick={handlePauseResume}
                disabled={loading}
              >
                {isPaused ? '▶️ Reprendre' : '⏸️ Pause'}
              </button>
            )}
            
            <button
              id="stopBtn"
              className="btn-secondary"
              onClick={handleStopRecording}
              disabled={!isRecording || loading}
            >
              ⏹️ Arrêter
            </button>
          </div>
          
          <div className="recorder-status">
            <span 
              id="recStatus" 
              className="status-indicator"
              style={{ color: getStatusColor() }}
            >
              {getStatusText()}
            </span>
          </div>
        </div>

        <div 
          id="transcriptArea" 
          className="transcript-area"
          ref={transcriptRef}
        >
          {transcript ? (
            <div className="transcript-content">
              {transcript}
            </div>
          ) : (
            <p className="transcript-placeholder">
              La transcription apparaîtra ici en temps réel...
            </p>
          )}
        </div>

        {sessionInfo && (
          <div id="sessionInfo" className="session-info">
            <p>Session créée: <span id="sessionId" className="session-id">{sessionInfo.id}</span></p>
            <p>Mode: <span className="session-mode">{isMeetingMode ? 'Réunion' : 'Standard'}</span></p>
          </div>
        )}
      </section>
    </main>
  );
}

export default RecordingPage;
