import { useState, useEffect } from 'react';
import './user_avatar.css';
import { UserRoutes } from '../../api/userRoutes';

const UserAvatar = ({ userId, name, size = 'medium' }) => {
  const [imgUrl, setImgUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    UserRoutes.getUserImage(userId)
      .then(blob => {
        const url = URL.createObjectURL(blob);
        setImgUrl(url);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [userId]);

  const sizeClasses = {
    small: 'avatar-small',
    medium: 'avatar-medium',
    large: 'avatar-large'
  };

  if (loading) {
    return (
      <div className={`user-avatar ${sizeClasses[size]}`}>
        <span>{name?.charAt(0).toUpperCase() || '?'}</span>
      </div>
    );
  }

  return (
    <div className={`user-avatar ${sizeClasses[size]}`}>
      {imgUrl ? (
        <img src={imgUrl} alt={name} />
      ) : (
        <span>{name?.charAt(0).toUpperCase() || '?'}</span>
      )}
    </div>
  );
};

export default UserAvatar;