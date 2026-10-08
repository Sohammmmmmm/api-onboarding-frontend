import api, { USE_MOCK_API } from "./api";
import { MockStore } from "./mockDataStore";

// Backend returns { isRead, createdAt, ... }; the UI reads `read`.
const normalize = (n) => ({ ...n, read: n.read ?? n.isRead ?? false });

export const getNotifications = async () => {
  try {
    const response = await api.get("/notifications");
    const data = response.data?.data ?? response.data;
    const list = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
    return list.map(normalize);
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    console.warn("Backend getNotifications unavailable, using MockStore:", err.message);
    return MockStore.getNotifications();
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    // Backend route is /notifications/unread/count (was /unread-count -> 404)
    const response = await api.get("/notifications/unread/count");
    const data = response.data?.data ?? response.data;
    return typeof data === "number" ? data : data?.count ?? data?.unreadCount ?? 0;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.getNotifications().filter((n) => !(n.read ?? n.isRead ?? false)).length;
  }
};

const changed = () => window.dispatchEvent(new Event("notifications:changed"));

export const markNotificationRead = async (id) => {
  try {
    await api.put(`/notifications/${encodeURIComponent(id)}/read`);
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    console.warn("Backend markNotificationRead unavailable, updating MockStore:", err.message);
    MockStore.markNotificationRead(id);
  }
  changed();
};

export const markAllNotificationsRead = async () => {
  try {
    await api.put("/notifications/read-all");
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    console.warn("Backend markAllNotificationsRead unavailable, updating MockStore:", err.message);
    MockStore.markAllNotificationsRead();
  }
  changed();
};
