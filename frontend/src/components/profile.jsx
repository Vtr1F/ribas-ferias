import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserRoutes } from '../api/userRoutes';
import { useAuth } from '../context/auth-context';
import './profile.css';

const Profile = () => {
  const { userId } = useParams();
  const { user: authUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const users = await UserRoutes.getAllUsers();
        const targetId = userId || authUser?.sub;
        const current = users.find(u => String(u.id) === String(targetId));
        setProfileData(current);
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setLoading(false);
      }
    };
    if (authUser?.sub) loadProfile();
  }, [authUser, userId]);

  const handlePasswordUpdate = async () => {
    if (passwords.next !== passwords.confirm) {
      alert("As passwords não coincidem!");
      return;
    }
    try {
      // Ajuste de URL para garantir consistência com o backend Rust
      const response = await fetch('http://localhost:3000/password/reset', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: Number(authUser.sub), 
          newPassword: passwords.next
        })
      });

      if (response.ok) {
        alert("Password alterada com sucesso!");
        setIsChangingPassword(false);
        setPasswords({ current: '', next: '', confirm: '' });
      } else {
        alert("Erro de ligação ao servidor.");
      }
    } catch (err) {
      alert("Erro de ligação ao servidor.");
    }
  };

  if (loading) return null;

  const renderBackHeader = (title, backAction) => (
    <div className="edit-header">
      <button className="back-arrow-btn" onClick={backAction}>
        <span className="arrow-icon">←</span>
      </button>
      <h1 className="main-title">{title}</h1>
    </div>
  );

  if (isChangingPassword) {
    return (
      <div className="profile-page-main">
        {renderBackHeader("Alterar Password", () => setIsChangingPassword(false))}
        <div className="edit-form-container">
          <div className="input-group">
            <label>Password Atual</label>
            <input type="password" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Nova Password</label>
            <input type="password" value={passwords.next} onChange={(e) => setPasswords({...passwords, next: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Confirmar Nova Password</label>
            <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} />
          </div>
          <div className="form-actions">
            <button className="btn-cancel-outline" onClick={() => setIsChangingPassword(false)}>Cancelar</button>
            <button className="btn-save-blue" onClick={handlePasswordUpdate}>Salvar</button>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="profile-page-main">
        {renderBackHeader("Editar perfil", () => setIsEditing(false))}
        <div className="profile-header-clean">
          <div className="avatar-wrapper">
            <div className="profile-avatar-main">
              {profileData?.nome ? profileData.nome.charAt(0).toUpperCase() : 'U'}
            </div>
            <button className="edit-photo-badge">✎</button>
          </div>
          <h2 className="profile-name-edit">{profileData?.nome}</h2>
        </div>
        <div className="edit-form-container">
          <div className="input-group">
            <label>Email</label>
            <input type="text" value={profileData?.email || ''} disabled className="input-disabled" />
          </div>
          <button className="btn-password-inline" onClick={() => { setIsEditing(false); setIsChangingPassword(true); }}>
            Alterar Password
          </button>
          <div className="form-actions">
            <button className="btn-cancel-outline" onClick={() => setIsEditing(false)}>Cancelar</button>
            <button className="btn-save-blue" onClick={() => setIsEditing(false)}>Salvar</button>
          </div>
        </div>
      </div>
    );
  }

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
        <button className="btn-edit-main-blue" onClick={() => setIsEditing(true)}>Editar Perfil</button>
      )}
    </div>
  );
};

export default Profile;