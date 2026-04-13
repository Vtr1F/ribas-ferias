import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRoutes } from '../../api/userRoutes';
import { TeamRoutes } from '../../api/teamRoutes';
import { useAuth } from '../../context/auth-context';
import { ROLES } from '../../constants/roles';
import { lazy } from 'react';
import Stats from '../../components/stats';
import AlterUser from '../../components/alter_user';
import CreateUser from '../../components/user/create_user';
import './users.css';

const Users = () => {
  const { user: currentUser } = useAuth(); // Renamed to avoid confusion with the user list
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsedTeams, setCollapsedTeams] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [isClicked, setClicked] = useState(false);

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
      //For debugging: log the raw data to check structure and values, press F12 to open dev tools and check console
      console.log('Users data:', JSON.stringify(usersData, null, 2));
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

  const isAdmin = currentUser?.role === ROLES.ADMIN;
  const isLeader = currentUser?.role === ROLES.TEAM_LEADER;

  // Helper to get team name safely
  const getTeamName = (teamId) => {
    return teams.find(t => t.id === teamId)?.team_name || '—';
  };

  // 1. Memoized Filtering: Only recalculates when users, search, or current user changes
  const filteredUsers = useMemo(() => {
    let base = isAdmin
      ? users
      : users.filter(u => {
          const isMe = u.id === currentUser?.sub;
          const isMySubordinate = u.superior_id === currentUser?.sub;
          const isMyTeamMate = u.team_id === currentUser?.team_id;
          return isMe || isMySubordinate || isMyTeamMate;
        });

    if (!searchTerm) return base;

    const search = searchTerm.toLowerCase();
    return base.filter(u =>
      u.nome?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search) ||
      getTeamName(u.team_id).toLowerCase().includes(search)
    );
  }, [users, searchTerm, currentUser, isAdmin, teams]);

  // 2. Memoized Grouping: Organizes the filtered list into the UI sections
  const groups = useMemo(() => {
    const grouped = [];

    // Case A: Normal Worker - Show one flat group
    if (!isAdmin && !isLeader) {
      return [{ id: 'all', team_name: 'Minha Equipa', users: filteredUsers }];
    }

    // Case B: Grouping by Teams
    // Admins see all teams, Leaders see only their own
    teams.forEach(team => {
      const isMyTeam = team.leader_id === currentUser?.sub;
      
      if (isAdmin || (isLeader && isMyTeam)) {
        const teamUsers = filteredUsers.filter(u => u.superior_id === team.leader_id || u.id === team.leader_id);
        
        if (teamUsers.length > 0) {
          grouped.push({
            id: team.id,
            team_name: team.team_name,
            description: team.description,
            users: teamUsers
          });
        }
      }
    });

    if (isAdmin) {
    const unassignedUsers = filteredUsers.filter(u => 
      !u.team_id && 
      u.role !== ROLES.ADMIN && 
      u.role !== ROLES.TEAM_LEADER
    );

    if (unassignedUsers.length > 0) {
      grouped.push({
        id: 'unassigned-users',
        team_name: 'Utilizadores sem Equipa',
        description: 'Colaboradores que ainda não foram atribuídos a uma equipa',
        users: unassignedUsers,
        isWarning: true // Optional flag for styling
      });
    }
  }

    return grouped;
  }, [filteredUsers, teams, isAdmin, isLeader, currentUser]);

  const toggleTeam = (teamId) => {
    setCollapsedTeams(prev => ({ ...prev, [teamId]: !prev[teamId] }));
  };

  const getRoleBall = (role) => {
    const colors = {
      [ROLES.ADMIN]: '#e74c3c',
      [ROLES.TEAM_LEADER]: '#f1c40f',
      [ROLES.USER]: '#2ecc71'
    };
    return <span className="role-ball" style={{ backgroundColor: colors[role] || '#999' }}></span>;
  };

  const getRoleLabel = (role) => {
    if (role === ROLES.ADMIN) return 'Administrador';
    if (role === ROLES.TEAM_LEADER) return 'Responsável';
    return 'Colaborador';
  };

  const renderUserCard = (u) => (
    <div key={u.id} className="user-card">
      <div className="user-info">
        <div className="user-avatar" onClick={() => navigate(`/users/${u.id}`)}>
          {u.nome?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="user-details">
          <span className="user-name">{u.nome}</span>
          <span className="user-email">{u.email}</span>
        </div>
      </div>
      <div className="user-tabs">
        <div className="user-tab">
          <span className="tab-label">Cargo</span>
          <div className="role-item">
            {getRoleBall(u.role_id)}
            <span className="role-name">{getRoleLabel(u.role_id)}</span>
          </div>
        </div>
        {isAdmin && (
          <button className="user-settings-btn" title="Definições" onClick={() => setSelectedUser(u)}>
            <span className="gear-icon">⚙</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="users-page">
      {selectedUser && (
        <AlterUser
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={fetchData}
        />
      )}
      <h1>Gestão de Utilizadores</h1>
      
      <Stats
        users={users}
      ></Stats>

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
              placeholder="Pesquisar por nome, email ou equipa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="users-search"
            />
          </div>
          {isAdmin && (
            <button 
              className="add-user-btn" 
              onClick={() => setClicked(true)}
            >
              <span className="plus-icon">+</span> Novo Utilizador
            </button>
          )}
        </div>

          {isClicked && (
            <div className="modal-overlay" onClick={() => setClicked(false)}>
              {/* stopPropagation prevents the modal from closing when clicking inside the form */}
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Criar Novo Utilizador</h2>
                  <button className="close-modal" onClick={() => setClicked(false)}>&times;</button>
                </div>
                <CreateUser onSuccess={() => {
                  setClicked(false);
                  fetchData(); // Refresh list after creation
                }} />
              </div>
            </div>
          )}

        <div className="users-list">
          {loading ? (
            <p className="users-loading">A carregar...</p>
          ) : error ? (
            <p className="users-error">{error}</p>
          ) : groups.length === 0 ? (
            <p className="users-no-results">Nenhum utilizador encontrado</p>
          ) : (
            groups.map((group) => (
              <div key={group.id} className="team-group">
                <div className="team-header" onClick={() => toggleTeam(group.id)}>
                  <div className="team-info">
                    <span className="team-toggle">{collapsedTeams[group.id] ? '▶' : '▼'}</span>
                    <span className="team-name">{group.team_name}</span>
                    {group.description && <span className="team-description">{group.description}</span>}
                  </div>
                  <span className="team-member-count">{group.users.length} membros</span>
                </div>
                {!collapsedTeams[group.id] && (
                  <div className="team-users">
                    {group.users.map(renderUserCard)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;