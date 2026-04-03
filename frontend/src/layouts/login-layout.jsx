import MyLogo from '../assets/logo.png';
import './login-layout.css';

const LoginLayout = ({ children }) => {
  return (
    <div className="login-layout">
      <img src={MyLogo} alt="Ribas Férias Logo" className="login-logo" />
      {children}
    </div>
  );
};

export default LoginLayout;