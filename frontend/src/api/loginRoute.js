
import { apiClient } from './apiClient';

export const login_routes = {
  
  fetchTypes: (data) => {
    return apiClient.request(`/auth/login`,`POST`,data); 
  },

};