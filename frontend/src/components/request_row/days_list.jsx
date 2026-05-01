import { useState } from 'react';
import { formatDay } from '../../utils/formatters';
import './request_row.css';

const DaysList = ({ days }) => {
  const [expanded, setExpanded] = useState(false);
  const MAX = 2;
  const formatted = (days || []).map(formatDay);
  const shown = expanded ? formatted : formatted.slice(0, MAX);
  const rest = formatted.length - MAX;

  return (
    <div className="tr-days-list">
      {shown.map((d, i) => (
        <span key={i} className="tr-day-chip">{d}</span>
      ))}
      {!expanded && rest > 0 && (
        <button className="tr-expand-btn" onClick={() => setExpanded(true)}>
          +{rest}
        </button>
      )}
    </div>
  );
};

export default DaysList;
