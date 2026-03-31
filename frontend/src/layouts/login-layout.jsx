import MyLogo from '../assets/logo.png';
import './login-layout.css';

const LoginLayout = ({ children }) => {
  return (
    <div className="login-layout">
      {children}
    </div>
  );
};

export default LoginLayout;