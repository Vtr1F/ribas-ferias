import { jwtDecode } from 'jwt-decode';

const BASE_URL = "http://localhost:3000"; 

const getCookieValue = (name) => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const parts = cookie.trim().split('=');
    const cookieName = parts[0];
    const value = parts.slice(1).join('=');
    if (cookieName === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
};

const isTokenExpired = () => {
  const token = getCookieValue('token');
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
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
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const apiClient = {
  
  request: async (endpoint, method = 'GET', body = null) => {
    
    try {
      const isLoginPage = window.location.pathname === '/login';
      if (isTokenExpired() && !isLoginPage) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          window.location.href = '/login';
          return { err: true, message: 'Unauthorized' };
        }
      }

      const options = {
        method: method.toUpperCase(), 
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      };

      if (body) { 
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, options);

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      return true;
    } catch (err) {
      console.error("Falha na ligação:", err);
      throw err;
    }
  }
};


