
import { apiClient } from './apiClient';

export const user_routes = {
  //Teamdata e userdata sao jsons,
  fetchTeams: () => {
    return apiClient.request("/team","GET"); 
  },
  //this makes a team, so tou a copiar o nome do codigo do backend
  addTeam: (teamdata) => {
    return apiClient.request(`/team`,`POST`,teamdata);
  },

  fetchTeam: (id) => {
    return apiClient.request(`/team/${id}`,"GET");
  },
  
  alterTeam: (id,teamdata) => {
    return apiClient.request(`/team/${id}`,"PUT",teamdata);
  },

  removeTeam: (id) => {
    return apiClient.request(`/team/${id}`,"DELETE");
  },

  addToTeam: (id,userid,userdata) => {
    return apiClient.request(`/team/${id}/${userid}`,"POST",userdata);
  },
  
  removeFromTeam: (id,userid) => {
    return apiClient.request(`/team/${id}/${userid}`,"DELETE");
  },

  alterTeamLead: (id,userid,userdata) => {
    return apiClient.request(`/team/${id}/${userid}`,"PUT",userdata);
  },
};