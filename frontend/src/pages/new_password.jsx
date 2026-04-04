import { useNavigate } from 'react-router-dom';
import LoginLayout from '../layouts/login-layout';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { LoginRoute } from '../api/loginRoute';
import { useState } from 'react';
import './login.css'

function NewPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  const [new_password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPassSent, setIsPassSet] = useState(false);
  const [error, setError] = useState('');

  // Security Check: If someone lands here without a token, kick them out
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new_password !== confirmPassword) {
      return setError("As passwords não coincidem");
    }

    try {
      // Send both the token AND the new new_password
      await LoginRoute.updatePassword({ token, new_password });
      setIsPassSet(true);
        setTimeout(() => {
          navigate('/login');
         }, 1000); // ms
    } catch (err) {
      setError("O link expirou ou é inválido.");
    }
  };

  return (
    <LoginLayout>
      <div className="login-container">
        <button className="back-arrow" onClick={() => navigate('/login')}>←</button>
        {!isPassSent ? (
          <>
            <h2>Nova Password</h2>
            <form onSubmit={handleSubmit}>
              <input 
                type="password" 
                placeholder="Nova Password" 
                value={new_password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <input 
                type="password" 
                placeholder="Confirmar Password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
              <button type="submit">Atualizar Password</button>
            </form>
            {error && <p style={{color: 'red'}}>{error}</p>}
          </>
        ) : (
          <>
            <h2>Password Alterada com Sucesso</h2>
            <p>Redirecionando ao Login...</p>
          </>
        )}
      </div>
    </LoginLayout>
  );
}

export default NewPassword;