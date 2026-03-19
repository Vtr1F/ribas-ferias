
import { apiClient } from './apiClient';

export const user_routes = {
  
  getAllUsers: () => {
    return apiClient.get(`/users`,`POST`); 
  },

  
  getUser: (id) => {
    return apiClient.get(`/users/${id}`,`POST`);
  }
};