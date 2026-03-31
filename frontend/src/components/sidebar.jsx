import './sidebar.css';
import MyLogo from '../assets/logo.png';

function Sidebar() {
  return (
    <aside className="sidebar">
      <img src={MyLogo} alt="Ribas Férias Logo" className="sidebar-logo" />
    </aside>
  );
}

export default Sidebar;