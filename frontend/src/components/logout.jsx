import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/auth-context';
import { useNavigate } from 'react-router-dom';
import { SettingsManager, DaltonismModes } from '../api/settingsManager';
import './logout.css';

const BASE_URL = "http://localhost:3000";

const LOGOUT_COLORS = {
  danger: '#e74c3c',
  dangerDark: '#c0392b',
};

const LOGOUT_DALTONISM_COLORS = {
  [DaltonismModes.DEUTERANOMALY]: { danger: '#CC79A7', dangerDark: '#B05A8A' },
  [DaltonismModes.PROTONOMALY]: { danger: '#CC79A7', dangerDark: '#B05A8A' },
  [DaltonismModes.DEUTERANOPIA]: { danger: '#D55E00', dangerDark: '#B04E00' },
  [DaltonismModes.PROTANOPIA]: { danger: '#D55E00', dangerDark: '#B04E00' },
};

const Logout = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [settingsVersion, setSettingsVersion] = useState(0);

  useEffect(() => {
    const handler = () => setSettingsVersion(v => v + 1);
    window.addEventListener('settings-changed', handler);
    return () => window.removeEventListener('settings-changed', handler);
  }, []);

  const daltonism = useMemo(() => {
    try { return { enabled: SettingsManager.GetSetting("DALTONISM") ?? false, mode: SettingsManager.GetSetting("DALTONISM_MODE") ?? DaltonismModes.DEUTERANOMALY }; }
    catch { return { enabled: false, mode: DaltonismModes.DEUTERANOMALY }; }
  }, [settingsVersion]);

  const logoutColors = daltonism.enabled ? (LOGOUT_DALTONISM_COLORS[daltonism.mode] || LOGOUT_COLORS) : LOGOUT_COLORS;

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
      <button className="logout-button" onClick={() => setShowConfirm(true)} title="Terminar Sessão">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span className="logout-text">Logout</span>
      </button>
      {showConfirm && (
        <div className="logout-overlay" onClick={() => setShowConfirm(false)}>
          <div className="logout-confirm-box" onClick={(e) => e.stopPropagation()} style={{
            '--logout-danger': logoutColors.danger,
            '--logout-danger-dark': logoutColors.dangerDark,
          }}>
            <p className="logout-confirm-text">Tem a certeza que deseja terminar a sessão?</p>
            <div className="logout-confirm-buttons">
              <button className="logout-confirm-btn cancel" onClick={() => setShowConfirm(false)}>Cancelar</button>
              <button className="logout-confirm-btn confirm" onClick={confirmLogout}>Terminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Logout;
