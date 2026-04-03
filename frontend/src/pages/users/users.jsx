import { useAuth } from '../../context/auth-context';
import { ROLES } from '../../constants/roles';
import AdminUsersView from './AdminUsersView';
import TeamLeaderUsersView from './TeamLeaderUsersView';

const UsersPage = () => {
  const { user } = useAuth();

  if (user.role === ROLES.ADMIN) {
    return <AdminUsersView />;
  }

  if (user.role === ROLES.TEAM_LEADER) {
    return <TeamLeaderUsersView />;
  }

  // This part technically shouldn't be reached if ProtectedRoute works,
  // but it's good for safety.
  return <div>Acesso Negado</div>;
};

export default UsersPage;