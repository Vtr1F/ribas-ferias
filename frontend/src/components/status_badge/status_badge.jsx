import { STATUS_CONFIG } from '../../constants/requestConstants';
import './status_badge.css';

const StatusBadge = ({ status, daltonic }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <span className={`tr-badge ${cfg.className}${daltonic ? ' tr-badge-daltonic' : ''}`}>
      <span className="tr-badge-dot" />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
