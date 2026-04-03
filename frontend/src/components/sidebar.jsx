import './sidebar.css';
import MyLogo from '../assets/logo.png';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { ROLES } from '../constants/roles';

function Sidebar() {
  const { user } = useAuth();
  return (
    <aside className="sidebar">
      <img src={MyLogo} alt="Ribas Férias Logo" className="sidebar-logo" />
      <nav>
        <Link to="/dashboard">Dashboard</Link>
    
        {/* Only show the link if they aren't a normal user */}
        {(user.role === ROLES.ADMIN || user.role === ROLES.TEAM_LEADER) && (
          <Link to="/users">Manage Users</Link>
    )}
  </nav>
    </aside>
  );
}

export default Sidebar;