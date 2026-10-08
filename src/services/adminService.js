import api, { USE_MOCK_API } from "./api";
import { MockStore } from "./mockDataStore";

export const getAdminDashboardStats = async () => {
  try {
    const response = await api.get("/admin/dashboard");
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.getAdminDashboardStats();
  }
};

export const getAdminUsers = async (search = "") => {
  try {
    const response = await api.get("/admin/users", {
      params: search ? { search } : {},
    });
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.getAdminUsers();
  }
};

export const getAdminUser = async (userId) => {
  try {
    const [users, rolesResponse] = await Promise.all([
      getAdminUsers(userId),
      api.get(`/admin/users/${encodeURIComponent(userId)}/roles`),
    ]);
    const userList = Array.isArray(users) ? users : users?.content ?? [];
    const user = userList.find((entry) =>
      String(entry.username ?? entry.id) === String(userId)
    );
    const roles = rolesResponse.data?.data ?? rolesResponse.data;
    return user ? { ...user, roles } : { username: userId, roles };
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.getAdminUserById(userId);
  }
};

export const updateAdminUserStatus = async (username, active) => {
  const response = await api.put(
    `/admin/users/${encodeURIComponent(username)}/status`,
    { active }
  );
  return response.data?.data ?? response.data;
};

export const updateUserRole = async ({ userId, username, role, roles }) => {
  try {
    const body = {};
    if (username) body.username = username;
    else if (userId) body.userId = userId;
    if (Array.isArray(roles)) body.roles = roles;
    else if (role) body.role = role;
    const response = await api.post("/admin/users/roles", body);
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.updateUserRole(userId, role);
  }
};

export const getUserNotificationPreferences = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${encodeURIComponent(userId)}/notification-preferences`);
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.getUserNotificationPreferences(userId);
  }
};

export const updateUserNotificationPreferences = async (userId, preferences) => {
  try {
    const response = await api.put(`/admin/users/${encodeURIComponent(userId)}/notification-preferences`, preferences);
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.updateUserNotificationPreferences(userId, preferences);
  }
};

export const getAdminApplications = async () => {
  try {
    const response = await api.get("/admin/applications");
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.getApplications();
  }
};

export const getAdminApis = async () => {
  try {
    const response = await api.get("/admin/apis");
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.getCatalogue();
  }
};

export const getAdminApiEnvironments = async (apiId) => {
  try {
    const response = await api.get(
      `/admin/apis/${encodeURIComponent(apiId)}/environments`
    );
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return [];
  }
};

export const getAdminAuditLogs = async (filters = {}) => {
  try {
    const response = await api.get("/admin/audit", { params: filters });
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.getAuditLogs(filters);
  }
};

export const getSlaConfiguration = async () => {
  try {
    const response = await api.get("/admin/workflow/sla");
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.getSlaConfiguration();
  }
};

export const updateSlaConfiguration = async (slaConfig) => {
  try {
    const response = await api.put("/admin/workflow/sla", slaConfig);
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.updateSlaConfiguration(slaConfig);
  }
};

export const getNotificationMatrix = async () => {
  try {
    const response = await api.get("/admin/notification-templates");
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.getNotificationMatrix();
  }
};

export const updateNotificationMatrix = async (matrix) => {
  try {
    const response = await api.put("/admin/notification-templates", matrix);
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.updateNotificationMatrix(matrix);
  }
};

export const getNotificationTemplates = async () => {
  return getNotificationMatrix();
};

export const updateNotificationTemplates = async (templates) => {
  return updateNotificationMatrix(templates);
};

export const getRequestSla = async (requestId) => {
  try {
    const response = await api.get(
      `/admin/requests/${encodeURIComponent(requestId)}/sla`
    );
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return null;
  }
};
