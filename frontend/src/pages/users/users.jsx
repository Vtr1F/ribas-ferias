import { useState, useEffect } from 'react';
import { UserRoutes } from '../../api/userRoutes';
import { TeamRoutes } from '../../api/teamRoutes';
import { useAuth } from '../../context/auth-context';
import { ROLES } from '../../constants/roles';
import Stats from '../../components/stats';
import './users.css';
import  CreateUser from '../../components/user/create_user.jsx';



const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsedTeams, setCollapsedTeams] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, teamsData] = await Promise.all([
        UserRoutes.getAllUsers(),
        TeamRoutes.fetchTeams()
      ]);
      setUsers(usersData);
      setTeams(teamsData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === ROLES.ADMIN;

  const toggleTeam = (teamId) => {
    setCollapsedTeams(prev => ({
      ...prev,
      [teamId]: !prev[teamId]
    }));
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team?.team_name || null;
  };

  const getTeamDescription = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team?.description || null;
  };

  const getFilteredUsers = () => {
    let baseUsers = isAdmin
      ? users
      : users.filter(u => {
          const isCurrentUser = u.id === user?.sub;
          const isTeamMember = u.superior_id === user?.sub || u.team_id === user?.team_id;
          return isCurrentUser || isTeamMember;
        });

    if (!searchTerm) return baseUsers;

    const search = searchTerm.toLowerCase();
    return baseUsers.filter(u =>
      u.nome?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search) ||
      u.role?.toLowerCase().includes(search) ||
      getTeamName(u.team_id)?.toLowerCase().includes(search)
    );
  };

  const getGroupedUsers = () => {
    const filtered = getFilteredUsers();

    const isLeader = user?.role === ROLES.TEAM_LEADER;

    if (!isAdmin && !isLeader) {
      return [{ id: 'all', team_name: 'Equipa', description: null, users: filtered }];
    }

    const grouped = [];

    // Admin team with admin + all leaders
    const allLeaders = filtered.filter(u => u.role?.toLowerCase() === 'leader');
    const adminUser = filtered.find(u => u.role?.toLowerCase() === 'admin');
    
    if (isAdmin) {
      const adminTeamUsers = [];
      if (adminUser) adminTeamUsers.push(adminUser);
      adminTeamUsers.push(...allLeaders);
      
      if (adminTeamUsers.length > 0) {
        grouped.push({
          id: 'admin-team',
          team_name: 'Administradores',
          description: 'Todos os responsáveis',
          users: adminTeamUsers
        });
      }
    }

    // For leaders: show only their team
    if (isLeader && !isAdmin) {
      const leaderTeam = teams.find(t => t.leader_id === user?.sub);
      if (leaderTeam) {
        const leader = filtered.find(u => u.id === leaderTeam.leader_id);
        const workers = filtered
          .filter(u => u.superior_id === leaderTeam.leader_id)
          .sort((a, b) => a.nome.localeCompare(b.nome));
        
        const teamUsers = [];
        if (leader) teamUsers.push(leader);
        teamUsers.push(...workers);
        
        grouped.push({
          id: leaderTeam.id,
          team_name: leaderTeam.team_name,
          description: leaderTeam.description,
          users: teamUsers
        });
      }
    }

    // For admins: show all teams
    if (isAdmin) {
      teams.forEach(team => {
        if (team.leader_id) {
          const leader = filtered.find(u => u.id === team.leader_id);
          const workers = filtered
            .filter(u => u.superior_id === team.leader_id)
            .sort((a, b) => a.nome.localeCompare(b.nome));
          
          if (leader || workers.length > 0) {
            const teamUsers = [];
            if (leader) teamUsers.push(leader);
            teamUsers.push(...workers);
            
            grouped.push({
              id: team.id,
              team_name: team.team_name,
              description: team.description,
              users: teamUsers
            });
          }
        }
      });
    }

    return grouped;
  };

  const getRoleBall = (role) => {
    const roleLower = role?.toLowerCase();
    let color = '#999';
    if (roleLower === 'admin') color = '#e74c3c';
    else if (roleLower === 'worker') color = '#2ecc71';
    else if (roleLower === 'leader') color = '#f1c40f';
    return <span className="role-ball" style={{ backgroundColor: color }}></span>;
  };

  const getRoleLabel = (role) => {
    const roleLower = role?.toLowerCase();
    if (roleLower === 'admin') return 'Administrador';
    if (roleLower === 'worker') return 'Colaborador';
    if (roleLower === 'leader') return 'Responsável';
    return role;
  };

  const renderUserCard = (user) => {
    const isWorker = user.role?.toLowerCase() === 'worker';
    return (
      <div key={user.id} className="user-card">
        <div className="user-info">
          <div className="user-avatar">
            {user.nome?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="user-details">
            <span className="user-name">{user.nome}</span>
            <span className="user-email">{user.email}</span>
          </div>
        </div>
        <div className="user-tabs">
          <div className="user-tab roles-tab">
            <span className="tab-label">Cargo</span>
            <div className="role-item">
              {getRoleBall(user.role)}
              <span className="role-name">{getRoleLabel(user.role)}</span>
            </div>
          </div>
          <div className="user-tab teams-tab">
            <span className="tab-label">Team</span>
            <span className="team-value">
              {getTeamName(user.team_id) || '—'}
            </span>
          </div>
        </div>
        {isAdmin && (
          <button className="user-settings-btn" title="Definições">
            <span className="gear-icon">⚙</span>
          </button>
        )}
      </div>
    );
  };

  const groups = getGroupedUsers();

  return (
    <div className="users-page">
      <h1>Gestão de Utilizadores</h1>
      <CreateUser />
      <Stats />
      <div className="users-container">
        <div className="users-header">
          <div className="search-wrapper">
            <span className="search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="users-search"
            />
          </div>
        </div>

        <div className="users-list">
          {loading ? (
            <p className="users-loading">A carregar...</p>
          ) : error ? (
            <p className="users-error">{error}</p>
          ) : groups.every(g => g.users.length === 0) ? (
            <p className="users-no-results">Nenhum utilizador encontrado</p>
          ) : (
            groups.map((group) => (
              group.users.length > 0 && (
                <div key={group.id} className="team-group">
                  {(isAdmin || user?.role === ROLES.TEAM_LEADER) && (
                    <div className="team-header" onClick={() => toggleTeam(group.id)} style={{ cursor: 'pointer' }}>
                      <div className="team-info">
                        <span className="team-toggle">{collapsedTeams[group.id] ? '▶' : '▼'}</span>
                        <span className="team-name">{group.team_name}</span>
                        {group.description && (
                          <span className="team-description">{group.description}</span>
                        )}
                      </div>
                      <span className="team-member-count">{group.users.length} membro{group.users.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {!collapsedTeams[group.id] && (
                    <div className="team-users">
                      {group.users.map(renderUserCard)}
                    </div>
                  )}
                </div>
              )
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
