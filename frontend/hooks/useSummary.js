import { useState, useCallback } from 'react';
import { summaryService } from '../services/summaryService';

function useSummary() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSummaries = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await summaryService.getAllSummaries();
      
      if (response.ok) {
        setSummaries(response.summaries || []);
      } else {
        setError(response.error || 'Erreur lors du chargement des résumés');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Error loading summaries:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateSummary = useCallback(async (sessionId, type) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await summaryService.generateSummary(sessionId, type);
      
      if (response.ok) {
        // Recharger les résumés après génération
        await loadSummaries();
        return { success: true, summary: response.summary };
      } else {
        throw new Error(response.error || 'Erreur lors de la génération');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [loadSummaries]);

  return {
    summaries,
    loading,
    error,
    loadSummaries,
    generateSummary,
    addLocalSummary: (summary) => {
      setSummaries(prev => [summary, ...prev]);
    }
  };
}

export default useSummary;
