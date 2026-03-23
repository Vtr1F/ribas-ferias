
import { apiClient } from './apiClient';

export const user_routes = {
  
  getAllUsers: () => {
    return apiClient.request(`/api/users`,`GET`); 
  },

  addUser: (data) => {
    return apiClient.request(`/api/users`,`POST`,data); 
  },
  
  fetchUser: (id) => {
    return apiClient.request(`/api/users/${id}`,`GET`);
  },

  alterUser: (id,data) => {
    return apiClient.request(`/api/users/${id}`,`PUT`,data);
  },

  removeUser: (id) => {
    return apiClient.request(`/api/users/${id}`,`DELETE`);
  }
};