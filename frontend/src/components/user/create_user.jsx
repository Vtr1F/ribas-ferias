import { UserRoutes } from '../../api/userRoutes.js';
import { TeamRoutes } from '../../api/teamRoutes.js';
import './create_user.css';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../../constants/roles.js';
import UserAvatar from '../user_avatar/user_avatar';

const CreateUser = () => {
  const navigate = useNavigate();

  const [created, setCreated] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [role_id, setRole_id] = useState('');
  const [superior_id, setSuperior_id] = useState('');
  const [team_id, setTeam_id] = useState('');
  const [error, setError] = useState('');
  const [superiors, setSuperiors] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loadingSuperiors, setLoadingSuperiors] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [showSuperiorDropdown, setShowSuperiorDropdown] = useState(false);
  const [superiorSearchTerm, setSuperiorSearchTerm] = useState('');
  const superiorDropdownRef = useRef(null);
  const superiorSearchRef = useRef(null);

  useEffect(() => {
    loadSuperiors();
    loadTeams();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (superiorDropdownRef.current && !superiorDropdownRef.current.contains(event.target)) {
        setShowSuperiorDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showSuperiorDropdown && superiorSearchRef.current) {
      superiorSearchRef.current.focus();
    }
  }, [showSuperiorDropdown]);

  const loadSuperiors = async () => {
    try {
      setLoadingSuperiors(true);
      const response = await UserRoutes.getAllUsers();
      if (Array.isArray(response)) {
        const superiorUsers = response.filter(user => user.role_id === ROLES.ADMIN || user.role_id === ROLES.TEAM_LEADER);
        setSuperiors(superiorUsers);
      } else {
        console.error('Unexpected response format for users:', response);
        setError('Erro ao buscar superiores - formato inesperado');
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao buscar superiores');
    } finally {
      setLoadingSuperiors(false);
    }
  };

  const loadTeams = async () => {
    try {
      setLoadingTeams(true);
      const response = await TeamRoutes.fetchTeams();
      if (Array.isArray(response)) {
        setTeams(response);
      } else {
        console.error('Unexpected response format for teams:', response);
        setError('Erro ao buscar equipas - formato inesperado');
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao buscar equipas');
    } finally {
      setLoadingTeams(false);
    }
  };

  const filteredSuperiors = superiors.filter(superior =>
    superior.nome?.toLowerCase().includes(superiorSearchTerm.toLowerCase())
  );

  const selectedSuperior = superiors.find(s => s.id === parseInt(superior_id));

  const handleSelectSuperior = (superior) => {
    setSuperior_id(String(superior.id));
    setSuperiorSearchTerm('');
    setShowSuperiorDropdown(false);
  };

  const handleClearSuperior = () => {
    setSuperior_id('');
    setSuperiorSearchTerm('');
  };

  const handleSuperiorInputFocus = () => {
    if (!loadingSuperiors) {
      setShowSuperiorDropdown(true);
      setSuperiorSearchTerm('');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = {
        nome,
        email,
        role_id: parseInt(role_id),
        superior_id: superior_id ? parseInt(superior_id) : null,
        team_id: team_id ? parseInt(team_id) : null
        
      };
      const response = await UserRoutes.addUser(data);
      if (!response.err) {
        navigate('/users');
      }
      
      setCreated(true);

    } catch (err) {
      console.error(err);
      setError('Erro ao criar utilizador');
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };


  return (
    <form onSubmit={handleCreateUser} className="create-user-form">
      {error && <div className="create-user-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="nome">Nome</label>
        <input
          type="text"
          id="nome"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome completo"
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@exemplo.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="role">Papel</label>
        <select
          id="role"
          required
          value={role_id}
          onChange={(e) => setRole_id(e.target.value)}
        >
          <option value="">Selecione o Papel</option>
          <option value="1">Administrador</option>
          <option value="2">Responsável</option>
          <option value="3">Colaborador</option>
        </select>
      </div>

      <div className="form-group full-width">
        <label>Superior (opcional)</label>
        <div className="superior-select-wrapper" ref={superiorDropdownRef}>
          <div className="superior-input-container">
            <div className="superior-search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
              </svg>
            </div>
            {selectedSuperior && (
              <div className="superior-avatar-small">
                <UserAvatar userId={selectedSuperior.id} name={selectedSuperior.nome} size="small" />
              </div>
            )}
            <input
              type="text"
              ref={superiorSearchRef}
              className="superior-input"
              placeholder={loadingSuperiors ? 'A carregar superiores...' : selectedSuperior ? '' : 'Pesquisar superior...'}
              value={showSuperiorDropdown ? superiorSearchTerm : (selectedSuperior ? selectedSuperior.nome : '')}
              onChange={(e) => {
                setSuperiorSearchTerm(e.target.value);
                setShowSuperiorDropdown(true);
              }}
              onFocus={handleSuperiorInputFocus}
              readOnly={!showSuperiorDropdown && !!selectedSuperior}
            />
            {selectedSuperior && (
              <button type="button" className="clear-superior" onClick={handleClearSuperior}>
                &times;
              </button>
            )}
            <button type="button" className="dropdown-toggle" onClick={() => setShowSuperiorDropdown(!showSuperiorDropdown)}>
              <svg width="12" height="7" viewBox="0 0 12 7" fill="currentColor">
                <path d="M6 7L0 0h12z"/>
              </svg>
            </button>
          </div>
          
          {showSuperiorDropdown && !loadingSuperiors && (
            <div className="superior-dropdown">
              <div className="superior-list">
                {filteredSuperiors.length === 0 ? (
                  <div className="superior-no-results">Nenhum superior encontrado</div>
                ) : (
                  filteredSuperiors.map(superior => (
                    <div
                      key={superior.id}
                      className="superior-option"
                      onClick={() => handleSelectSuperior(superior)}
                    >
                      <div className="superior-option-avatar">
                        <UserAvatar userId={superior.id} name={superior.nome} size="small" />
                      </div>
                      <div className="superior-option-info">
                        <span className="superior-option-name">{superior.nome}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="team">Equipa (opcional)</label>
        <select
          id="team"
          value={team_id}
          onChange={(e) => setTeam_id(e.target.value)}
          disabled={loadingTeams}
        >
          <option value="">
            {loadingTeams ? "Carregando equipas..." : "Selecione a Equipa"}
          </option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>
              {team.team_name}
            </option>
          ))}
        </select>
      </div>

      {created && (
        <div className="create-user-success">
          Email Enviado ao Novo utilizador
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="cancel-btn" onClick={handleCancel}>
          Cancelar
        </button>
        <button type="submit" className="submit-btn">
          Criar Utilizador
        </button>
      </div>
    </form>
  );
};

export default CreateUser;