import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserRoutes } from '../api/userRoutes';
import { useAuth } from '../context/auth-context';
import './profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user: authUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await UserRoutes.fetchUser(userId || authUser?.sub);
        setProfileData(user);
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setLoading(false);
      }
    };
    if (authUser?.sub) loadProfile();
  }, [authUser, userId]);


  if (loading) return null;

  const renderBackHeader = (title, backAction) => (
    <div className="edit-header">
      <button className="back-arrow-btn" onClick={backAction}>
        <span className="arrow-icon">←</span>
      </button>
      <h1 className="main-title">{title}</h1>
    </div>
  );

 

  const isOwnProfile = !userId || String(userId) === String(authUser?.sub);

  return (
    <div className="profile-page-main">
      <h1 className="main-title">Perfil</h1>
      <div className="profile-header-clean">
        <div className="profile-avatar-main">
          {profileData?.nome ? profileData.nome.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="header-text-main">
          <h2>{profileData?.nome}</h2>
          <span className="email-sub">{profileData?.email}</span>
        </div>
      </div>
      <div className="profile-info-box-clean">
        <div className="info-row">
          <label>Email</label>
          <span>{profileData?.email}</span>
        </div>
        <div className="info-row">
          <label>Dias de Férias</label>
          <span className="vacation-count">{profileData?.dias_ferias_disponiveis ?? 0}</span>
        </div>
      </div>
      {isOwnProfile && (
        <button className="btn-edit-main-blue" onClick={() => navigate("/users/edit-profile")}>Editar Perfil</button>
      )}
    </div>
  );
};

export default Profile;