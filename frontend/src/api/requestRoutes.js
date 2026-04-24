
import { apiClient } from './apiClient';

export const RequestRoutes = {
  
  fetchRequests: () => {
    return apiClient.request(`/api/requests`,`GET`); 
  },

  addRequest: (data) => {
    return apiClient.request(`/api/requests`,`POST`,data); 
  },
  
  fetchRequest: (id) => {
    return apiClient.request(`/api/requests/${id}`,`GET`);
  },

  fetchUserRequest: (id) => {
    return apiClient.request(`/api/requests/user/${id}`,`GET`);
  },
  
  fetchTeamRequest: (id) => {
    return apiClient.request(`/api/requests/team/${id}`,`GET`);
  },
  
  sendAcceptRequest: (id) => {
    return apiClient.request(`/api/requests/${id}/accept`,`GET`);
  },
  
  sendRejectRequest: (id) => {
    return apiClient.request(`/api/requests/${id}/reject`,`GET`);
  },

  uploadFormFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.request(`/api/upload/files`, `POST`, formData, true);
  }
};