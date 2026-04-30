import { useState } from 'react';
import './confirm_modal.css';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmClass }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="confirm-overlay">
      <div className="confirm-modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="cancel-btn" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button 
            /* Aqui usamos a classe dinâmica que vem do TeamRequests */
            className={`confirm-btn ${confirmClass || ''}`} 
            onClick={handleConfirm} 
            disabled={loading}
          >
            {loading ? 'A processar...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
