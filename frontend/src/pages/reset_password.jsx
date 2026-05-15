import { useNavigate } from 'react-router-dom';
import LoginLayout from '../layouts/login-layout';
import { LoginRoute } from '../api/loginRoute';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './login.css'

function timeout(delay) {
    return new Promise( res => setTimeout(res, delay) );
}

function ResetPassword() {
  const navigate = useNavigate(); // Criamos a função de navegação
  const { t } = useTranslation();

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
      setError(t('email_not_found'));
    }
  };

  return (
    <LoginLayout>
      <div className="login-container">
        <button className="back-arrow" onClick={() => navigate('/login')}>←</button>
      {!isCodeSent ? (
        <form onSubmit={handleReset}>
          <h2>{t('recover_password')}</h2>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('profile_email')} />
          <button type="submit">{t('send_code')}</button>
          {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}
        </form>
      ) : (
        <h2>{t('email_with_link_sent')}</h2>
      )}
      </div>
    </LoginLayout>
  );
}

export default ResetPassword;