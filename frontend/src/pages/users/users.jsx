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
import CreateTeam from '../../components/team/create_team';
import AlterTeam from '../../components/team/alter_team';
import AddToTeam from '../../components/team/add_to_team';
import RemoveFromTeam from '../../components/team/remove_from_team';
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
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [addToTeam, setAddToTeam] = useState(null);
  const [removeFromTeam, setRemoveFromTeam] = useState(null);

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
      console.log('Teams data:', JSON.stringify(teamsData, null, 2));
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

    // Case B: Grouping by Teams (Hierarchical by superior_id)
    // Admins see all teams, Leaders see only their own
    teams.forEach(team => {
      const isMyTeam = team.leader_id === currentUser?.sub;
      
      if (isAdmin || (isLeader && isMyTeam)) {
        // Include leader and all users whose superior is the team leader
        const teamUsers = filteredUsers.filter(u => 
          (u.id === team.leader_id) ||
          (u.superior_id === team.leader_id && u.role_id !== ROLES.ADMIN)
        );
        
        grouped.push({
          id: team.id,
          team_name: team.team_name,
          description: team.description,
          leader_id: team.leader_id,
          users: teamUsers
        });
      }
    });

    // Show users without a team
    const usersWithoutTeam = filteredUsers.filter(u => 
      (u.team_id === null)
    );

    if (usersWithoutTeam.length > 0) {
      grouped.push({
        id: 'no-team',
        team_name: 'Colaboradores sem Equipa',
        description: 'Colaboradores que ainda não foram atribuídos a uma equipa',
        users: usersWithoutTeam,
        isWarning: true
      });
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
            <>
              <button 
                className="add-user-btn" 
                onClick={() => setClicked(true)}
              >
                <span className="plus-icon">+</span> Novo Utilizador
              </button>
              <button 
                className="add-team-btn" 
                onClick={() => setShowCreateTeam(true)}
              >
                <span className="plus-icon">+</span> Criar Equipa
              </button>
            </>
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

          {showCreateTeam && (
            <div className="modal-overlay" onClick={() => setShowCreateTeam(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Criar Nova Equipa</h2>
                  <button className="close-modal" onClick={() => setShowCreateTeam(false)}>&times;</button>
                </div>
                <CreateTeam onSuccess={() => {
                  setShowCreateTeam(false);
                  fetchData(); // Refresh list after creation
                }} onClose={() => setShowCreateTeam(false)} />
              </div>
            </div>
          )}

          {selectedTeam && (
            <AlterTeam
              team={selectedTeam}
              onClose={() => setSelectedTeam(null)}
              onSave={fetchData}
            />
          )}

          {addToTeam && (
            <AddToTeam
              team={addToTeam}
              onClose={() => setAddToTeam(null)}
              onSave={fetchData}
            />
          )}

          {removeFromTeam && (
            <RemoveFromTeam
              team={removeFromTeam}
              users={users}
              onClose={() => setRemoveFromTeam(null)}
              onSave={fetchData}
            />
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
                <div className="team-header">
                  <div className="team-header-left" onClick={() => toggleTeam(group.id)}>
                    <span className="team-toggle">{collapsedTeams[group.id] ? '▶' : '▼'}</span>
                    <span className="team-name">{group.team_name}</span>
                    {group.description && <span className="team-description">{group.description}</span>}
                    {group.id !== 'no-team' && (
                      <button 
                        className="add-to-team-btn" 
                        onClick={(e) => { e.stopPropagation(); setAddToTeam(group); }}
                        title="Adicionar a Equipa"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <line x1="19" y1="8" x2="19" y2="14"/>
                          <line x1="22" y1="11" x2="16" y2="11"/>
                        </svg>
                        Adicionar
                      </button>
                    )}
                    {isAdmin && group.id !== 'no-team' && (
                      <button 
                        className="team-edit-btn" 
                        onClick={(e) => { e.stopPropagation(); setSelectedTeam(group); }}
                        title="Editar Equipa"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="team-header-right">
                    <span className="team-member-count">{group.users.length} membros</span>
                    {isAdmin && group.id !== 'no-team' && (
                      <button 
                        className="remove-from-team-btn" 
                        onClick={(e) => { e.stopPropagation(); setRemoveFromTeam(group); }}
                        title="Remover da Equipa"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <line x1="22" y1="11" x2="16" y2="11"/>
                        </svg>
                        Remover
                      </button>
                    )}
                  </div>
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