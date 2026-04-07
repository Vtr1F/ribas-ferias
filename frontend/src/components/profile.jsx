import React, { useState, useEffect } from 'react';
import { UserRoutes } from '../api/userRoutes';
import { useAuth } from '../context/auth-context';
import './profile.css';

const Profile = () => {
  const { user: authUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ morada: '', telemovel: '' });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const users = await UserRoutes.getAllUsers();
        const current = users.find(u => String(u.id) === String(authUser?.sub));
        setProfileData(current);
        setFormData({
          morada: current?.morada || '',
          telemovel: current?.telemovel || ''
        });
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setLoading(false);
      }
    };
    if (authUser?.sub) loadProfile();
  }, [authUser]);

  if (loading) return null;

  // --- VISTA DE EDIÇÃO ---
  if (isEditing) {
    return (
      <div className="profile-page-main">
        <div className="edit-header">
          <button className="back-arrow" onClick={() => setIsEditing(false)}>←</button>
          <h1 className="main-title">Editar perfil</h1>
        </div>

        <div className="profile-header-clean">
          <div className="avatar-wrapper">
            <div className="profile-avatar-main">
              {profileData?.nome?.charAt(0).toUpperCase()}
            </div>
            <button className="edit-photo-icon">✎</button>
          </div>
          <h2>{profileData?.nome}</h2>
        </div>

        <div className="edit-form-container">
          <div className="input-group">
            <label>Email</label>
            <input type="text" value={profileData?.email} disabled className="input-disabled" />
          </div>

          
          <button className="btn-password">Alterar Password</button>

          <div className="form-actions">
            <button className="btn-cancel" onClick={() => setIsEditing(false)}>Cancelar</button>
            <button className="btn-save" onClick={() => setIsEditing(false)}>Salvar</button>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA DE VISUALIZAÇÃO ---
  return (
    <div className="profile-page-main">
      <h1 className="main-title">Perfil</h1>

      <div className="profile-header-clean">
        <div className="profile-avatar-main">
          {profileData?.nome?.charAt(0).toUpperCase()}
        </div>
        <div className="header-text-main">
          <h2>{profileData?.nome}</h2>
          <span className="role-badge">COLABORADOR</span>
        </div>
      </div>

      <div className="profile-info-box">
        <div className="detail-row">
          <label>Email</label>
          <span className="value">{profileData?.email}</span>
        </div>
        <div className="detail-row">
          <label>Numero Telemovel</label>
          <span className="value">{profileData?.telemovel || '99123123'}</span>
        </div>
        <div className="detail-row">
          <label>Dias de Férias</label>
          <span className="value emphasis">{profileData?.dias_ferias_disponiveis ?? 0}</span>
        </div>
      </div>

      <button className="btn-edit-main" onClick={() => setIsEditing(true)}>
        Editar Perfil
      </button>
    </div>
  );
};

export default Profile;