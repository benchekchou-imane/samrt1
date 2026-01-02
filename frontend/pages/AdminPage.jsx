import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useAdmin from '../hooks/useAdmin';
import { adminService } from '../services/adminService';
import { authService } from '../services/authService';

function AdminPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { isAdmin } = useAdmin();
  const [stats, setStats] = useState({
    totalUsers: '-',
    totalSessions: '-',
    totalSummaries: '-',
    verifiedUsers: '-',
    avgSessionsPerUser: '-'
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Vérifier les permissions
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (!isAdmin) {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  // Charger les statistiques et utilisateurs
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadData();
    }
  }, [isAuthenticated, isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers()
      ]);
      
      if (statsData.ok) {
        setStats({
          totalUsers: statsData.stats.totalUsers || 0,
          totalSessions: statsData.stats.totalSessions || 0,
          totalSummaries: statsData.stats.totalSummaries || 0,
          verifiedUsers: statsData.stats.verifiedUsers || 0,
          avgSessionsPerUser: statsData.stats.avgSessionsPerUser || 0
        });
      }
      
      if (usersData.ok) {
        setUsers(usersData.users);
      }
      
      setError('');
    } catch (err) {
      setError(`Erreur lors du chargement: ${err.message}`);
      console.error('Error loading admin data:', err);
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

  const handleDeleteUser = async (id, email) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${email}" ? Cette action est irréversible et supprimera toutes ses sessions.`)) {
      return;
    }

    try {
      const response = await adminService.deleteUser(id);
      if (response.ok) {
        loadData(); // Recharger les données
      } else {
        alert(`Erreur: ${response.error || 'Échec de la suppression'}`);
      }
    } catch (err) {
      alert(`Erreur: ${err.message}`);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="container">
        <p className="empty-state">Chargement...</p>
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

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <section className="card">
        <h2>📊 Statistiques</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Total Utilisateurs</p>
            <p className="stat-value" id="statUsers">{stats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Sessions</p>
            <p className="stat-value" id="statSessions">{stats.totalSessions}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Résumés</p>
            <p className="stat-value" id="statSummaries">{stats.totalSummaries}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Utilisateurs Vérifiés</p>
            <p className="stat-value" id="statVerified">{stats.verifiedUsers}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Moyenne Sessions/User</p>
            <p className="stat-value" id="statAvg">{stats.avgSessionsPerUser}</p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>👥 Gestion des Utilisateurs</h2>
        <div id="usersList">
          {users.length === 0 ? (
            <p className="empty-state">Aucun utilisateur</p>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Sessions</th>
                  <th>Vérifié</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.sessionCount || 0}</td>
                    <td>{user.verified ? "✅" : "❌"}</td>
                    <td>
                      <button 
                        className="btn-secondary" 
                        onClick={() => handleDeleteUser(user.id, user.email)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}

export default AdminPage;
