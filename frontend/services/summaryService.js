import apiConfig from '../config/apiConfig';

export const summaryService = {
  // Pour la page SummaryPage.jsx
  async getAllSummaries() {
    const token = localStorage.getItem('smartsummary_accessToken');
    const response = await fetch(`${apiConfig.baseURL}/api/summaries`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  async getSummaryById(summaryId) {
    const token = localStorage.getItem('smartsummary_accessToken');
    const response = await fetch(`${apiConfig.baseURL}/api/summaries/${summaryId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  async deleteSummary(summaryId) {
    const token = localStorage.getItem('smartsummary_accessToken');
    const response = await fetch(`${apiConfig.baseURL}/api/summaries/${summaryId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return await response.json();
  },

  async exportSummaryPDF(summaryId) {
    const token = localStorage.getItem('smartsummary_accessToken');
    const response = await fetch(`${apiConfig.baseURL}/api/summaries/${summaryId}/pdf`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    return { ok: true, blob };
  },

  // Pour la page QuizPage.jsx (déjà partiellement fourni)
  async getSummaries(sessionId) {
    const token = localStorage.getItem('smartsummary_accessToken');
    const response = await fetch(`${apiConfig.baseURL}/api/sessions/${sessionId}/summaries`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  async generateSummary(sessionId, type) {
    const token = localStorage.getItem('smartsummary_accessToken');
    const response = await fetch(`${apiConfig.baseURL}/api/sessions/${sessionId}/summaries`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  async downloadSummaryPDF(sessionId, summaryId) {
    const token = localStorage.getItem('smartsummary_accessToken');
    const response = await fetch(`${apiConfig.baseURL}/api/sessions/${sessionId}/summaries/${summaryId}/pdf`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    return { ok: true, blob };
  }
};
