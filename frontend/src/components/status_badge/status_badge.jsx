import { STATUS_CONFIG } from '../../constants/requestConstants';
import './status_badge.css';

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <span className={`tr-badge ${cfg.className}`}>
      <span className="tr-badge-dot" />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
