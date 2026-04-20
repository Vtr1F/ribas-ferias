import { useAuth } from '../../context/auth-context';
import UserAvatar from '../user_avatar';
import './header.css';

function Header() {
  const { user } = useAuth();

  return (
    <header className="app-header">
      <UserAvatar userId={user?.sub || user?.id} name={user?.nome} size="small" />
    </header>
  );
}

export default Header;