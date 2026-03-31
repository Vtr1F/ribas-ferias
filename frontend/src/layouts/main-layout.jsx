import Sidebar from '../components/sidebar';
import { Outlet } from 'react-router-dom';
import './main-layout.css';


const MainLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="content">
        <Outlet /> {/* Layout Rendering */}
        {children}
      </main>
    </div>
  );
};

export default MainLayout;