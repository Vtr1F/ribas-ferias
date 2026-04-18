// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { LoginRoute } from '../api/loginRoute';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (window.location.pathname === '/login') {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const userData = await LoginRoute.checkAuth(); 
        setUser(userData); 
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);