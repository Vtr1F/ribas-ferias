
import { apiClient } from './apiClient';

export const LoginRoute = {
  
  loginPost: (data) => {
    return apiClient.request(`/auth/login`,`POST`,data); 
  },

};