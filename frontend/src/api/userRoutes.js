import { apiClient } from './apiClient';

export const UserRoutes = {
  
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
  },

  updatePassword: (id, data) => {
    return apiClient.request(`/api/users/password/${id}`,`PUT`,data)
  },

getUserImage: (id) => {
    return apiClient.request(`/api/users/${id}/image`, `GET`);
  },

  uploadUserImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.request(`/api/upload`, `POST`, formData, true);
  }
    
};