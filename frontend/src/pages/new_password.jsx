import { useNavigate } from 'react-router-dom';
import LoginLayout from '../layouts/login-layout';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { LoginRoute } from '../api/loginRoute';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './login.css'

function NewPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
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
    if (/\s/.test(new_password)) {
      return setError(t('password_no_spaces'))
    }
    if (new_password !== confirmPassword) {
      return setError(t('passwords_do_not_match'));
    }

    try {
      // Send both the token AND the new new_password
      await LoginRoute.updatePassword({ token, new_password });
      setIsPassSet(true);
        setTimeout(() => {
          navigate('/login');
         }, 1000); // ms
    } catch (err) {
      setError(t('link_expired_error'));
    }
  };

  return (
    <LoginLayout>
      <div className="login-container">
        <button className="back-arrow" onClick={() => navigate('/login')}>←</button>
        {!isPassSent ? (
          <>
            <h2>{t('new_password_title')}</h2>
            <form onSubmit={handleSubmit}>
              <input 
                type="password" 
                placeholder={t('new_password_placeholder')} 
                value={new_password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <input 
                type="password" 
                placeholder={t('confirm_password_placeholder')} 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
              <button type="submit">{t('update_password')}</button>
            </form>
            {error && <p style={{color: 'red'}}>{error}</p>}
          </>
        ) : (
          <>
            <h2>{t('password_changed_success')}</h2>
            <p>{t('redirecting_to_login')}</p>
          </>
        )}
      </div>
    </LoginLayout>
  );
}

export default NewPassword;