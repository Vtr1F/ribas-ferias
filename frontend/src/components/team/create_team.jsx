import { useState, useEffect, useRef } from 'react';
import { TeamRoutes } from '../../api/teamRoutes';
import { UserRoutes } from '../../api/userRoutes';
import { ROLES } from '../../constants/roles';
import './create_team.css';

const CreateTeam = ({ onSuccess, onClose }) => {
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [leaderId, setLeaderId] = useState('');
  const [leaders, setLeaders] = useState([]);
  const [loadingLeaders, setLoadingLeaders] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    loadLeaders();
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

  const loadLeaders = async () => {
    try {
      setLoadingLeaders(true);
      const response = await UserRoutes.getAllUsers();
      if (Array.isArray(response)) {
        const leaderUsers = response.filter(user => user.role_id === ROLES.TEAM_LEADER);
        setLeaders(leaderUsers);
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar responsáveis');
    } finally {
      setLoadingLeaders(false);
    }
  };

  const filteredLeaders = leaders.filter(leader =>
    leader.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLeader = leaders.find(l => l.id === parseInt(leaderId));

  const handleSelectLeader = (leader) => {
    setLeaderId(String(leader.id));
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleClearLeader = () => {
    setLeaderId('');
    setSearchTerm('');
  };

  const handleInputFocus = () => {
    if (!loadingLeaders) {
      setShowDropdown(true);
      setSearchTerm('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        team_name: teamName,
        description: description || null,
        leader_id: leaderId ? parseInt(leaderId, 10) : null,
        members: []
      };

      const response = await TeamRoutes.addTeam(data);
      
      if (!response.err) {
        onSuccess?.();
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao criar equipa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-team-form">
      {error && <div className="create-team-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="teamName">Nome da Equipa</label>
        <input
          type="text"
          id="teamName"
          required
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Ex: Equipa de Desenvolvimento"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Descrição (opcional)</label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Breve descrição da equipa"
        />
      </div>

      <div className="form-group full-width">
        <label>Responsável (opcional)</label>
        <div className="leader-select-wrapper" ref={dropdownRef}>
          <div className="leader-input-container">
            <div className="leader-search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
              </svg>
            </div>
            {selectedLeader && (
              <>
                <div className="leader-avatar-small">
                  {selectedLeader.nome?.charAt(0).toUpperCase() || '?'}
                </div>
              </>
            )}
            <input
              type="text"
              ref={searchRef}
              className="leader-input"
              placeholder={loadingLeaders ? 'A carregar responsáveis...' : selectedLeader ? '' : 'Pesquisar responsável...'}
              value={showDropdown ? searchTerm : (selectedLeader ? selectedLeader.nome : '')}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={handleInputFocus}
              readOnly={!showDropdown && !!selectedLeader}
            />
            {selectedLeader && (
              <button type="button" className="clear-leader" onClick={handleClearLeader}>
                &times;
              </button>
            )}
            <button type="button" className="dropdown-toggle" onClick={() => setShowDropdown(!showDropdown)}>
              <svg width="12" height="7" viewBox="0 0 12 7" fill="currentColor">
                <path d="M6 7L0 0h12z"/>
              </svg>
            </button>
          </div>
          
          {showDropdown && !loadingLeaders && (
            <div className="leader-dropdown">
              <div className="leader-list">
                {filteredLeaders.length === 0 ? (
                  <div className="leader-no-results">Nenhum responsável encontrado</div>
                ) : (
                  filteredLeaders.map(leader => (
                    <div
                      key={leader.id}
                      className="leader-option"
                      onClick={() => handleSelectLeader(leader)}
                    >
                      <div className="leader-option-avatar">
                        {leader.nome?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <span className="leader-option-name">{leader.nome}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="cancel-btn" onClick={onClose}>
          Cancelar
        </button>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'A criar...' : 'Criar Equipa'}
        </button>
      </div>
    </form>
  );
};

export default CreateTeam;
