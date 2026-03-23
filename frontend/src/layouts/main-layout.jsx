import Sidebar from '../components/sidebar';


const MainLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex' }}> 
      <Sidebar />
      <div className="main-content" style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default MainLayout;