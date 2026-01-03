// Service pour gérer le localStorage
export const storageService = {
  // Utilisateur
  setUser(user) {
    localStorage.setItem('smartsummary_user', JSON.stringify(user));
  },
  
  getUser() {
    const userJson = localStorage.getItem('smartsummary_user');
    return userJson ? JSON.parse(userJson) : null;
  },
  
  // Tokens
  setTokens(accessToken, refreshToken) {
    localStorage.setItem('smartsummary_accessToken', accessToken);
    localStorage.setItem('smartsummary_refreshToken', refreshToken);
  },
  
  getAccessToken() {
    return localStorage.getItem('smartsummary_accessToken');
  },
  
  getRefreshToken() {
    return localStorage.getItem('smartsummary_refreshToken');
  },
  
  // Données d'application
  setItem(key, value) {
    localStorage.setItem(`smartsummary_${key}`, JSON.stringify(value));
  },
  
  getItem(key) {
    const item = localStorage.getItem(`smartsummary_${key}`);
    return item ? JSON.parse(item) : null;
  },
  
  removeItem(key) {
    localStorage.removeItem(`smartsummary_${key}`);
  },
  
  // Nettoyage complet
  clear() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('smartsummary_')) {
        localStorage.removeItem(key);
      }
    });
  }
};
