import { apiClient } from './apiClient';

export const fetchNotifications = async (userId) => {
  return apiClient.request(`/api/notifications/user/${userId}`, 'GET');
};

export const fetchUnreadNotifications = async (userId) => {
  return apiClient.request(`/api/notifications/user/${userId}/unread`, 'GET');
};

export const countUnreadNotifications = async (userId) => {
  return apiClient.request(`/api/notifications/user/${userId}/count`, 'GET');
};

export const markNotificationsRead = async (ids) => {
  return apiClient.request('/api/notifications/read', 'PUT', { ids });
};

export const markNotificationRead = async (notificationId) => {
  return apiClient.request(`/api/notifications/${notificationId}/read`, 'PUT');
};