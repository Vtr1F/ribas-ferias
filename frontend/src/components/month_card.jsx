import './month_card.css';
import { translateStatus, getStatusClass, translateType } from '../utils/translation.js';
import { useTranslation } from 'react-i18next';

const MonthCard = ({ 
  monthIndex, 
  year, 
  vacationMap = {}, 
  selectedDays = [], // Array of YYYYMMDD strings already selected
  onDateClick        // Function passed from parent to handle the click
}) => { 
  const { i18n } = useTranslation();

  const monthLabel = new Date(year, monthIndex, 1).toLocaleString(i18n.language, { month: 'short' });

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    // Use a fixed week that starts on Sunday (2021-08-01 is a Sunday)
    const d = new Date(2021, 7, 1 + i);
    return d.toLocaleString(i18n.language, { weekday: 'short' });
  });

  const firstDayIndex = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const days = [];

  // Empty slots for start of month
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(<div key={`empty-${i}`} className="day empty"></div>);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}${String(monthIndex + 1).padStart(2, '0')}${String(d).padStart(2, '0')}`;

    const requestData = vacationMap[dateStr]; 

    // Check existing status from DB
    const statusClass = getStatusClass(requestData?.status);
  
    const isAbsence = requestData?.type && requestData?.type !== "Vacation";
    const typeClass = isAbsence ? "type-absence" : "type-vacation";

    // Check if user is currently selecting this day in the UI
    const isSelected = selectedDays.includes(dateStr);
    const isSelectable = !status; // Only allow selecting if there's no existing request

    days.push(
      <div 
        key={d} 
        className={`day ${statusClass} ${typeClass} ${isSelected ? 'selected' : ''} ${isSelectable ? 'selectable' : 'locked'}`}
        onClick={() => isSelectable && onDateClick(dateStr)}
      >
        {d}
        {isAbsence && <span className="absence-indicator"></span>}

        {requestData && (
          <div className="day-tooltip">
            <div className="tooltip-header">
                {/* Translate the type and status labels */}
                <strong>{translateType(requestData.type)}</strong>
                <span className={`badge ${statusClass}`}>
                  {translateStatus(requestData.status)}
                </span>
            </div>
            {requestData.reason && (
              <div className="tooltip-reason">"<em>{requestData.reason}</em>"</div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="calendar-card">
      <div className="card-header">
        <span className="month-label">{monthLabel}</span>
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