import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserRoutes } from '../api/userRoutes';
import { useAuth } from '../context/auth-context';
import UserAvatar from './user_avatar';
import Header from './header/header';
import './profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user: authUser } = useAuth();
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await UserRoutes.fetchUser(userId || authUser?.sub);
        setProfileData(user);
      } catch (err) {
        console.error(t('profile_loading_error'), err);
      } finally {
        setLoading(false);
      }
    };
    if (authUser?.sub) loadProfile();
  }, [authUser, userId, t]);

  if (loading) return null;

  const isOwnProfile = !userId || String(userId) === String(authUser?.sub);
  const displayUserId = userId || authUser?.sub;

  return (
    <div className="profile-page-main">
      <Header />
      <h1 className="main-title">{t('profile_title')}</h1>
      
      <div className="profile-header-clean">
        <div className="profile-avatar-main">
          <UserAvatar userId={displayUserId} name={profileData?.nome} size="large" />
        </div>
        <div className="header-text-main">
          <h2>{profileData?.nome}</h2>
          <span className="email-sub">{profileData?.email}</span>
        </div>
      </div>

      <div className="profile-info-box-clean">
        <div className="info-row">
          <label>{t('profile_email')}</label>
          <span>{profileData?.email}</span> 
        </div>

        <div className="info-row">
          <label>{t('profile_birthdate')}</label>
          <span>{profileData?.birthday}</span>
        </div>

        <div className="info-row"> 
          <label>{t('profile_phone')}</label>
          <span>{profileData?.phone_number}</span>
        </div>

        <div className="info-row">
          <label>{t('profile_city')}</label>
          <span>{profileData?.headquarter}</span>
        </div>

        <div className="info-row">
          <label>{t('profile_vacation_days')}</label>
          <span className="vacation-count">{profileData?.dias_ferias_disponiveis ?? 0}</span>
        </div>
      </div>

      {isOwnProfile && (
        <button className="btn-edit-main-blue" onClick={() => navigate("/users/edit-profile")}>
          {t('profile_edit')}
        </button>
      )}
    </div>
  );
};

export default Profile;