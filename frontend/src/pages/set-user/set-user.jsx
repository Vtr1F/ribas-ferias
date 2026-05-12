import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoginLayout from '../../layouts/login-layout';
import { LoginRoute } from '../../api/loginRoute';
import '../login.css';

function SetUser() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    setError('');

    if (!birth) {
      return setError(t('birthdate_required_error'));
    }

    if (/\s/.test(new_password)) {
      return setError(t('password_space_error'));
    }

    if (new_password !== confirmPassword) {
      return setError(t('password_mismatch_error'));
    }

    try {
      await LoginRoute.updatePassword({ 
        token, 
        new_password, 
        birth
      });

      setIsPassSet(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
            <h2>{t('set_user_title')}</h2>
            <p className="subtitle">{t('set_user_subtitle')}</p>
            
            <form onSubmit={handleSubmit} className="login-form">
              <label className="form-label">
                {t('birthdate_label')}
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
                {t('set_user_password_label')}
                <input 
                  type="password" 
                  className="modal-input"
                  placeholder={t('set_user_password_placeholder')} 
                  value={new_password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </label>

              <label className="form-label">
                {t('set_user_confirm_password_label')}
                <input 
                  type="password" 
                  className="modal-input"
                  placeholder={t('set_user_confirm_password_placeholder')} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
              </label>

              <button type="submit" className="btn-primary-login">
                {t('activate_account_btn')}
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