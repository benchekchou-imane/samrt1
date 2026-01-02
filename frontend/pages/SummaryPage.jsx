import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useSummary from '../hooks/useSummary';
import { authService } from '../services/authService';
import { summaryService } from '../services/summaryService';
import './SummaryPage.css';

function SummaryPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { summaries, loading, error, loadSummaries } = useSummary();
  const [showModal, setShowModal] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState(null);

  // Vérifier l'authentification
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Charger les résumés au montage
  useEffect(() => {
    if (isAuthenticated && user) {
      loadSummaries();
    }
  }, [isAuthenticated, user, loadSummaries]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleViewSummary = (summary) => {
    setSelectedSummary(summary);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSummary(null);
  };

  const handleExportPDF = async (summaryId) => {
    try {
      // Vous devrez implémenter cette fonction dans summaryService
      const response = await summaryService.exportSummaryPDF(summaryId);
      if (response.ok) {
        // Télécharger le PDF
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
      console.error('Error exporting PDF:', err);
      alert('Erreur lors de l\'exportation du PDF');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

      <section className="card">
        <h2>📝 Mes Résumés</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div id="summariesList" className="items-grid">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Chargement des résumés...</p>
            </div>
          ) : summaries.length === 0 ? (
            <div className="empty-state">
              <p>Aucun résumé pour le moment.</p>
              <p>Enregistrez un cours pour générer un résumé!</p>
              <Link to="/record" className="btn-primary">
                🎙️ Commencer un enregistrement
              </Link>
            </div>
          ) : (
            summaries.map((summary, idx) => (
              <div key={summary.id || idx} className="item-card">
                <div className="item-header">
                  <h3>{summary.title || `Résumé ${idx + 1}`}</h3>
                  <span className="item-type">
                    {summary.type === 'short' && '📋 Court'}
                    {summary.type === 'detailed' && '📖 Détaillé'}
                    {summary.type === 'keywords' && '🔑 Mots-clés'}
                  </span>
                </div>
                <p className="item-date">
                  {formatDate(summary.createdAt || summary.date)}
                </p>
                <p className="item-preview">
                  {truncateText(summary.content || summary.text, 120)}
                </p>
                <div className="item-actions">
                  <button 
                    className="view-btn" 
                    onClick={() => handleViewSummary(summary)}
                  >
                    👁️ Voir
                  </button>
                  {summary.id && (
                    <button 
                      className="export-btn"
                      onClick={() => handleExportPDF(summary.id)}
                    >
                      📥 PDF
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Modal pour afficher le résumé complet */}
      {showModal && selectedSummary && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedSummary.title || 'Résumé'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-meta">
                <p><strong>Type:</strong> {selectedSummary.type || 'Non spécifié'}</p>
                <p><strong>Date:</strong> {formatDate(selectedSummary.createdAt || selectedSummary.date)}</p>
              </div>
              <div className="modal-text">
                {selectedSummary.content || selectedSummary.text}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCloseModal}>
                Fermer
              </button>
              {selectedSummary.id && (
                <button 
                  className="btn-primary"
                  onClick={() => handleExportPDF(selectedSummary.id)}
                >
                  📥 Télécharger en PDF
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default SummaryPage;
