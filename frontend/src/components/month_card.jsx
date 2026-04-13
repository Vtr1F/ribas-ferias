import './month_card.css';

const MonthCard = ({ monthIndex, year }) => {
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const firstDayIndex = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const days = [];

  for (let i = 0; i < firstDayIndex; i++) {
    days.push(<div key={`empty-${i}`} className="day empty"></div>);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    let statusClass = "";
    // Example status logic
    if (monthIndex === 0 && d === 14) statusClass = "status-green";
    if (monthIndex === 0 && d === 24) statusClass = "status-yellow";
    if (monthIndex === 0 && (d === 27 || d === 29)) statusClass = "status-red";

    days.push(
      <div key={d} className={`day ${statusClass}`}>
        {d}
      </div>
    );
  }

  return (
    <div className="calendar-card">
      <div className="card-header">
        {/* Changed from <select> to <span> */}
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