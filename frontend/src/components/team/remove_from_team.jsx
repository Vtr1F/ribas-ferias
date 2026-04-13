import { useState } from 'react';
import { UserRoutes } from '../../api/userRoutes';
import ConfirmModal from '../confirm_modal';
import './remove_from_team.css';

const RemoveFromTeam = ({ team, users, onClose, onSave }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const teamUsers = users.filter(u => 
    u.team_id === team.id || 
    u.superior_id === team.leader_id
  );

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
        await UserRoutes.alterUser(userId, {
          nome: users.find(u => u.id === userId)?.nome,
          email: users.find(u => u.id === userId)?.email,
          dias_ferias_disponiveis: users.find(u => u.id === userId)?.dias_ferias_disponiveis,
          role_id: users.find(u => u.id === userId)?.role_id,
          superior_id: null,
          team_id: null,
          birthday: users.find(u => u.id === userId)?.birthday,
          phone_number: users.find(u => u.id === userId)?.phone_number,
          headquarter: users.find(u => u.id === userId)?.headquarter
        });
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
                    {user.nome?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user.nome}</span>
                    <span className="user-email">{user.email}</span>
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
