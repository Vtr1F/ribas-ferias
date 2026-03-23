import { useNavigate } from 'react-router-dom';
import LoginLayout from '../layouts/login-layout';
import './login.css'

function Login() {
  const navigate = useNavigate(); // Criamos a função de navegação

  const handleLogin = (e) => {
    e.preventDefault(); // Evita que a página recarregue
    
    // Aqui pode-se adicionar lógica de validação no futuro
    
    navigate('/dashboard'); // Redireciona para a rota da dashboard
  };

  return (
    <LoginLayout>
      <div className="login-container">
        <h2>Entrar</h2>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>

        {/* Botão de Esqueci a Senha */}
        <button 
          className="forgot-password-btn" 
          onClick={() => navigate('/forgot-password')}
        >
          Esqueceu-se da palavra-passe?
        </button>
        
      </div>
    </LoginLayout>
  );
}

export default Login;