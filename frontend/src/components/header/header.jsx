import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Header.css';
import { useAuth } from '../../context/auth-context';
import { countUnreadNotifications, markNotificationRead, fetchNotifications } from '../../api/notificationRoutes';
import UserAvatar from '../user_avatar/user_avatar';

function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [notifCount, setNotifCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const userId = user?.sub || user?.id;

  useEffect(() => {
    if (userId && (user?.role === 1 || user?.role === 2)) {
      const fetchNotifCount = async () => {
        try {
          const count = await countUnreadNotifications(userId);
          setNotifCount(count);
        } catch (err) {
          console.error('Failed to fetch notification count', err);
        }
      };
      fetchNotifCount();
      const interval = setInterval(fetchNotifCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userId, user?.role]);

  const handleShowNotifications = async () => {
    if (!showNotifs && userId) {
      try {
        const notifs = await fetchNotifications(userId);
        setNotifications(notifs);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    }
    setShowNotifs(!showNotifs);
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.lida) {
      await markNotificationRead(notif.id);
      setNotifCount(prev => Math.max(0, prev - 1));
    }
    if (notif.link_pedido) {
      navigate(`/equipas?request=${notif.link_pedido}`);
    }
    setShowNotifs(false);
  };

  if (!userId || (user?.role !== 1 && user?.role !== 2)) {
    return null;
  }

  return (
    <header className="app-header">
      <div className="notification-container">
        <button className="notification-bell" onClick={handleShowNotifications}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          {notifCount > 0 && <span className="notification-badge">{notifCount}</span>}
        </button>

        {showNotifs && (
          <div className="notification-dropdown">
            <div className="notification-header">
              <h4>Notificações</h4>
            </div>
            <div className="notification-list">
              {notifications.length === 0 ? (
                <p className="no-notifications">Sem notificações</p>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`notification-item ${!notif.lida ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <p>{notif.mensagem}</p>
                    <span className="notification-date">
                      {new Date(notif.created_at).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      <UserAvatar userId={userId} name={user?.nome} size="small" />
    </header>
  );
}

export default Header;