import api, { USE_MOCK_API } from "./api";
import { MockStore } from "./mockDataStore";
import { normalizeCheckerDetail, normalizeRequest } from "./mappers";

/**
 * Get Checker Dashboard summary metrics.
 */
export const getCheckerDashboard = async () => {
  try {
    const response = await api.get("/checker/dashboard");
    return normalizeDashboard(response.data?.data ?? response.data);
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    console.warn("Backend checker dashboard unavailable, using MockStore:", err.message);
    return MockStore.getCheckerDashboard();
  }
};

const normalizeDashboard = (d = {}) => ({
  ...d,
  newRequests: d.newRequests ?? d.processing ?? 0,
  pendingReview: d.pendingReview ?? 0,
  clarification: d.clarification ?? d.clarificationRequired ?? 0,
  approved: (d.approved ?? 0) + (d.subscribed ?? 0),
  rejected: d.rejected ?? 0,
  totalRequests: d.totalRequests ?? 0,
});

/**
 * Get list of all requests for Checker review with optional filters.
 */
export const getCheckerRequests = async (filters = {}) => {
  try {
    // Backend defaults to status=PENDING_REVIEW and caps size at 100.
    const base = { status: "ALL", size: 100, ...filters };
    const rows = [];
    let page = 0;
    let totalPages = 1;
    do {
      const response = await api.get("/checker/requests", { params: { ...base, page } });
      const data = response.data?.data ?? response.data;
      if (Array.isArray(data)) return data.map(normalizeRequest);
      rows.push(...(data?.content ?? []));
      totalPages = data?.totalPages ?? 1;
      page += 1;
    } while (page < totalPages && page < 20);

    return rows.map(normalizeRequest);
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    console.warn("Backend checker requests unavailable, using MockStore:", err.message);
    let all = MockStore.getRequests();

    if (filters.provider && filters.provider !== "ALL") {
      all = all.filter((r) => (r.provider || "").toLowerCase() === filters.provider.toLowerCase());
    }
    if (filters.consumer && filters.consumer !== "ALL") {
      all = all.filter((r) => (r.consumer || "").toLowerCase() === filters.consumer.toLowerCase());
    }
    if (filters.maker && filters.maker !== "ALL") {
      all = all.filter((r) => (r.maker || "").toLowerCase() === filters.maker.toLowerCase());
    }
    if (filters.status && filters.status !== "ALL") {
      all = all.filter((r) => (r.status || "").toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      all = all.filter(
        (r) =>
          (r.requestId || "").toLowerCase().includes(q) ||
          (r.apiName || "").toLowerCase().includes(q) ||
          (r.provider || "").toLowerCase().includes(q) ||
          (r.consumer || "").toLowerCase().includes(q) ||
          (r.maker || "").toLowerCase().includes(q)
      );
    }
    return all;
  }
};

/**
 * Get comprehensive request details for Checker Review screen.
 */
export const getCheckerRequestDetails = async (requestId) => {
  try {
    const response = await api.get(`/checker/requests/${encodeURIComponent(requestId)}`);
    return normalizeCheckerDetail(response.data?.data ?? response.data);
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    console.warn(`Backend checker request ${requestId} unavailable, using MockStore:`, err.message);
    return MockStore.getRequestById(requestId);
  }
};

export const getCheckerRequestTimeline = async (requestId) => {
  try {
    const response = await api.get(
      `/checker/requests/${encodeURIComponent(requestId)}/timeline`
    );
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    const request = MockStore.getRequestById(requestId);
    return request?.timeline ?? [];
  }
};

/**
 * Register an API from a Checker request in the inventory.
 */
export const registerRequestApi = async (requestId, apiDetails) => {
  if (!requestId) throw new Error("A request ID is required to register an API.");

  try {
    const response = await api.post(
      `/checker/requests/${encodeURIComponent(requestId)}/register-api`,
      apiDetails
    );
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    console.warn(`Backend API registration failed, using MockStore:`, err.message);
    const createdApi = MockStore.createApiInCatalogue(apiDetails);
    return { ...createdApi, apiId: createdApi.id };
  }
};

/**
 * Approve request (generates client ID and updates status to SUBSCRIBED).
 */
export const approveRequest = async (requestId, { remarks } = {}) => {
  try {
    const response = await api.post(`/checker/requests/${encodeURIComponent(requestId)}/approve`, { remarks });
    return response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    console.warn(`Backend approve request failed, using MockStore:`, err.message);
    return MockStore.approveRequest(requestId, remarks);
  }
};

/**
 * Reject request with required reason.
 */
export const rejectRequest = async (requestId, { reason } = {}) => {
  try {
    const response = await api.post(`/checker/requests/${encodeURIComponent(requestId)}/reject`, { reason });
    return response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    console.warn(`Backend reject request failed, using MockStore:`, err.message);
    return MockStore.rejectRequest(requestId, reason);
  }
};

/**
 * Request clarification from Maker.
 */
export const requestClarification = async (requestId, { question } = {}) => {
  try {
    const response = await api.post(`/checker/requests/${encodeURIComponent(requestId)}/clarification`, { message: question });
    return response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    console.warn(`Backend request clarification failed, using MockStore:`, err.message);
    return MockStore.requestClarification(requestId, question);
  }
};
