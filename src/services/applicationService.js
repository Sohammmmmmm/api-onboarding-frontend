import api, { USE_MOCK_API } from "./api";
import { MockStore } from "./mockDataStore";

export const getApplications = async () => {
  try {
    const response = await api.get("/applications");
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.getApplications();
  }
};

export const createApplication = async (appData) => {
  try {
    const response = await api.post("/applications", appData);
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.createApplication(appData);
  }
};

export const getApplication = async (applicationId) => {
  try {
    const response = await api.get("/applications");
    const data = response.data?.data ?? response.data;
    const applications = Array.isArray(data) ? data : data?.content ?? data?.applications ?? [];
    return applications.find((application) =>
      String(application.id ?? application.applicationId) === String(applicationId)
    ) ?? null;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.getApplicationById(applicationId);
  }
};

export const getApplicationSubscriptions = async (applicationId) => {
  try {
    const response = await api.get(`/applications/${encodeURIComponent(applicationId)}/subscriptions`);
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.getApplicationSubscriptions(applicationId);
  }
};

export const subscribeApi = async (applicationId, { apiId, environment, version }) => {
  try {
    const response = await api.post(`/applications/${encodeURIComponent(applicationId)}/subscriptions`, {
      apiId,
      environment,
      version,
    });
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.addSubscriptionToApplication(applicationId, { apiId, environment, version });
  }
};
