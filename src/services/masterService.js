import api, { USE_MOCK_API } from "./api";
import { MockStore } from "./mockDataStore";

export const getMasterData = async (type, mockFallback) => {
  try {
    const response = await api.get(`/master/${encodeURIComponent(type)}`);
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    if (typeof mockFallback === "function") return mockFallback();
    throw err;
  }
};

export const getEnvironments = async () => {
  try {
    const response = await api.get("/master/environments");
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.getEnvironments();
  }
};

export const getEnvironmentAliases = async () => {
  try {
    const response = await api.get("/master/environment-aliases");
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.getEnvironmentAliases();
  }
};

export const getCategories = async () =>
  getMasterData("API_CATEGORY", MockStore.getCategories);

export const getAuthTypes = async () =>
  getMasterData("AUTHENTICATION_TYPE", MockStore.getAuthTypes);

export const getApplicationTypes = async () =>
  getMasterData("APPLICATION_TYPE", MockStore.getApplicationTypes);

export const getNotificationChannels = async () =>
  getMasterData("NOTIFICATION_CHANNEL");

export const createOrUpdateEnvironment = async (environment) => {
  const response = await api.post("/admin/environments", environment);
  return response.data?.data ?? response.data;
};

export const addEnvironmentAlias = async (alias) => {
  const response = await api.post("/admin/environment-aliases", alias);
  return response.data?.data ?? response.data;
};

export const updateMasterData = async (type, value) => {
  const response = await api.put(
    `/admin/master-data/${encodeURIComponent(type)}`,
    value
  );
  return response.data?.data ?? response.data;
};
