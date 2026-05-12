import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/auth-context';
import { useNavigate } from 'react-router-dom';
import './logout.css';

const BASE_URL = "http://localhost:3000";

const Logout = () => {
  const { setUser } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogout = async () => {
    setShowSuccess(true);
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error(err);
    }
    document.cookie = 'token=; Max-Age=0; path=/';
    setUser(null);
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  const confirmLogout = () => {
    setShowConfirm(false);
    handleLogout();
  };

  return (
    <>
      <button className="logout-button" onClick={() => setShowConfirm(true)} title={t('sidebar_logout')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span className="logout-text">{t('logout_btn')}</span>
      </button>
      {showConfirm && (
        <div className="logout-overlay" onClick={() => setShowConfirm(false)}>
          <div className="logout-confirm-box" onClick={(e) => e.stopPropagation()}>
            <p className="logout-confirm-text">{t('logout_confirm')}</p>
            <div className="logout-confirm-buttons">
              <button className="logout-confirm-btn cancel" onClick={() => setShowConfirm(false)}>{t('btn_cancel')}</button>
              <button className="logout-confirm-btn confirm" onClick={confirmLogout}>{t('logout_confirm_btn')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Logout;
