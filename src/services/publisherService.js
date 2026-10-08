import api, { USE_MOCK_API } from "./api";
import { MockStore } from "./mockDataStore";

export const getPublisherDashboardStats = async () => {
  try {
    const apis = await getPublisherApis();
    const list = Array.isArray(apis) ? apis : apis?.content ?? [];
    const count = (status) =>
      list.filter((item) => String(item.status).toUpperCase() === status).length;
    return {
      totalApis: list.length,
      pendingReview: count("PENDING_REVIEW"),
      published: count("PUBLISHED"),
      returned: count("RETURNED"),
    };
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.getPublisherDashboardStats();
  }
};

export const getPublisherApis = async (statusFilter = "") => {
  try {
    const response = await api.get("/publisher/apis", {
      params: typeof statusFilter === "string"
        ? statusFilter ? { status: statusFilter } : {}
        : statusFilter,
    });
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.getPublisherApis(statusFilter);
  }
};

export const getPublisherApiDetails = async (apiId) => {
  try {
    const response = await api.get(`/publisher/apis/${encodeURIComponent(apiId)}`);
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.getPublisherApiById(apiId);
  }
};

export const getPublisherApiEnvironments = async (apiId) => {
  try {
    const response = await api.get(
      `/publisher/apis/${encodeURIComponent(apiId)}/environments`
    );
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    const apiDetails = MockStore.getPublisherApiById(apiId);
    return apiDetails?.environments ?? [];
  }
};

export const getPublisherApiTimeline = async (apiId) => {
  try {
    const response = await api.get(`/publisher/apis/${encodeURIComponent(apiId)}/timeline`);
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.getPublisherApiTimeline(apiId);
  }
};

export const publishApi = async (apiId, { remarks = "" } = {}) => {
  try {
    const response = await api.post(`/publisher/apis/${encodeURIComponent(apiId)}/publish`, { remarks });
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.publishApi(apiId, remarks);
  }
};

export const returnApi = async (apiId, { reason = "" } = {}) => {
  try {
    const response = await api.post(`/publisher/apis/${encodeURIComponent(apiId)}/return`, { reason });
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.returnApi(apiId, reason);
  }
};

export const deprecateApi = async (apiId, { reason = "" } = {}) => {
  try {
    const response = await api.post(
      `/publisher/apis/${encodeURIComponent(apiId)}/deprecate`,
      null,
      { params: { reason } }
    );
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.deprecateApi(apiId, reason);
  }
};

export const retireApi = async (apiId, { reason = "" } = {}) => {
  try {
    const response = await api.post(
      `/publisher/apis/${encodeURIComponent(apiId)}/retire`,
      null,
      { params: { reason } }
    );
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    return MockStore.retireApi(apiId, reason);
  }
};
