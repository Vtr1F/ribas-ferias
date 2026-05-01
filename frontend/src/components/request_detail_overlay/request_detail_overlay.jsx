import { useState, useEffect } from 'react';
import { TYPE_LABELS, TYPE_ICONS } from '../../constants/requestConstants';
import { formatDate, formatDay } from '../../utils/formatters';
import StatusBadge from '../status_badge';
import UserAvatar from '../user_avatar';
import { RequestRoutes } from '../../api/requestRoutes';
import { UserRoutes } from '../../api/userRoutes';
import './request_detail_overlay.css';


function Download(filePath) {
  const fileName = filePath.split(/[\\/]/).pop();
  RequestRoutes.downloadFile(fileName);
}

async function getConflicts(id){
  return await RequestRoutes.fetchConflictingRequests(id);
}

async function getUser(id){
  return await UserRoutes.fetchUser(id);
}


const RequestDetailOverlay = ({ req, member, onClose, onDecision, isLoading, showUserInfo = true }) => {
  const [conflicts, setConflicts] = useState([]);
  const [conflictsLoading, setConflictsLoading] = useState(false);
  const [userCache, setUserCache] = useState({});

  useEffect(() => {
    const fetchConflicts = async () => {
      if (!req?.id) return;
      try {
        setConflictsLoading(true);
        const conflictsList = await getConflicts(req.id);
        setConflicts(conflictsList || []);
      } catch (error) {
        console.error('Error fetching conflicts:', error);
        setConflicts([]);
      } finally {
        setConflictsLoading(false);
      }
    };

    fetchConflicts();
  }, [req?.id]);

  useEffect(() => {
    const fetchUsers = async () => {
      const userIds = conflicts.map(c => c.user_id);
      const users = await Promise.all(userIds.map(id => getUser(id)));
      const cache = {};
      userIds.forEach((id, idx) => {
        cache[id] = users[idx];
      });
      setUserCache(cache);
    };
    if (conflicts.length > 0) fetchUsers();
  }, [conflicts]);

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


          <div className="tr-conflicting-requests">
              <strong>Conflicto de Ferias:</strong>
              {conflictsLoading ? (
                <p>A carregar...</p>
              ) : conflicts.length > 0 ? (
                <div className="tr-conflicts-list">
                  {conflicts.map(conflict => (
                    <div key={conflict.id} className="tr-conflict-item">
                      <div className="tr-detail-user">
                        <UserAvatar userId={conflict.user_id} name={userCache[conflict.user_id]?.nome} size="large" />
                          <div className="tr-detail-user-info">
                            <h3>{userCache[conflict.user_id]?.nome || `Utilizador #${conflict.user_id}`}</h3>
                            <p>{userCache[conflict.user_id]?.email || 'Sem email disponível'}</p>
                        </div>
                      </div>
                      <span>{TYPE_ICONS[conflict.request_type]} {TYPE_LABELS[conflict.request_type] || conflict.request_type} </span>
                      <div className="tr-detail-days-grid">
                        {conflict.days?.map(d => <span key={d} className="tr-day-chip">{formatDay(d)}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Sem pedidos conflitantes</p>
              )}
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
