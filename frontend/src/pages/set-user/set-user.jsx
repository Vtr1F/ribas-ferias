import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoginLayout from '../../layouts/login-layout';
import { LoginRoute } from '../../api/loginRoute';
import '../login.css';

function SetUser() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [new_password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birth, setBirth] = useState('');
  const [isPassSent, setIsPassSet] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (!birth) {
      return setError("Por favor, insira a sua data de nascimento.");
    }

    if (/\s/.test(new_password)) {
      return setError("A password não pode conter espaços.");
    }

    if (new_password !== confirmPassword) {
      return setError("As passwords não coincidem.");
    }

    try {
      // Include the birth date in the update call
      await LoginRoute.updatePassword({ 
        token, 
        new_password, 
        birth // Make sure your backend expects this field name
      });

      setIsPassSet(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
            <h2>Finalizar Registo</h2>
            <p className="subtitle">Defina os seus dados de acesso</p>
            
            <form onSubmit={handleSubmit} className="login-form">
              <label className="form-label">
                Data de Nascimento
                <input 
                  type="date" 
                  className="modal-input"
                  value={birth}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setBirth(e.target.value)}
                  required
                />
              </label>

              <label className="form-label">
                Nova Password
                <input 
                  type="password" 
                  className="modal-input" // Use consistent class
                  placeholder="Introduza a password" 
                  value={new_password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </label>

              <label className="form-label">
                Confirmar Password
                <input 
                  type="password" 
                  className="modal-input" // Use consistent class
                  placeholder="Repita a password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
              </label>

              <button type="submit" className="btn-primary-login">
                Ativar Conta
              </button>

              {error && <p className="error-message">{error}</p>}
            </form>
          </>
        ) : (
          <div className="success-state">
            <div className="success-icon">✓</div>
            <h2>Perfil Criado!</h2>
            <p>A sua conta foi ativada com sucesso. A redirecionar para o login...</p>
          </div>
        )}
      </div>
    </LoginLayout>
  );
}

export default SetUser;