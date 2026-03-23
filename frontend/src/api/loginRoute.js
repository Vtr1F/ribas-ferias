
import { apiClient } from './apiClient';

export const login_routes = {
  
  loginPost: (data) => {
    return apiClient.request(`/auth/login`,`POST`,data); 
  },

};