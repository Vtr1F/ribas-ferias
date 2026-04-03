// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { LoginRoute } from '../api/loginRoute'; // Assuming you have a getMe or profile call here

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Call your "get user info" endpoint here
        // The backend should read the JWT from the cookie automatically
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