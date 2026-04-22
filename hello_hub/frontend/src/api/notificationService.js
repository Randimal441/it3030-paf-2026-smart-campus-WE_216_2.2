import api from "./axiosClient";

const BASE_URL = "/api/notifications";

export const getMyNotifications = () => api.get(BASE_URL);

export const getUnreadNotificationCount = () => api.get(`${BASE_URL}/unread-count`);

export const markNotificationAsRead = (notificationId) =>
  api.patch(`${BASE_URL}/${notificationId}/read`);

export const markAllNotificationsAsRead = () => api.patch(`${BASE_URL}/read-all`);

export const deleteNotification = (notificationId) =>
  api.delete(`${BASE_URL}/${notificationId}`);
