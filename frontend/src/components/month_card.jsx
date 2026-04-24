import './month_card.css';

const MonthCard = ({ 
  monthIndex, 
  year, 
  vacationMap = {}, 
  selectedDays = [], // Array of YYYYMMDD strings already selected
  onDateClick        // Function passed from parent to handle the click
}) => { 
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const firstDayIndex = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const days = [];

  // Empty slots for start of month
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(<div key={`empty-${i}`} className="day empty"></div>);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}${String(monthIndex + 1).padStart(2, '0')}${String(d).padStart(2, '0')}`;

    // Check existing status from DB
    let statusClass = "";
    const status = vacationMap[dateStr];
    if (status === 'Accepted') statusClass = "status-green";
    if (status === 'Pending') statusClass = "status-yellow";
    if (status === 'Rejected') statusClass = "status-red";

    // Check if user is currently selecting this day in the UI
    const isSelected = selectedDays.includes(dateStr);
    const isSelectable = !status; // Only allow selecting if there's no existing request

    days.push(
      <div 
        key={d} 
        className={`day ${statusClass} ${isSelected ? 'selected' : ''} ${isSelectable ? 'selectable' : 'locked'}`}
        onClick={() => isSelectable && onDateClick(dateStr)}
      >
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
      <div className="days-grid">{days}</div>
    </div>
  );
};

export default MonthCard;