import  { useState } from 'react'; // Add { useState } here
import MonthCard from './month_card'; 
import './dashboard.css';

function Dashboard() {
  const [currentYear, setCurrentYear] = useState(2026);
  const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; 

  const nextYear = () => setCurrentYear(prev => (prev < 2200 ? prev + 1 : prev));
  const prevYear = () => setCurrentYear(prev => (prev > 1900 ? prev - 1 : prev));

  return (
    <main className="dashboard-container">
      <header className="calendar-header">
        <div className="header-left">
          <div className="title-section">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <h1>Calendário</h1>
          </div>
          
          <div className="year-switcher">
            <button onClick={prevYear} className="year-btn">‹</button>
            <span className="year-display">{currentYear}</span>
            <button onClick={nextYear} className="year-btn">›</button>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-request">+ Solicitar Ferias</button>
          <button className="btn-request">+ Solicitar Ausencia</button>
        </div>
      </header>

      <div className="calendar-main-grid">
        {months.map(m => (
          <MonthCard key={`${currentYear}-${m}`} monthIndex={m} year={currentYear} />
        ))}
      </div>

      <footer className="footer-legend">
        <div className="legend-group">
          <div className="legend-pill">
            <span className="status-box green"></span>
            <span>Disponível</span>
          </div>
          <div className="legend-pill">
            <span className="status-box yellow"></span>
            <span>Pendente</span>
          </div>
          <div className="legend-pill">
            <span className="status-box red"></span>
            <span>Rejeitado</span>
          </div>
        </div>

       
      </footer>
    </main>
  );
}

export default Dashboard;