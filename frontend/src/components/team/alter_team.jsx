import { useState, useEffect, useRef } from 'react';
import { TeamRoutes } from '../../api/teamRoutes';
import ConfirmModal from '../confirm_modal';
import UserAvatar from '../user_avatar/user_avatar';
import './alter_team.css';

const AlterTeam = ({ team, onClose, onSave }) => {
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [leaderId, setLeaderId] = useState('');
  const [leaders, setLeaders] = useState([]);
  const [loadingLeaders, setLoadingLeaders] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    loadLeaders();
    if (team) {
      setTeamName(team.team_name || '');
      setDescription(team.description || '');
      setLeaderId(team.leader_id ? String(team.leader_id) : '');
    }
  }, [team]);

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
    if (!team) return;
    try {
      setLoadingLeaders(true);
      const teams = await TeamRoutes.fetchTeams();
      const currentTeam = teams.find(t => t.id === team.id);
      
      const availableLeaders = [];
      if (currentTeam && currentTeam.members && Array.isArray(currentTeam.members)) {
        currentTeam.members.forEach(member => {
          if (member.role_id === 1 || member.role_id === 2) {
            availableLeaders.push(member);
          }
        });
      }
      setLeaders(availableLeaders);
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

      await TeamRoutes.alterTeam(team.id, data);
      onSave?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      setError('Erro ao atualizar equipa');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setShowConfirm(true);
  };

  const handleConfirmRemove = async () => {
    setLoading(true);
    setError(null);

    try {
      await TeamRoutes.removeTeam(team.id);
      setShowConfirm(false);
      onSave?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      setError('Erro ao remover equipa');
    } finally {
      setLoading(false);
    }
  };

  if (!team) return null;

  return (
    <div className="alter-team-overlay">
      <div className="alter-team-modal">
        <div className="alter-team-header">
          <button className="back-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2>Editar Equipa</h2>
          <button className="delete-team-btn" onClick={handleRemove} disabled={loading}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="alter-team-form">
          {error && <div className="alter-team-error">{error}</div>}

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

          <div className="form-group">
            <label>Responsável</label>
            <div className="leader-select-wrapper" ref={dropdownRef}>
              <div className="leader-input-container">
                <div className="leader-search-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
                  </svg>
                </div>
                {selectedLeader && (
                  <div className="leader-avatar-small">
                    <UserAvatar userId={selectedLeader.id} name={selectedLeader.nome} size="small" />
                  </div>
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
                            <UserAvatar userId={leader.id} name={leader.nome} size="small" />
                          </div>
                          <div className="leader-option-info">
                            <span className="leader-option-name">{leader.nome}</span>
                            <span className="leader-option-team">{leader.team_name}</span>
                          </div>
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
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'A guardar...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
      <ConfirmModal
        isOpen={showConfirm}
        title="Remover Equipa"
        message="Tem a certeza que deseja remover esta equipa? Os membros não serão eliminados."
        onConfirm={handleConfirmRemove}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default AlterTeam;
