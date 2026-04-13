import { useState, useEffect, useRef } from 'react';
import { TeamRoutes } from '../../api/teamRoutes';
import { UserRoutes } from '../../api/userRoutes';
import { ROLES } from '../../constants/roles';
import './add_to_team.css';

const AddToTeam = ({ team, onClose, onSave }) => {
  console.log('AddToTeam team:', JSON.stringify(team));
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    loadUsersWithoutTeam();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showDropdown && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showDropdown]);

  const loadUsersWithoutTeam = async () => {
    try {
      setLoadingUsers(true);
      const response = await UserRoutes.getAllUsers();
      if (Array.isArray(response)) {
        const usersWithoutTeam = response.filter(user => 
          (user.team_id === null || user.team_id === 0)
        );
        setUsers(usersWithoutTeam);
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar utilizadores');
    } finally {
      setLoadingUsers(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedUsers.some(s => s.id === user.id)
  );

  const handleSelectUser = (user) => {
    setSelectedUsers([...selectedUsers, user]);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleInputFocus = () => {
    if (!loadingUsers) {
      setShowDropdown(true);
      setSearchTerm('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      for (const user of selectedUsers) {
        const superiorId = team.leader_id ? parseInt(team.leader_id, 10) : null;
        const payload = {
          nome: user.nome,
          email: user.email,
          dias_ferias_disponiveis: user.dias_ferias_disponiveis || 22,
          role_id: user.role_id,
          superior_id: superiorId,
          team_id: team.id,
          birthday: user.birthday,
          phone_number: user.phone_number,
          headquarter: user.headquarter
        };
        console.log('Payload:', JSON.stringify(payload));
        await UserRoutes.alterUser(user.id, payload);
        await TeamRoutes.addToTeam(team.id, user.id, {});
      }
      onSave?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      setError('Erro ao adicionar utilizadores à equipa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-to-team-overlay">
      <div className="add-to-team-modal">
        <div className="add-to-team-header">
          <button className="back-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2>Adicionar a {team.team_name}</h2>
        </div>

        <form onSubmit={handleSubmit} className="add-to-team-form">
          {error && <div className="add-to-team-error">{error}</div>}

          <div className="form-group">
            <label>Selecionar Utilizadores</label>
            <div className="user-select-wrapper" ref={dropdownRef}>
              <div className="user-input-container">
                <div className="user-search-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
                  </svg>
                </div>
                <input
                  type="text"
                  ref={searchRef}
                  className="user-input"
                  placeholder={loadingUsers ? 'A carregar utilizadores...' : 'Pesquisar utilizador...'}
                  value={showDropdown ? searchTerm : ''}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={handleInputFocus}
                />
                <button type="button" className="dropdown-toggle" onClick={() => setShowDropdown(!showDropdown)}>
                  <svg width="12" height="7" viewBox="0 0 12 7" fill="currentColor">
                    <path d="M6 7L0 0h12z"/>
                  </svg>
                </button>
              </div>
              
              {showDropdown && !loadingUsers && (
                <div className="user-dropdown">
                  <div className="user-list">
                    {filteredUsers.length === 0 ? (
                      <div className="user-no-results">Nenhum utilizador disponível</div>
                    ) : (
                      filteredUsers.map(user => (
                        <div
                          key={user.id}
                          className="user-option"
                          onClick={() => handleSelectUser(user)}
                        >
                          <div className="user-option-avatar">
                            {user.nome?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="user-option-info">
                            <span className="user-option-name">{user.nome}</span>
                            <span className="user-option-email">{user.email}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="form-group">
              <label>Utilizadores Selecionados ({selectedUsers.length})</label>
              <div className="selected-users">
                {selectedUsers.map(user => (
                  <div key={user.id} className="selected-user">
                    <div className="selected-user-avatar">
                      {user.nome?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="selected-user-name">{user.nome}</span>
                    <button type="button" className="remove-user" onClick={() => handleRemoveUser(user.id)}>
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="submit-btn" disabled={loading || selectedUsers.length === 0}>
              {loading ? 'A adicionar...' : `Adicionar ${selectedUsers.length > 0 ? selectedUsers.length : ''} Utilizador${selectedUsers.length !== 1 ? 'es' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddToTeam;
