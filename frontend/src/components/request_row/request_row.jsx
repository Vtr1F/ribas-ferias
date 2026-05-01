import UserAvatar from '../user_avatar';
import StatusBadge from '../status_badge';
import { TYPE_ICONS, TYPE_LABELS } from '../../constants/requestConstants';
import { formatDate } from '../../utils/formatters';
import DaysList from './days_list';
import './request_row.css';

const RequestRow = ({ req, memberMap, showUserInfo = true, showDate = true }) => {
  const member = memberMap[req.user_id];
  return (
    <div className="tr-request-row">
      <div className="tr-req-user">
        <UserAvatar userId={req.user_id} name={member?.nome} size="small" />
        {showUserInfo && (
          <span className="tr-req-name">{member?.nome ?? `#${req.user_id}`}</span>
        )}
      </div>
      <div className="tr-req-type">
        <span className="tr-type-icon">{TYPE_ICONS[req.request_type] || '📋'}</span>
        <span>{TYPE_LABELS[req.request_type] || req.request_type}</span>
      </div>
      <StatusBadge status={req.status} />
      <DaysList days={req.days} />
      <span className="tr-req-count">{req.days?.length ?? 0}d</span>
      {showDate && <span className="tr-req-date">{formatDate(req.created_at)}</span>}
      {req.reason && <span className="tr-req-reason" title={req.reason}>💬 {req.reason}</span>}
    </div>
  );
};

export default RequestRow;
