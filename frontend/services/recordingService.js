import apiConfig from '../config/apiConfig';

export const recordingService = {
  async createSession(sessionData) {
    const token = localStorage.getItem('smartsummary_accessToken');
    const response = await fetch(`${apiConfig.baseURL}/api/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sessionData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  async sendAudioChunk(sessionId, audioBlob) {
    const token = localStorage.getItem('smartsummary_accessToken');
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    const response = await fetch(`${apiConfig.baseURL}/api/sessions/${sessionId}/audio`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  async finalizeRecording(sessionId) {
    const token = localStorage.getItem('smartsummary_accessToken');
    const response = await fetch(`${apiConfig.baseURL}/api/sessions/${sessionId}/finalize`, {
      method: 'POST',
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

  async getRecordingStatus(sessionId) {
    const token = localStorage.getItem('smartsummary_accessToken');
    const response = await fetch(`${apiConfig.baseURL}/api/sessions/${sessionId}/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }
};
