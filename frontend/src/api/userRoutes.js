
import { apiClient } from './apiClient';

export const user_routes = {
  
  getAllUsers: () => {
    return apiClient.request(`/api/user`,`GET`); 
  },

  addUser: (data) => {
    return apiClient.request(`/api/user`,`POST`,data); 
  },
  
  fetchUser: (id) => {
    return apiClient.request(`/api/user/${id}`,`GET`);
  },

  alterUser: (id,data) => {
    return apiClient.request(`/api/user/${id}`,`PUT`,data);
  },

  removeUser: (id) => {
    return apiClient.request(`/api/user/${id}`,`DELETE`);
  }
};