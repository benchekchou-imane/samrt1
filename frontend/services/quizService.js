import apiConfig from '../config/apiConfig';

export const quizService = {
  async getSession(sessionId) {
    const token = localStorage.getItem('smartsummary_accessToken');
    const response = await fetch(`${apiConfig.baseURL}/api/sessions/${sessionId}`, {
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

  async generateQuiz(sessionId, options = {}) {
    const token = localStorage.getItem('smartsummary_accessToken');
    const response = await fetch(`${apiConfig.baseURL}/api/sessions/${sessionId}/quiz`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        numQuestions: options.numQuestions || 5,
        difficulty: options.difficulty || 'medium'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  async submitQuizAnswers(sessionId, answers) {
    const token = localStorage.getItem('smartsummary_accessToken');
    const response = await fetch(`${apiConfig.baseURL}/api/sessions/${sessionId}/quiz/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ answers })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }
};
