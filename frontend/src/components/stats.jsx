import { useState, useEffect } from 'react';
import { UserRoutes } from '../api/userRoutes';
import { RequestRoutes } from '../api/requestRoutes';
import { useAuth } from '../context/auth-context';
import { ROLES } from '../constants/roles';
import './stats.css';

const Stats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalColaboradores: 0,
    totalPedidos: 0,
    feriasMarcados: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [users, requests] = await Promise.all([
        UserRoutes.getAllUsers(),
        RequestRoutes.fetchRequests()
      ]);

      const isLeader = user?.role === ROLES.TEAM_LEADER;
      const isAdmin = user?.role === ROLES.ADMIN;

      let filteredUsers = users;
      let filteredRequests = requests;

      if (isLeader && !isAdmin) {
        filteredUsers = users.filter(u => 
          u.id === user?.sub || u.superior_id === user?.sub
        );
        filteredRequests = requests.filter(r => 
          filteredUsers.some(u => u.id === r.user)
        );
      }

      const feriasMarcados = filteredRequests.filter(r => r.status === 'Accepted').length;

      setStats({
        totalColaboradores: filteredUsers.length,
        totalPedidos: filteredRequests.length,
        feriasMarcados
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="stats-loading">A carregar...</div>;
  }

  return (
    <div className="stats-container">
      <div className="stat-box">
        <div className="stat-label">Total Colaboradores</div>
        <div className="stat-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div className="stat-value">{stats.totalColaboradores}</div>
      </div>

      <div className="stat-box">
        <div className="stat-label">Total Pedidos</div>
        <div className="stat-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <div className="stat-value">{stats.totalPedidos}</div>
      </div>

      <div className="stat-box">
        <div className="stat-label">Férias Marcadas</div>
        <div className="stat-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div className="stat-value">{stats.feriasMarcados}</div>
      </div>
    </div>
  );
};

export default Stats;
