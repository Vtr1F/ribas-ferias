import { TYPE_LABELS, TYPE_ICONS } from '../../constants/requestConstants';
import { formatDate, formatDay } from '../../utils/formatters';
import StatusBadge from '../status_badge';
import UserAvatar from '../user_avatar';
import { RequestRoutes } from '../../api/requestRoutes';
import './request_detail_overlay.css';

function Download(filePath) {
  const fileName = filePath.split(/[\\/]/).pop();
  RequestRoutes.downloadFile(fileName);
}

const RequestDetailOverlay = ({ req, member, onClose, onDecision, isLoading, showUserInfo = true }) => {
  if (!req) return null;

  return (
    <div className="tr-modal-overlay" onClick={onClose}>
      <div className="tr-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tr-modal-header">
          <h2>Detalhes do Pedido</h2>
          <button className="tr-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="tr-modal-body">
          {showUserInfo ? (
            <div className="tr-detail-user">
              <UserAvatar userId={req.user_id} name={member?.nome} size="large" />
              <div className="tr-detail-user-info">
                <h3>{member?.nome || `Utilizador #${req.user_id}`}</h3>
                <p>{member?.email || 'Sem email disponível'}</p>
              </div>
            </div>
          ) : (
            <div className="tr-detail-user">
              <UserAvatar userId={req.user_id} name={member?.nome} size="large" />
            </div>
          )}

          <div className="tr-detail-grid">
            <div className="tr-detail-item">
              <strong>Tipo:</strong>
              <span> {TYPE_ICONS[req.request_type]} {TYPE_LABELS[req.request_type] || req.request_type}</span>
            </div>
            <div className="tr-detail-item">
              <strong>Estado:</strong> <StatusBadge status={req.status} />
            </div>
            <div className="tr-detail-item">
              <strong>Submetido em:</strong> {formatDate(req.created_at)}
            </div>
            <div className="tr-detail-item">
              <strong>Duração:</strong> {req.days?.length} dias
            </div>
            <div className="tr-detail-item">
              {req.file_path && (
                <button
                  className="tr-btn-approve"
                  disabled={isLoading}
                  onClick={() => Download(req.file_path)}
                >
                  {isLoading ? 'A processar...' : 'Download'}
                </button>
              )}
            </div>
          </div>

          <div className="tr-detail-days-section">
            <strong>Dias Solicitados:</strong>
            <div className="tr-detail-days-grid">
              {req.days?.map(d => <span key={d} className="tr-day-chip">{formatDay(d)}</span>)}
            </div>
          </div>

          {req.reason && (
            <div className="tr-detail-reason">
              <strong>Motivo / Justificação:</strong>
              <p>{req.reason}</p>
            </div>
          )}
        </div>

        {showUserInfo && req.status === 'Pending' && (
          <div className="tr-modal-footer">
            <button
              className="tr-btn-reject"
              disabled={isLoading}
              onClick={() => onDecision(req.id, 'reject')}
            >
              {isLoading ? 'A processar...' : 'Rejeitar'}
            </button>
            <button
              className="tr-btn-approve"
              disabled={isLoading}
              onClick={() => onDecision(req.id, 'accept')}
            >
              {isLoading ? 'A processar...' : 'Aprovar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestDetailOverlay;
