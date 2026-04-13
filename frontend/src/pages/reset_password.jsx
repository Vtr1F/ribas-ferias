import { useNavigate } from 'react-router-dom';
import LoginLayout from '../layouts/login-layout';
import { LoginRoute } from '../api/loginRoute';
import { useState } from 'react';
import './login.css'

function timeout(delay) {
    return new Promise( res => setTimeout(res, delay) );
}

function ResetPassword() {
  const navigate = useNavigate(); // Criamos a função de navegação

  const [email, setEmail] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e) =>{
    e.preventDefault(); // Evita que a página recarregue
    setError(''); // Clear old errors
    try{
        await LoginRoute.requestPassword({email});
        setIsCodeSent(true);
    } catch(err) {
        console.error(err);
        setError('Email Não Encontrado');
    }
  };

  return (
    <LoginLayout>
      <div className="login-container">
        <button className="back-arrow" onClick={() => navigate('/login')}>←</button>
      {!isCodeSent ? (
        <form onSubmit={handleReset}>
          <h2>Recuperar Password</h2>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <button type="submit">Enviar Código</button>
          {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}
        </form>
      ) : (
        <h2>Email Com Link Enviado</h2>
      )}
      </div>
    </LoginLayout>
  );
}

export default ResetPassword;