import { UserRoutes } from '../api/userRoutes';
import MainLayout from '../layouts/main-layout';
import './dashboard.css'

const response = await UserRoutes.getAllUsers();

function Users() {
  return (
    <MainLayout>
      <main>
        <h1>Ribas Férias</h1>
      </main>
    </MainLayout>
  );
}

export default Users;