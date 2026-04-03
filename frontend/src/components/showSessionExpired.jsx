import { createRoot } from 'react-dom/client';
import SessionExpired from './session-expired';

export const showSessionExpired = () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  
  const root = createRoot(container);
  root.render(<SessionExpired />);
  
  setTimeout(() => {
    window.location.href = '/login';
  }, 3000);
};
