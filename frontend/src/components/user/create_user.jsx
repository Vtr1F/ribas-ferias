import { UserRoutes } from '../../api/userRoutes.js';
import { TeamRoutes } from '../../api/teamRoutes.js';
import './create_user.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../../constants/roles.js';

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

  useEffect(() => {
    loadSuperiors();
    loadTeams();
  }, []);

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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = {
        nome,
        email,
        role_id: parseInt(role_id, 10),
        superior_id: superior_id ? parseInt(superior_id, 10) : null,
        team_id: team_id ? parseInt(team_id, 10) : null
        
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


  return (
    <div className="create-user-page">
      <div className="create-user-card">
        <form onSubmit={handleCreateUser}>
          <label>
            Nome
            <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} />
          </label>

          <label>
            Email
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label>
            Papel
            <select required value={role_id} onChange={(e) => setRole_id(e.target.value)}>
              <option value="">Selecione o Papel</option>
              <option value="1">Administrador</option>
              <option value="2">Responsável</option>
              <option value="3">Colaborador</option>
            </select>
          </label>

          <label>
            Superior (opcional)
            <select value={superior_id} onChange={(e) => setSuperior_id(e.target.value)} disabled={loadingSuperiors}>
              <option value="">
                {loadingSuperiors ? "Carregando superiores..." : "Selecione o Superior"}
              </option>
              {superiors.map(superior => (
                <option key={superior.id} value={superior.id}>
                  {superior.nome}
                </option>
              ))}
            </select>
          </label>

          <label>
            Equipa (opcional)
            <select value={team_id} onChange={(e) => setTeam_id(e.target.value)} disabled={loadingTeams}>
              <option value="">
                {loadingTeams ? "Carregando equipas..." : "Selecione a Equipa"}
              </option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.team_name}
                </option>
              ))}
            </select>
          </label>

          <button type="submit">Criar Utilizador</button>
        </form>

        {!created ? (
          <p></p>
        ) : (
          <p>Email Enviado ao Novo utilizador</p>
        ) }

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default CreateUser;