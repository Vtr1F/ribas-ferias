import { useState } from 'react';
import { TeamRoutes } from '../../api/teamRoutes';
import { ROLES } from '../../constants/roles';
import ConfirmModal from '../confirm_modal';
import UserAvatar from '../user_avatar/user_avatar';
import './remove_from_team.css';

const RemoveFromTeam = ({ team, users, onClose, onSave }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const teamUsers = team.members || [];

  const getRoleLabel = (role) => {
    if (role === ROLES.ADMIN) return 'Administrador';
    if (role === ROLES.TEAM_LEADER) return 'Responsável';
    return 'Colaborador';
  };

  const getRoleColor = (role) => {
    if (role === ROLES.ADMIN) return '#e74c3c';
    if (role === ROLES.TEAM_LEADER) return '#f1c40f';
    return '#2ecc71';
  };

  const toggleUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleConfirmRemove = async () => {
    setLoading(true);
    setError('');

    try {
      for (const userId of selectedUsers) {
        await TeamRoutes.removeFromTeam(team.id, userId);
      }
      setShowConfirm(false);
      onSave?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      setError('Erro ao remover utilizadores da equipa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="remove-from-team-overlay">
      <div className="remove-from-team-modal">
        <div className="remove-from-team-header">
          <button className="back-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2>Remover de {team.team_name}</h2>
        </div>

        <div className="remove-from-team-content">
          {error && <div className="remove-from-team-error">{error}</div>}
          
          <p className="remove-instructions">Selecione os utilizadores a remover da equipa:</p>
          
          {teamUsers.length === 0 ? (
            <p className="no-users">Não há utilizadores nesta equipa</p>
          ) : (
            <div className="user-list">
              {teamUsers.map(user => (
                <div 
                  key={user.id} 
                  className={`user-item ${selectedUsers.includes(user.id) ? 'selected' : ''}`}
                  onClick={() => toggleUser(user.id)}
                >
                  <div className="user-checkbox">
                    {selectedUsers.includes(user.id) && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                  <div className="user-avatar">
                    <UserAvatar userId={user.id} name={user.nome} size="small" />
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user.nome}</span>
                    <span className="user-email">{user.email}</span>
                    <span className="user-role" style={{ color: getRoleColor(user.role_id) }}>{getRoleLabel(user.role_id)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="remove-from-team-footer">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button 
            type="button" 
            className="remove-btn" 
            disabled={loading || selectedUsers.length === 0}
            onClick={() => setShowConfirm(true)}
          >
            {loading ? 'A remover...' : `Remover ${selectedUsers.length} Utilizador${selectedUsers.length !== 1 ? 'es' : ''}`}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Confirmar Remoção"
        message={`Tem a certeza que deseja remover ${selectedUsers.length} utilizador${selectedUsers.length !== 1 ? 'es' : ''} da equipa?`}
        onConfirm={handleConfirmRemove}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default RemoveFromTeam;
