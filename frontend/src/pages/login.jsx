import { useNavigate } from 'react-router-dom';
import LoginLayout from '../layouts/login-layout';
import { LoginRoute } from '../api/loginRoute';
import { useState } from 'react';
import { useAuth } from '../context/auth-context';
import MyLogo from '../assets/logo.png';
import './login.css'

function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate(); // Criamos a função de navegação

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) =>{
    e.preventDefault(); // Evita que a página recarregue
    setError(''); // Clear old errors
    try{
      
      const response = await LoginRoute.loginPost({ email, password });
      if (!response.err) {
        setUser(response);
        navigate('/dashboard');
      }
    } catch(err) {

      console.error(err);
      setError('Credenciais Não Encontradas');

    }
  };

  return (
    <LoginLayout>
          <div className="login-container">
            <h2>Entrar</h2>
            <form onSubmit={handleLogin}>
              <input type="email" 
              value= {email} onChange={(e) => setEmail(e.target.value)} 
              placeholder="Email" required />
              <input type="password" 
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" required />
              <button type="submit">Login</button>
            </form>
            {error && <p className="error">{error}</p>}
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