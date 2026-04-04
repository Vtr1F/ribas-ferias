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
  const [dias_ferias_disponiveis, setDias_ferias_disponiveis] = useState('');
  const [error, setError] = useState('');

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // SuperiorID pode ser nullo
      const data = {
        nome,
        email,
        password,
        role_id: parseInt(role_id, 10),
        superior_id: superior_id ? parseInt(superior_id, 10) : null,
        dias_ferias_disponiveis: parseInt(dias_ferias_disponiveis, 10)
      };
      const response = await UserRoutes.addUser(data);
      if (!response.err) {
        navigate('/users');
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao criar utilizador');
    }
  };

  return (
    <div className="create-user-page">
      <h1>Criar Novo Utilizador</h1>
      <form onSubmit={handleCreateUser}>
        <input type="text" placeholder="Nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
        <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <select required value={role_id} onChange={(e) => setRole_id(e.target.value)}>
          <option value="">Selecione o Papel</option>
          <option value="1">Admin</option>
          <option value="2">Team Leader</option>
          <option value="3">Employee</option>
        </select>
        <input type="number" placeholder="ID do Superior (opcional)" value={superior_id} onChange={(e) => setSuperior_id(e.target.value)} />
        <input type="number" placeholder="Dias de Férias Disponíveis" required value={dias_ferias_disponiveis} onChange={(e) => setDias_ferias_disponiveis(e.target.value)} />
        <button type="submit">Criar Utilizador</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default CreateUser;