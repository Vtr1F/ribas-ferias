import { useState, useEffect } from 'react';
import { TYPE_ICONS } from '../../constants/requestConstants';
import { translateType, translateStatus } from '../../utils/translation';
import { useTranslation } from 'react-i18next';
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


const RequestDetailOverlay = ({ req, member, onClose, onDecision, isLoading, showUserInfo = true, daltonic }) => {
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

  const { t } = useTranslation();

  if (!req) return null;

  return (
    <div className={`tr-modal-overlay${daltonic ? ' tr-daltonic' : ''}`} onClick={onClose}>
      <div className="tr-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tr-modal-header">
          <h2>{t('request_details_title')}</h2>
          <button className="tr-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="tr-modal-body">
          {showUserInfo ? (
            <div className="tr-detail-user">
              <UserAvatar userId={req.user_id} name={member?.nome} size="large" />
              <div className="tr-detail-user-info">
                <h3>{member?.nome || `${t('user')} #${req.user_id}`}</h3>
                <p>{member?.email || t('no_email_available')}</p>
              </div>
            </div>
          ) : (
            <div className="tr-detail-user">
              <UserAvatar userId={req.user_id} name={member?.nome} size="large" />
            </div>
          )}

          <div className="tr-detail-grid">
            <div className="tr-detail-item">
              <strong>{t('table_type')}:</strong>
              <span> {TYPE_ICONS[req.request_type]} {translateType(req.request_type)}</span>
            </div>
            <div className="tr-detail-item">
              <strong>{t('table_status')}:</strong> <StatusBadge status={req.status} daltonic={daltonic} />
            </div>
            <div className="tr-detail-item">
              <strong>{t('submitted_on')}:</strong> {formatDate(req.created_at)}
            </div>
            <div className="tr-detail-item">
              <strong>{t('duration')}:</strong> {req.days?.length} {t('days')}
            </div>
            <div className="tr-detail-item">
              {req.file_path && (
                  <button
                  className="tr-btn-approve"
                  disabled={isLoading}
                  onClick={() => Download(req.file_path)}
                >
                  {isLoading ? t('processing') : t('download')}
                </button>
              )}
            </div>
          </div>

          <div className="tr-detail-days-section">
            <strong>{t('table_days')}:</strong>
            <div className="tr-detail-days-grid">
              {req.days?.map(d => <span key={d} className="tr-day-chip">{formatDay(d)}</span>)}
            </div>
          </div>


          <div className="tr-conflicting-requests">
              
              {conflictsLoading ? (
                <p> </p>
              ) : conflicts.length > 0 ? (
                <div className="tr-conflicts-list">
                  <strong>{t('conflict_vacation_title')}</strong>
                  {conflicts.map(conflict => (
                    <div key={conflict.id} className="tr-conflict-item">
                      <div className="tr-detail-user">
                        <UserAvatar userId={conflict.user_id} name={userCache[conflict.user_id]?.nome} size="large" />
                          <div className="tr-detail-user-info">
                            <h3>{userCache[conflict.user_id]?.nome || `Utilizador #${conflict.user_id}`}</h3>
                            <p>{userCache[conflict.user_id]?.email || t('no_email_available')}</p>
                        </div>
                      </div>
                      <span>{TYPE_ICONS[conflict.request_type]} {translateType(conflict.request_type)} </span>
                      <div className="tr-detail-days-grid">
                        {conflict.days?.map(d => <span key={d} className="tr-day-chip">{formatDay(d)}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>



          {req.reason && (
            <div className="tr-detail-reason">
              <strong>{t('reason_label')}:</strong>
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
              {isLoading ? t('processing') : t('btn_reject')}
            </button>
            <button
              className="tr-btn-approve"
              disabled={isLoading}
              onClick={() => onDecision(req.id, 'accept')}
            >
              {isLoading ? t('processing') : t('btn_approve')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestDetailOverlay;
