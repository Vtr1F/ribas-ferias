
import { apiClient } from './apiClient';

export const types_routes = {
  
  fetchTypes: () => {
    return apiClient.request(`/api/types`,`GET`); 
  },

};