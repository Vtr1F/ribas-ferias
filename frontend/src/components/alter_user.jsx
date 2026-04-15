import { useState, useEffect } from 'react';
import { UserRoutes } from '../api/userRoutes';
import { TeamRoutes } from '../api/teamRoutes';
import './alter_user.css';
import RemoveButton from './remove_button/remove_button';
import ConfirmModal from './confirm_modal';
import {ROLES} from '../constants/roles.js';


const AlterUser = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    role_id: '3'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fullUserData, setFullUserData] = useState(null);

  const getRoleBall = (roleId) => {
    let color = '#999';
    if (roleId === ROLES.ADMIN) color = '#e74c3c';
    else if (roleId === ROLES.TEAM_LEADER) color = '#f1c40f';
    else if (roleId === ROLES.USER) color = '#2ecc71';
    return <span className="alter-role-ball" style={{ backgroundColor: color }}></span>;
  };

  useEffect(() => {
    loadFullUserData();
  }, [user]);

  const loadFullUserData = async () => {
    try {
      const data = await UserRoutes.fetchUser(user.id);
      setFullUserData(data);
      setFormData({
        role_id: String(data.role_id) || '3'
      });
    } catch (err) {
      console.error('Error loading user:', err);
      setFullUserData(user);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const currentUser = fullUserData || user;
    const birthdayValue = currentUser.birthday 
      ? new Date(currentUser.birthday).toISOString().split('T')[0]
      : null;

    const payload = {
      nome: currentUser.nome,
      email: currentUser.email,
      dias_ferias_disponiveis: currentUser.dias_ferias_disponiveis,
      role_id: parseInt(formData.role_id, 10) || 3,
      superior_id: currentUser.superior_id,
      team_id: currentUser.team_id,
      birthday: birthdayValue,
      phone_number: currentUser.phone_number,
      headquarter: currentUser.headquarter
    };

    try {
      await UserRoutes.alterUser(user.id, payload);
      onSave?.();
      onClose?.();
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Erro ao atualizar utilizador');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setShowConfirm(true);
  };

  const handleConfirmRemove = async () => {
    setLoading(true);
    setError(null);

    try {
      await UserRoutes.removeUser(user.id);
      setShowConfirm(false);
      onSave?.();
      onClose?.();
    } catch (err) {
      console.error('Error removing user:', err);
      setError('Erro ao remover utilizador');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRemove = () => {
    setShowConfirm(false);
  };

  if (!user) return null;

  return (
    <div className="alter-user-overlay">
      <div className="alter-user-modal">
        <div className="alter-user-header">
          <button className="back-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2>Editar Cargo</h2>
          <RemoveButton onClick={handleRemove} disabled={loading} />
        </div>

        <div className="alter-user-profile">
          <div className="profile-avatar">
            {user.nome?.charAt(0).toUpperCase() || '?'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="alter-user-form">
          {error && <div className="alter-user-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="role_id">Cargo</label>
            <div className="role-select-wrapper">
              {getRoleBall(parseInt(formData.role_id))}
              <select
                id="role_id"
                name="role_id"
                value={formData.role_id}
                onChange={handleChange}
              >
                <option value="3">Colaborador</option>
                <option value="2">Responsável</option>
                <option value="1">Administrador</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'A guardar...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
      <ConfirmModal
        isOpen={showConfirm}
        title="Remover Utilizador"
        message="Tem a certeza que deseja remover este utilizador?"
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />
    </div>
  );
};

export default AlterUser;
