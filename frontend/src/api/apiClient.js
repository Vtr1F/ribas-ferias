import { useAuth } from "../context/auth-context";

const BASE_URL = "http://localhost:3000"; 
const getExp = () => localStorage.getItem('auth_exp');

const isTokenExpired = () => {
  
  console.log(user);
  if (!user) return true;
  try {
    return user.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const refreshToken = async () => {
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    });
    if (response.ok) {
      const data = await response.json();
      if (data.exp) localStorage.setItem('auth_exp', data.exp);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

const handleGlobalLogout = () => {
  localStorage.removeItem('auth_exp');
  window.location.href = '/login';
};

export const apiClient = {
  
  request: async (endpoint, method = 'GET', body = null, isFormData = false) => {
    
      const isLoginPage = endpoint.includes('/login');
      const exp = getExp();
      
      if (!isLoginPage && exp && (parseInt(exp) * 1000 < Date.now())) {
      const refreshed = await refreshToken();
      if (!refreshed) {
        handleGlobalLogout();
        return { err: true, message: 'Session Expired' };
      }
    }

      const options = {
        method: method.toUpperCase(), 
        headers: isFormData ? {} : {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      };

      if (body) { 
        options.body = isFormData ? body : JSON.stringify(body);
      }
    
    try {
      let response = await fetch(`${BASE_URL}${endpoint}`, options);

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");

      if (contentType && (contentType.includes("application/pdf") || contentType.includes("octet-stream"))) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = endpoint.split('/').pop(); // Suggest the filename
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return true;
      }

      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      if (contentType && contentType.includes("image")) {
        return response.blob();
      }

      return true;
    } catch (err) {
      console.error("Falha na ligação:", err);
      throw err;
    }
  }
};


