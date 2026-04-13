import  { useState } from 'react'; // Add { useState } here
import MonthCard from './month_card'; 
import './dashboard.css';

function Dashboard() {
  const [currentYear, setCurrentYear] = useState(2026);
  const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; 

  const nextYear = () => setCurrentYear(prev => prev + 1);
  const prevYear = () => setCurrentYear(prev => prev - 1);

  return (
    <main className="dashboard-container">
      <header className="calendar-header">
        <div className="header-left">
          <div className="title-section">
            <span className="icon">🗓️</span>
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