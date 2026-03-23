
import { apiClient } from './apiClient';

export const user_routes = {
  //Teamdata e userdata sao jsons,
  fetchTeams: () => {
    return apiClient.request("/api/team","GET"); 
  },
  //this makes a team, so tou a copiar o nome do codigo do backend
  addTeam: (teamdata) => {
    return apiClient.request(`/api/team`,"POST",teamdata);
  },

  fetchTeam: (id) => {
    return apiClient.request(`/api/team/${id}`,"GET");
  },
  
  alterTeam: (id,teamdata) => {
    return apiClient.request(`/api/team/${id}`,"PUT",teamdata);
  },

  removeTeam: (id) => {
    return apiClient.request(`/api/team/${id}`,"DELETE");
  },

  addToTeam: (id,userid,userdata) => {
    return apiClient.request(`/api/team/${id}/${userid}`,"POST",userdata);
  },
  
  removeFromTeam: (id,userid) => {
    return apiClient.request(`/api/team/${id}/${userid}`,"DELETE");
  },

  alterTeamLead: (id,userid,userdata) => {
    return apiClient.request(`/api/team/${id}/${userid}`,"PUT",userdata);
  },
};