import './users.css';
import  CreateUser from '../../components/user/create_user.jsx';



const Users = () => {
  return (
    <div className="users-page">
      <h1>Gestão de Utilizadores</h1>
      <CreateUser />
    </div>
  );
};

export default Users; 