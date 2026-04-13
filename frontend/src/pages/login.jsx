import { useNavigate } from 'react-router-dom';
import LoginLayout from '../layouts/login-layout';
import { LoginRoute } from '../api/loginRoute';
import { useState } from 'react';
import { useAuth } from '../context/auth-context';
import './login.css'

function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) =>{
    e.preventDefault();
    setError('');
    try{
      
      const response = await LoginRoute.loginPost({ email, password });
      if (!response.err) {
        setUser({ sub: response.id, role: response.role });
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
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" 
                value= {email} onChange={(e) => setEmail(e.target.value)} 
                placeholder="Email" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" 
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" required />
              </div>
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