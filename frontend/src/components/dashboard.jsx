import { useState, useEffect, useMemo } from 'react';
import MonthCard from './month_card'; 
import { RequestRoutes } from '../api/requestRoutes'; 
import { UserRoutes } from '../api/userRoutes';
import { useAuth } from '../context/auth-context'; 
import Header from './header/header';
import { ABSENCE } from '../constants/requestTypes.js'
import './dashboard.css'; 
import { translateType } from '../utils/translation.js';

function Dashboard() {
  const { user } = useAuth();
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

  const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; 

  const getAbsenceLabel = (value) => {
    const labels = {
      [ABSENCE.SICK]: "Baixa Médica / Doença",
      [ABSENCE.PAR]: "Licença Parental",
      [ABSENCE.BER]: "Dias de Nojo",
      [ABSENCE.OTR]: "Outro"
    };
    return labels[value] || value;
  };

  useEffect(() => {
    if (user?.sub || user?.id) {
      const userId = user.sub || user.id;
      fetchData(userId);
      const interval = setInterval(() => fetchData(userId), 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchData = async (userId) => {
    try {
      if (!requests) setLoading(true);
      const [requestsData, userData] = await Promise.all([
        RequestRoutes.fetchUserRequest(userId),
        UserRoutes.fetchUser(userId)
      ]);
      setRequests(requestsData);
      setVacationDays(userData?.dias_ferias_disponiveis ?? 0);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

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
    if (selectedDays.length === 0) return "Nenhum dia selecionado.";

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
      const monthName = date.toLocaleString('pt-PT', { month: 'long' });
      
      if (!groups[monthName]) groups[monthName] = [];
      groups[monthName].push(day);
    });

    return Object.entries(groups).map(([month, days]) => (
      <div key={month} className="overlay-month-group">
        <strong className="capitalize">{month}:</strong> {days.join(', ')}
      </div>
    ));
  }, [selectedDays]);

  const handleRequestVacation = () => {
  if (selectedDays.length === 0) {
    setError("Selecione dias primeiro.");
    setTimeout(() => setError(''), 6000);
    return;
  }

  if (selectedDays.length > vacationDays) {
    setError(`Limite excedido! Só tem ${vacationDays} dias disponíveis.`);
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
      alert("Erro ao enviar pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false); // Reset cooldown

    }
  };
  const handleAbscence = () => {
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
      // Use FormData for file uploads
      if (file) RequestRoutes.uploadFormFile(file);
      const data = {
        user: user.sub,
        reason: reason.trim(),
        request_type: absenceType,
        days: selectedDays.map(day => parseInt(day, 10)),
        file_path: (file ? file.name : null)
      }

      await RequestRoutes.addRequest(data);

      await fetchData(user.sub || user.id);

      setShowAbsenceOverlay(false);
      // Reset form
      setReason('');
      setAbsenceType(ABSENCE.SICK);
      setFile(null);
      setSelectedDays([]);
    } catch (err) {
      alert("Erro ao enviar ausência.");
    } finally {
      setIsSubmitting(false); // Reset cooldown
    }

    await RequestRoutes.addRequest(data);
    await fetchData(user.sub);

    setShowAbsenceOverlay(false);
    // Reset form
    setReason('');
    setAbsenceType(ABSENCE.SICK);
    setFile(null);
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
            <h2>Confirmar Solicitação</h2>
            <p>Deseja solicitar <strong>{translateType("Vacation")}</strong> para os seguintes dias?</p>
            
            <div className="selected-days-list">
              {formattedSelection}
            </div>

            <div className="modal-info">
              Total de dias: <strong>{selectedDays.length}</strong>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowOverlay(false)}>Cancelar</button>
              <button className="btn-primary" onClick={confirmRequest}>{isSubmitting ? "A processar..." : "Confirmar Pedido"}</button>
            </div>
          </div>
        </div>
      )}

      {showAbsenceOverlay && (
        <div className="modal-backdrop">
          <div className="modal-content absence-modal">
            <h2>Solicitar Ausência</h2>
            <p>Deseja solicitar ausência para os seguintes dias?</p>

            <div className="selected-days-list">
              {formattedSelection}
            </div>

            <div className="modal-info">
              Total de dias: <strong>{selectedDays.length}</strong>
            </div>
            <form onSubmit={submitAbsence}>
              
              <label className="form-label">
                Tipo de Ausência
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
                Motivo / Justificação
                <textarea 
                  className="modal-input textarea" 
                  required 
                  placeholder="Descreva brevemente o motivo..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>

              <label className="form-label">
                  Anexar Ficheiro (Opcional)
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
                      <span>{file ? 'Alterar Ficheiro' : 'Selecionar Ficheiro'}</span>
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
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {isSubmitting ? "A processar..." : "Confirmar Pedido"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="calendar-header">
        <div className="header-left">
          <div className="title-section">
            <h1>Calendário</h1>
          </div>
          <div className="year-switcher">
            <button onClick={() => setCurrentYear(y => y-1)} className="year-btn">‹</button>
            <span className="year-display">{currentYear}</span>
            <button onClick={() => setCurrentYear(y => y+1)} className="year-btn">›</button>
          </div>
        </div>

        <div className="header-actions">
          <div className="vacation-allowance">
            Dias Disponíveis: <strong>{vacationDays}</strong>
          </div>
          <button className="btn-request" onClick={handleRequestVacation}>+ Solicitar Ferias</button>
          <button className="btn-request" onClick={handleAbscence}>+ Solicitar Ausencia</button>
        </div>
      </header>

      <div className="calendar-main-grid">
        {loading ? (
          <p>A carregar...</p>
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
          <div className="legend-pill"><span className="status-box green"></span><span>Aceite</span></div>
          <div className="legend-pill"><span className="status-box yellow"></span><span>Pendente</span></div>
          <div className="legend-pill"><span className="status-box red"></span><span>Rejeitado</span></div>
        </div>
      </footer>
    </main>
  );

}
export default Dashboard;