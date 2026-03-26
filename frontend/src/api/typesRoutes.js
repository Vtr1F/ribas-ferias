
import { apiClient } from './apiClient';

export const TypeRoutes = {
  
  fetchTypes: () => {
    return apiClient.request(`/api/types`,`GET`); 
  },

};