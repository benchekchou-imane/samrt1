import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './Home.css'; // Fichier CSS spécifique à la page d'accueil

function Home() {
  const navigate = useNavigate();
  
  // États pour l'inscription
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    organization: '',
    consent: false
  });
  
  // États pour la connexion
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // États pour les résultats/messages
  const [signupResult, setSignupResult] = useState({ message: '', type: '' });
  const [loginResult, setLoginResult] = useState({ message: '', type: '' });
  const [passwordStrength, setPasswordStrength] = useState('');
  
  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const token = localStorage.getItem('smartsummary_accessToken');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Gérer les changements du formulaire d'inscription
  const handleSignupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignupData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Vérifier la force du mot de passe
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  // Gérer les changements du formulaire de connexion
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Vérifier la force du mot de passe
  const checkPasswordStrength = (password) => {
    if (password.length === 0) {
      setPasswordStrength('');
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengths = ['', 'Faible', 'Moyen', 'Fort', 'Très fort'];
    setPasswordStrength(strengths[strength]);
  };

  // Soumettre le formulaire d'inscription
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupResult({ message: '', type: '' });

    if (!signupData.consent) {
      setSignupResult({
        message: 'Vous devez accepter l\'enregistrement audio pour continuer.',
        type: 'error'
      });
      return;
    }

    try {
      const response = await authService.register({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        role: signupData.role,
        organization: signupData.organization
      });

      if (response.ok) {
        setSignupResult({
          message: 'Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.',
          type: 'success'
        });
        // Réinitialiser le formulaire
        setSignupData({
          name: '',
          email: '',
          password: '',
          role: 'student',
          organization: '',
          consent: false
        });
        setPasswordStrength('');
      } else {
        setSignupResult({
          message: response.error || 'Erreur lors de l\'inscription',
          type: 'error'
        });
      }
    } catch (error) {
      setSignupResult({
        message: 'Erreur de connexion au serveur',
        type: 'error'
      });
      console.error('Signup error:', error);
    }
  };

  // Soumettre le formulaire de connexion
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginResult({ message: '', type: '' });

    try {
      const response = await authService.login({
        email: loginData.email,
        password: loginData.password
      });

      if (response.ok) {
        // Sauvegarder les tokens et informations utilisateur
        localStorage.setItem('smartsummary_accessToken', response.accessToken);
        localStorage.setItem('smartsummary_refreshToken', response.refreshToken);
        localStorage.setItem('smartsummary_user', JSON.stringify(response.user));
        
        setLoginResult({
          message: 'Connexion réussie ! Redirection...',
          type: 'success'
        });
        
        // Rediriger vers le dashboard après 1 seconde
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setLoginResult({
          message: response.error || 'Email ou mot de passe incorrect',
          type: 'error'
        });
      }
    } catch (error) {
      setLoginResult({
        message: 'Erreur de connexion au serveur',
        type: 'error'
      });
      console.error('Login error:', error);
    }
  };

  return (
    <main className="container">
      <header className="home-header">
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
      </header>

      <div className="auth-container">
        <section className="card">
          <h2>Créer un compte</h2>
          <form id="signupForm" onSubmit={handleSignupSubmit}>
            <label>
              Nom complet
              <input
                type="text"
                name="name"
                id="name"
                value={signupData.name}
                onChange={handleSignupChange}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                id="email"
                value={signupData.email}
                onChange={handleSignupChange}
                required
              />
            </label>

            <label>
              Mot de passe
              <input
                type="password"
                name="password"
                id="password"
                value={signupData.password}
                onChange={handleSignupChange}
                required
              />
              {passwordStrength && (
                <div className={`password-strength ${passwordStrength.toLowerCase().replace(' ', '-')}`}>
                  Force du mot de passe: {passwordStrength}
                </div>
              )}
            </label>

            <label>
              Rôle
              <select
                name="role"
                id="role"
                value={signupData.role}
                onChange={handleSignupChange}
              >
                <option value="student">Étudiant</option>
                <option value="teacher">Enseignant</option>
                <option value="professional">Professionnel</option>
              </select>
            </label>

            <label id="orgLabel">
              Cours / Organisation
              <input
                type="text"
                name="organization"
                id="organization"
                value={signupData.organization}
                onChange={handleSignupChange}
                placeholder="Nom du cours ou entreprise"
              />
            </label>

            <label className="checkbox">
              <input
                type="checkbox"
                name="consent"
                id="consent"
                checked={signupData.consent}
                onChange={handleSignupChange}
              />
              J'accepte l'enregistrement audio
            </label>

            <div className="actions">
              <button type="submit">S'inscrire</button>
            </div>
          </form>

          {signupResult.message && (
            <div 
              id="signupResult" 
              className={`result ${signupResult.type}`}
              aria-live="polite"
            >
              {signupResult.message}
            </div>
          )}
        </section>

        <section className="card">
          <h2>Accéder à votre compte</h2>
          <form id="loginForm" onSubmit={handleLoginSubmit}>
            <label>
              Email
              <input
                type="email"
                name="email"
                id="loginEmail"
                value={loginData.email}
                onChange={handleLoginChange}
                required
              />
            </label>
            <label>
              Mot de passe
              <input
                type="password"
                name="password"
                id="loginPassword"
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
            </label>
            <div className="actions">
              <button type="submit">Se connecter</button>
            </div>
          </form>
          {loginResult.message && (
            <div 
              id="loginResult" 
              className={`result ${loginResult.type}`}
              aria-live="polite"
            >
              {loginResult.message}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Home;
