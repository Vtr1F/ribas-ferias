import { useNavigate } from 'react-router-dom';
import LoginLayout from '../layouts/login-layout';
import { LoginRoute } from '../api/loginRoute';
import { useState } from 'react';
import { useAuth } from '../context/auth-context';
import { useTranslation } from 'react-i18next';
import './login.css'

function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
                    <label>{t('profile_email')}</label>
                    <input type="email" 
                    value= {email} onChange={(e) => setEmail(e.target.value)} 
                    placeholder={t('profile_email')} required />
              </div>
              <div className="form-group">
                    <label>{t('password_label')}</label>
                    <input type="password" 
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('password_label')} required />
              </div>
                  <button type="submit">{t('login_btn')}</button>
            </form>
                {error && <p className="error">{error}</p>}
            {/* Botão de Esqueci a Senha */}
            <button 
              className="forgot-password-btn" 
              onClick={() => navigate('/forgot-password')}
            >
                  {t('forgot_password')}
            </button>
            
          </div>
    </LoginLayout>
  );
}

export default Login;