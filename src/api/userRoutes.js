
import { apiClient } from './apiClient';

export const user_routes = {
  
  getAllUsers: () => {
    return apiClient.get("/users"); 
  },

  
  getUser: (id) => {
    return apiClient.get(`/users/${id}`);
  }
};