import api from "./api";

export const getNotifications = async () => {
  const response = await api.get(
    "/api/maker/notifications"
  );

  return response.data;
};

export const markNotificationRead = async (
  notificationId
) => {
  const response = await api.patch(
    `/api/maker/notifications/${notificationId}/read`
  );

  return response.data;
};