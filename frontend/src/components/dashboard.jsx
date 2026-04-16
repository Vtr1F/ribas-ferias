import { useState, useEffect, useMemo } from 'react';
import MonthCard from './month_card'; 
import { RequestRoutes } from '../api/requestRoutes'; 
import { UserRoutes } from '../api/userRoutes';
import { useAuth } from '../context/auth-context'; 
import './dashboard.css'; 

function Dashboard() {
  const { user } = useAuth();
  const [currentYear, setCurrentYear] = useState(2026);
  const [requests, setRequests] = useState(null);
  const [vacationDays, setVacationDays] = useState(0);
  const [loading, setLoading] = useState(true);

  const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; 

  useEffect(() => {
    if (user?.sub || user?.id) {
      fetchData(user.sub || user.id);
    }
  }, [user]);

  const fetchData = async (userId) => {
    try {
      setLoading(true);
      const [requestsData, userData] = await Promise.all([
        RequestRoutes.fetchUserRequest(userId),
        UserRoutes.fetchUser(userId)
      ]);
      const test= await RequestRoutes.fetchRequests();
      console.log(JSON.stringify(test, null, 2))
      setRequests(requestsData);
      setVacationDays(userData?.dias_ferias_disponiveis ?? 0);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const vacationMap = useMemo(() => {
    const map = {};
    if (!requests) return map;

    // Garante que tratamos tanto um objeto único como um array de pedidos
    const requestsArray = Array.isArray(requests) ? requests : [requests];

    requestsArray.forEach(req => {
      if (req.days && Array.isArray(req.days)) {
        req.days.forEach(dayStr => {
          // Mapeia a data para o status específico desse pedido
          map[String(dayStr)] = req.status; 
        });
      }
    });
    return map;
  }, [requests]);

  const nextYear = () => setCurrentYear(prev => (prev < 2200 ? prev + 1 : prev));
  const prevYear = () => setCurrentYear(prev => (prev > 1900 ? prev - 1 : prev));

  return (
    <main className="dashboard-container">
      <header className="calendar-header">
        <div className="header-left">
          <div className="title-section">
            <h1>Calendário</h1>
          </div>
          <div className="year-switcher">
            <button onClick={prevYear} className="year-btn">‹</button>
            <span className="year-display">{currentYear}</span>
            <button onClick={nextYear} className="year-btn">›</button>
          </div>
        </div>

        <div className="header-actions">
          <div className="vacation-allowance">
            Dias Disponíveis: <strong>{vacationDays}</strong>
          </div>
          <button className="btn-request">+ Solicitar Ferias</button>
          <button className="btn-request">+ Solicitar Ausencia</button>
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