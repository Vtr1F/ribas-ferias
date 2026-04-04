import { useState, useEffect } from 'react';
import { UserRoutes } from '../api/userRoutes';
import './alter_user.css';

const AlterUser = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    dias_ferias_disponiveis: 0,
    role_id: 3
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRoleIdFromRole = (role) => {
    const roleLower = role?.toLowerCase();
    if (roleLower === 'admin') return 1;
    if (roleLower === 'leader') return 2;
    return 3;
  };

  const getRoleBall = (roleId) => {
    let color = '#999';
    if (roleId === 1) color = '#e74c3c';
    else if (roleId === 2) color = '#f1c40f';
    else if (roleId === 3) color = '#2ecc71';
    return <span className="alter-role-ball" style={{ backgroundColor: color }}></span>;
  };

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || '',
        email: user.email || '',
        dias_ferias_disponiveis: user.dias_ferias_disponiveis || 0,
        role_id: user.role_id || getRoleIdFromRole(user.role)
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'role_id' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        nome: formData.nome,
        email: formData.email,
        dias_ferias_disponiveis: parseInt(formData.dias_ferias_disponiveis) || 0,
        role_id: parseInt(formData.role_id) || 3,
        superior_id: user.superior_id,
        team_id: user.team_id
      };

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
          <h2>Editar Utilizador</h2>
        </div>

        <div className="alter-user-profile">
          <div className="profile-avatar">
            {user.nome?.charAt(0).toUpperCase() || '?'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="alter-user-form">
          {error && <div className="alter-user-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role_id">Cargo</label>
              <div className="role-select-wrapper">
                {getRoleBall(formData.role_id)}
                <select
                  id="role_id"
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                >
                  <option value={3}>Colaborador</option>
                  <option value={2}>Responsável</option>
                  <option value={1}>Administrador</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dias_ferias_disponiveis">Dias de Férias</label>
              <input
                type="number"
                id="dias_ferias_disponiveis"
                name="dias_ferias_disponiveis"
                value={formData.dias_ferias_disponiveis}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />
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
    </div>
  );
};

export default AlterUser;
