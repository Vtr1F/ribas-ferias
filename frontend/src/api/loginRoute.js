
import { apiClient } from './apiClient';

export const LoginRoute = {
  
  loginPost: (data) => {
    return apiClient.request(`/auth/login`,`POST`,data); 
  },

  requestPassword: (data) => {
    return apiClient.request(`/auth/password/request`,`POST`,data); 
  },

  updatePassword: (data) => {
    return apiClient.request(`/auth/password/reset`,`POST`,data)
  },

  checkAuth: () => {
    return apiClient.request(`/api/check`,`GET`) 
  },

};