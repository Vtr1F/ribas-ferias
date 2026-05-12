import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './access-denied.css';

const AccessDenied = ({ message }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="access-denied">
      <div className="access-denied-content">
        <h1>403</h1>
        <p>{message || t('access_denied_message')}</p>
        <button onClick={() => navigate(-1)}>{t('access_denied_back')}</button>
      </div>
    </div>
  );
};

export default AccessDenied;
