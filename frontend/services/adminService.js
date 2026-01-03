import apiConfig from '../config/apiConfig';

export const adminService = {
  async getStats() {
    const token = localStorage.getItem('smartsummary_accessToken');
    const response = await fetch(`${apiConfig.baseURL}/api/admin/stats`, {
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

  async getUsers() {
    const token = localStorage.getItem('smartsummary_accessToken');
    const response = await fetch(`${apiConfig.baseURL}/api/admin/users`, {
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

  async deleteUser(userId) {
    const token = localStorage.getItem('smartsummary_accessToken');
    const response = await fetch(`${apiConfig.baseURL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return await response.json();
  },

  async updateUserRole(userId, role) {
    const token = localStorage.getItem('smartsummary_accessToken');
    const response = await fetch(`${apiConfig.baseURL}/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role })
    });
    
    return await response.json();
  }
};
