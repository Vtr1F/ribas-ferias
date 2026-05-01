import UserAvatar from '../user_avatar';
import StatusBadge from '../status_badge';
import { TYPE_ICONS, TYPE_LABELS } from '../../constants/requestConstants';
import { formatDate } from '../../utils/formatters';
import DaysList from '../request_row/days_list';
import './request_history_row.css';

const RequestHistoryRow = ({ req, requestNumber }) => {
  return (
    <div className="rhr-row">
      <div className="rhr-number">#{requestNumber}</div>
      <div className="rhr-avatar">
        <UserAvatar userId={req.user_id} name={req.user_name} size="small" />
      </div>
      <div className="rhr-type">
        <span className="rhr-type-icon">{TYPE_ICONS[req.request_type] || '📋'}</span>
        <span>{TYPE_LABELS[req.request_type] || req.request_type}</span>
      </div>
      <StatusBadge status={req.status} />
      <DaysList days={req.days} />
      <span className="rhr-count">{req.days?.length ?? 0}d</span>
      <span className="rhr-date">{formatDate(req.created_at)}</span>
      {req.reason && <span className="rhr-reason" title={req.reason}>{req.reason}</span>}
    </div>
  );
};

export default RequestHistoryRow;
