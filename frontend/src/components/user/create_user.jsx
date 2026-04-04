import { UserRoutes } from '../../api/userRoutes.js';
import './create_user.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateUser = () => {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role_id, setRole_id] = useState('');
  const [superior_id, setSuperior_id] = useState('');
  const [team_id, setTeam_id] = useState('');
  const [dias_ferias_disponiveis, setDias_ferias_disponiveis] = useState('');
  const [error, setError] = useState('');

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // SuperiorID pode ser nullo
      const data = {

        // dados pro body ser espetado
        nome,
        email,
        password,
        role_id: parseInt(role_id, 10),
        superior_id: superior_id ? parseInt(superior_id, 10) : null,
        dias_ferias_disponiveis: parseInt(dias_ferias_disponiveis, 10),
        team_id: team_id ? parseInt(team_id, 10) : null
      };
      const response = await UserRoutes.addUser(data);
      if (!response.err) {

        // se tem sucesso passa praqui, do ur success shit here, neste caso é so um HTTP POST, therefore nao temos return nenhum
        navigate('/users');
      }
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
            Password
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          <label>
            Papel
            <select required value={role_id} onChange={(e) => setRole_id(e.target.value)}>
              <option value="">Selecione o Papel</option>
              <option value="1">Admin</option>
              <option value="2">Team Leader</option>
              <option value="3">Employee</option>
            </select>
          </label>

          <label>
            ID do Superior (opcional)
            <input type="number" value={superior_id} onChange={(e) => setSuperior_id(e.target.value)} />
          </label>

          <label>
            Dias de Férias Disponíveis
            <input type="number" required value={dias_ferias_disponiveis} onChange={(e) => setDias_ferias_disponiveis(e.target.value)} />
          </label>

          <label>
            ID da Equipa (opcional)
            <input type="number" value={team_id} onChange={(e) => setTeam_id(e.target.value)} />
          </label>

          <button type="submit">Criar Utilizador</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default CreateUser;