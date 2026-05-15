import { useState, useEffect, useMemo, cache, useCallback , useRef} from 'react';
import { useTranslation } from 'react-i18next'; 
import MonthCard from './month_card'; 
import { RequestRoutes } from '../api/requestRoutes'; 
import { UserRoutes } from '../api/userRoutes';
import { useAuth } from '../context/auth-context'; 
import Header from './header/header';
import { ABSENCE } from '../constants/requestTypes.js'
import './dashboard.css'; 
import { translateType } from '../utils/translation.js';
import { SettingsManager, DaltonismModes } from '../api/settingsManager.js';

const fetchUserCached = cache(async (id) => {
  return UserRoutes.fetchUser(id);
});

const fetchUserRequestCached = cache(async (userId) => {
  return RequestRoutes.fetchUserRequest(userId);
});

const STATUS_COLORS = {
  approved: '#00FF40',
  pending: '#FFB800',
  rejected: '#FF3B30',
};

const DALTONISM_COLORS = {
  [DaltonismModes.DEUTERANOMALY]: {
    approved: '#0072B2',
    pending: '#E69F00',
    rejected: '#CC79A7',
  },
  [DaltonismModes.PROTONOMALY]: {
    approved: '#0072B2',
    pending: '#E69F00',
    rejected: '#CC79A7',
  },
  [DaltonismModes.DEUTERANOPIA]: {
    approved: '#0072B2',
    pending: '#F0E442',
    rejected: '#D55E00',
  },
  [DaltonismModes.PROTANOPIA]: {
    approved: '#0072B2',
    pending: '#F0E442',
    rejected: '#D55E00',
  },
};

function Dashboard() {
  const { user } = useAuth();
  const { t , i18n } = useTranslation();
  console.log('Dashboard renderizou. Idioma atual:', i18n?.language);
  console.log('Chave de teste (calendar_title):', t('calendar_title'));
  const isInitialMount = useRef(true);
  const lastUserId = useRef(null);

  const [currentYear, setCurrentYear] = useState(2026);
  const [requests, setRequests] = useState(null);
  const [vacationDays, setVacationDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState([]);
  const [showAbsenceOverlay, setShowAbsenceOverlay] = useState(false);
  const [reason, setReason] = useState('');
  const [absenceType, setAbsenceType] = useState(ABSENCE.SICK);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- NEW STATE FOR MODAL ---
  const [showOverlay, setShowOverlay] = useState(false);

  const [daltonism, setDaltonism] = useState(() => {
    try { return { enabled: SettingsManager.GetSetting("DALTONISM") ?? false, mode: SettingsManager.GetSetting("DALTONISM_MODE") ?? DaltonismModes.DEUTERANOMALY }; }
    catch { return { enabled: false, mode: DaltonismModes.DEUTERANOMALY }; }
  });

  const statusColors = useMemo(() => {
    if (!daltonism.enabled) return STATUS_COLORS;
    return DALTONISM_COLORS[daltonism.mode] || STATUS_COLORS;
  }, [daltonism]);

  const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; 

  const getAbsenceLabel = (value) => {
    const labels = {
      [ABSENCE.SICK]: t('type_sick_leave'),
      [ABSENCE.PAR]: t('type_parental_leave'),
      [ABSENCE.BER]: t('type_bereavement_leave'),
      [ABSENCE.OTR]: t('type_other')
    };
    return labels[value] || value;
  };

  const fetchData = useCallback(async (userId) => {
    if (!userId) return;
    try {
      // Só mostra loading na primeira vez para não "piscar" a UI no intervalo
      const [requestsData, userData] = await Promise.all([
        fetchUserRequestCached(userId),
        fetchUserCached(userId)
      ]);
      setRequests(requestsData);
      setVacationDays(userData?.dias_ferias_disponiveis ?? 0);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Dependências vazias pois as rotas são estáticas


  useEffect(() => {
    const userId = user?.sub || user?.id;
    
    if (userId && userId !== lastUserId.current) {
    lastUserId.current = userId;
    
    fetchData(userId);
      
      const interval = setInterval(() => {
        fetchData(userId);
      }, 30000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [user?.sub, user?.id, fetchData]); // fetchData agora é estável

  const { vacationMap, usedDaysCount } = useMemo(() => {
    const map = {};
    let usedCount = 0;
    if (!requests) return { vacationMap: map, usedDaysCount: 0 };

    const requestsArray = Array.isArray(requests) ? requests : [requests];

    requestsArray.forEach(req => {
      if (req.days && Array.isArray(req.days)) {
        req.days.forEach(dayStr => {
          map[String(dayStr)] = {
            status: req.status,
            type: req.request_type
          };

          const status = req.status?.toLowerCase();
          
          // AGORA: Conta QUALQUER tipo de pedido (Vacation, Parental, etc.)
          // que esteja Approved ou Pending
          if (status === "approved" || status === "accepted" || status === "pending") {
            usedCount++;
          }
        });
      }
    });
    return { vacationMap: map, usedDaysCount: usedCount };
  }, [requests]);


  const handleDateClick = (dateStr) => {
    if (vacationMap[dateStr]) return;
    setSelectedDays(prev => 
      prev.includes(dateStr) 
        ? prev.filter(d => d !== dateStr) 
        : [...prev, dateStr]
    );
  };

    // --- LOGIC TO FORMAT DATES FOR THE MODAL ---
    const formattedSelection = useMemo(() => {
    if (selectedDays.length === 0) return t('no_days_selected');

    const groups = {};

    // Sort the strings first so the days appear in order
    const sortedDays = [...selectedDays].sort();

    sortedDays.forEach(dateStr => {
      // Manually parse YYYYMMDD
      const year = parseInt(dateStr.substring(0, 4));
      const month = parseInt(dateStr.substring(4, 6)) - 1; // Month is 0-indexed
      const day = parseInt(dateStr.substring(6, 8));

      const date = new Date(year, month, day);
      
      // Get the month name (e.g., "fevereiro")
      const monthName = date.toLocaleString(i18n.language, { month: 'long' });
      
      if (!groups[monthName]) groups[monthName] = [];
      groups[monthName].push(day);
    });

    return Object.entries(groups).map(([month, days]) => (
      <div key={month} className="overlay-month-group">
        <strong className="capitalize">{month}:</strong> {days.join(', ')}
      </div>
    ));
  }, [selectedDays, i18n.language, t]);

  const handleRequestVacation = () => {
  if (selectedDays.length === 0) {
    setError(t('select_days_first'));
    setTimeout(() => setError(''), 6000);
    return;
  }

  if (selectedDays.length > vacationDays) {
    setError(t('error_limit_exceeded', { count: vacationDays }));
    setTimeout(() => setError(''), 4000);
    return;
  }

  setShowOverlay(true);
};

  const confirmRequest = async () => {

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      console.log("Final submission for:", selectedDays);
      const data = {
        user: user.sub,
        request_type: "Vacation",
        days: selectedDays.map(day => parseInt(day, 10))
      };

      await RequestRoutes.addRequest(data);

      await fetchData(user.sub || user.id);
      setShowOverlay(false);
      setSelectedDays([]); // Clear selection after success
  
    } catch (err) {
      alert(t('error_submit_request'));
    } finally {
      setIsSubmitting(false); // Reset cooldown

    }
  };
  const handleAbscence = () => {
    // Validação para garantir que existem dias selecionados antes de abrir o modal
    if (selectedDays.length === 0) {
      setError(t('select_days_first'));
      setTimeout(() => setError(''), 4000); // Remove o erro após 4 segundos
      return;
    }

    setShowAbsenceOverlay(true);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const submitAbsence = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      if (file) await RequestRoutes.uploadFormFile(file);

      const data = {
        user: user.sub,
        reason: reason.trim(),
        request_type: absenceType,
        days: selectedDays.map(day => parseInt(day, 10)),
        file_path: (file ? file.name : null)
      }

      await RequestRoutes.addRequest(data);
      await fetchData(user.sub || user.id);

      // Fechar modal e resetar estados
      setShowAbsenceOverlay(false);
      setReason('');
      setAbsenceType(ABSENCE.SICK);
      setFile(null);
      setSelectedDays([]);

    } catch (err) {
      alert(t('error_submit_absence'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="dashboard-container">
      {/* Pop-up de Erro com Classes CSS */}
      {error && (
        <div className="error-popup-container">
          <span>⚠️ {error}</span>
          <button 
            className="error-popup-close" 
            onClick={() => setError('')}
          >
            ×
          </button>
        </div>
      )}
      <Header />
      
      {/* --- OVERLAY MODAL --- */}
      {showOverlay && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>{t('confirm_request_title')}</h2>
            <p dangerouslySetInnerHTML={{__html: t('request_vacation_for_days', { type: `<strong>${t('type_vacation')}</strong>` })}}></p>
            
            <div className="selected-days-list">
              {formattedSelection}
            </div>

            <div className="modal-info">
              {t('total_days')}: <strong>{selectedDays.length}</strong>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowOverlay(false)}>{t('btn_cancel')}</button>
              <button className="btn-primary" onClick={confirmRequest}>{isSubmitting ? t('processing') : t('btn_confirm')}</button>
            </div>
          </div>
        </div>
      )}

      {showAbsenceOverlay && (
        <div className="modal-backdrop">
          <div className="modal-content absence-modal">
            <h2>{t('absence_modal_title')}</h2>
            <p>{t('request_absence_for_days')}</p>

            <div className="selected-days-list">
              {formattedSelection}
            </div>

            <div className="modal-info">
              {t('total_days')}: <strong>{selectedDays.length}</strong>
            </div>
            <form onSubmit={submitAbsence}>
              
              <label className="form-label">
                {t('absence_type_label')}
                <select 
                  className="modal-input" 
                  value={absenceType} 
                  onChange={(e) => setAbsenceType(e.target.value)}
                > 
                  {Object.entries(ABSENCE).map(([key, value]) => (
                    <option key={key} value={value}>
                      {/* Using the utility for the dropdown labels */}
                      {translateType(value)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-label">
                {t('reason_label')}
                <textarea 
                  className="modal-input textarea" 
                  required 
                  placeholder={t('reason_placeholder')}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>

              <label className="form-label">
                  {t('attach_file_label')}
                  <div className="file-upload-container">
                    {/* 1. The hidden input */}
                    <input 
                      type="file" 
                      id="file-upload" 
                      className="hidden-file-input" 
                      onChange={handleFileChange} 
                    />
                    
                    {/* 2. The visible "button" (actually a label) */}
                    <label htmlFor="file-upload" className="custom-file-button">
                      <span>{file ? t('change_file') : t('select_file')}</span>
                    </label>

                    {/* 3. Display the filename so the user has feedback */}
                    {file && (
                      <div className="file-name-badge">
                        <span className="file-icon">📎</span>
                        {file.name}
                        <button type="button" className="remove-file" onClick={() => setFile(null)}>✕</button>
                      </div>
                    )}
                  </div>
                </label>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAbsenceOverlay(false)}>
                  {t('btn_cancel')}
                </button>
                <button type="submit" className="btn-primary">
                  {isSubmitting ? t('processing') : t('btn_confirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="calendar-header">
        <div className="header-left">
          <div className="title-section">
            <h1>{t('calendar_title')}</h1>
          </div>
          <div className="year-switcher">
            <button onClick={() => setCurrentYear(y => y-1)} className="year-btn">‹</button>
            <span className="year-display">{currentYear}</span>
            <button onClick={() => setCurrentYear(y => y+1)} className="year-btn">›</button>
          </div>
        </div>

        <div className="header-actions">
          <div className="vacation-allowance">
            {t('available_days')}: <strong>{vacationDays}</strong>
          </div>
          <button className="btn-request" onClick={handleRequestVacation}>{t('btn_request_vacation')}</button>
          <button className="btn-request" onClick={handleAbscence}>{t('btn_request_absence')}</button>
        </div>
      </header>

      <div
        className="calendar-main-grid"
        style={{
          '--status-green': statusColors.approved,
          '--status-yellow': statusColors.pending,
          '--status-red': statusColors.rejected,
          '--badge-green': daltonism.enabled ? statusColors.approved : '#15803d',
          '--badge-yellow': daltonism.enabled ? statusColors.pending : '#a16207',
          '--badge-red': daltonism.enabled ? statusColors.rejected : '#b91c1c',
        }}
      >
        {loading ? (
          <p>{t('loading')}</p>
        ) : (
          months.map(m => (
            <MonthCard 
              key={`${currentYear}-${m}`} 
              monthIndex={m} 
              year={currentYear}
              vacationMap={vacationMap} 
              selectedDays={selectedDays} 
              onDateClick={handleDateClick}
            />
          ))
        )}
      </div>

      <footer className="footer-legend">
        <div className="legend-group">
          <div className="legend-pill"><span className="status-box green"></span><span>{t('legend_accepted')}</span></div>
          <div className="legend-pill"><span className="status-box yellow"></span><span>{t('legend_pending')}</span></div>
          <div className="legend-pill"><span className="status-box red"></span><span>{t('legend_rejected')}</span></div>
        </div>
      </footer>
    </main>
  );

}
export default Dashboard;