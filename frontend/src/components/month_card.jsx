
import './month_card.css';

const MonthCard = ({ monthIndex, year, vacationMap = {} }) => { 
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const firstDayIndex = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const days = [];

  for (let i = 0; i < firstDayIndex; i++) {
    days.push(<div key={`empty-${i}`} className="day empty"></div>);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    // 1. Criar string YYYYMMDD (Ex: "20260416")
    const dateStr = `${year}${String(monthIndex + 1).padStart(2, '0')}${String(d).padStart(2, '0')}`;

    let statusClass = "";
    const status = vacationMap[dateStr];

    if (status) {
      // Converte o status da DB para a classe CSS
      if (status === 'Accepted') statusClass = "status-green";
      if (status === 'Pending') statusClass = "status-yellow";
      if (status === 'Rejected') statusClass = "status-red";
    }

    
    days.push(
      <div key={d} className={`day ${statusClass}`}>
        {d}
      </div>
    );
  }

  return (
    <div className="calendar-card">
      <div className="card-header">
        <span className="month-label">{monthNames[monthIndex]}</span>
        <span className="year-label">{year}</span>
      </div>

      <div className="weekdays-header">
        {weekDays.map(wd => <span key={wd}>{wd}</span>)}
      </div>

      <div className="days-grid">
        {days}
      </div>
    </div>
  );
};

export default MonthCard;