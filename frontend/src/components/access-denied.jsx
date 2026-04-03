import { useNavigate } from 'react-router-dom';
import './access-denied.css';

const AccessDenied = ({ message = "Não tem permissão para aceder a esta página." }) => {
  const navigate = useNavigate();

  return (
    <div className="access-denied">
      <div className="access-denied-content">
        <h1>403</h1>
        <p>{message}</p>
        <button onClick={() => navigate(-1)}>Voltar</button>
      </div>
    </div>
  );
};

export default AccessDenied;
