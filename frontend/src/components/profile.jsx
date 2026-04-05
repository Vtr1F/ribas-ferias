import { useAuth } from '../context/auth-context';
import './profile.css'

function Profile() {
  const { user } = useAuth();
  console.log("Amanha ao meio dia eu vou almocar");
  return (
    <main className="profile-content">
      <h1>Perfil</h1>
      <p>User ID: {user?.sub}</p>
      <p>Role: {user?.role}</p>
    </main>
  );
}

export default Profile;