import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeamRoutes } from '../../api/teamRoutes';
import { useAuth } from '../../context/auth-context';
import { ROLES } from '../../constants/roles';
import Stats from '../../components/stats';
import AlterUser from '../../components/alter_user';
import CreateUser from '../../components/user/create_user';
import CreateTeam from '../../components/team/create_team';
import AlterTeam from '../../components/team/alter_team';
import AddToTeam from '../../components/team/add_to_team';
import RemoveFromTeam from '../../components/team/remove_from_team';
import './users.css';

const Users = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
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
      const teamsData = await TeamRoutes.fetchTeams();
      console.log('Teams data:', JSON.stringify(teamsData, null, 2));
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

  const allUsers = useMemo(() => {
    const users = [];
    teams.forEach(team => {
      if (team.members && Array.isArray(team.members)) {
        team.members.forEach(member => {
          users.push({
            ...member,
            team_id: team.id,
            team_name: team.team_name
          });
        });
      }
    });
    return users;
  }, [teams]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return allUsers;

    const search = searchTerm.toLowerCase();
    return allUsers.filter(u =>
      u.nome?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search) ||
      u.team_name?.toLowerCase().includes(search)
    );
  }, [allUsers, searchTerm]);

  const groups = useMemo(() => {
    const grouped = [];

    if (!isAdmin && !isLeader) {
      const myTeamUsers = filteredUsers.filter(u => u.team_id === currentUser?.team_id);
      return [{ id: 'my-team', team_name: 'Minha Equipa', users: myTeamUsers }];
    }

    teams.forEach(team => {
      const isMyTeam = team.leader_id === currentUser?.sub;

      if (isAdmin || (isLeader && isMyTeam)) {
        const teamUsers = filteredUsers.filter(u => u.team_id === team.id);

        grouped.push({
          ...team,
          users: teamUsers
        });
      }
    });

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
      
      <Stats users={allUsers} />

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
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Criar Novo Utilizador</h2>
                  <button className="close-modal" onClick={() => setClicked(false)}>&times;</button>
                </div>
                <CreateUser onSuccess={() => {
                  setClicked(false);
                  fetchData();
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
                  fetchData();
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
              users={allUsers}
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
                    {isAdmin && group.id !== 'no-team' && (
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
