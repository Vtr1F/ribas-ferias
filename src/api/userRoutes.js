
import { apiClient } from './apiClient';

export const user_routes = {
  
  getAllUsers: () => {
    return apiClient.request(`/user`,`GET`); 
  },

  addUser: (data) => {
    return apiClient.request(`/user`,`POST`,data); 
  },
  
  fetchUser: (id) => {
    return apiClient.request(`/user/${id}`,`GET`);
  },

  alterUser: (id,data) => {
    return apiClient.request(`/user/${id}`,`PUT`,data);
  },

  removeUser: (id) => {
    return apiClient.request(`/user/${id}`,`DELETE`);
  }
};