import api, { USE_MOCK_API } from "./api";
import { MockStore } from "./mockDataStore";
import { normalizeRequest } from "./mappers";

/**
 * Get Maker dashboard summary.
 */
export const getDashboard = async () => {
  try {
    const response = await api.get("/onboarding/requests");
    const data = response.data?.data ?? response.data;
    const requests = Array.isArray(data) ? data : data?.content ?? [];
    const count = (statuses) => requests.filter((request) => statuses.includes(String(request.status).toUpperCase())).length;
    return {
      data: {
        data: {
          totalRequests: requests.length,
          pendingRequests: count(["PENDING", "RECEIVED", "PROCESSING", "AI_ANALYZED", "PENDING_REVIEW", "UNDER_REVIEW"]),
          approvedRequests: count(["APPROVED"]),
          subscribedRequests: count(["SUBSCRIBED"]),
          rejectedRequests: count(["REJECTED"]),
        },
      },
    };
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    console.warn("Backend maker dashboard request unavailable, using MockStore fallback:", err.message);
    return { data: { data: MockStore.getMakerDashboard() } };
  }
};

/**
 * Get all requests belonging to the logged-in Maker.
 */
export const getRequests = async (filters = {}) => {
  try {
    const res = await api.get("/onboarding/requests", { params: filters });
    return res;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    console.warn("Backend onboarding request list unavailable, using MockStore fallback:", err.message);
    return { data: { data: MockStore.getRequests() } };
  }
};

/**
 * Get complete details of one request.
 */
export const getRequestDetails = async (requestId) => {
  try {
    const res = await api.get(`/onboarding/requests/${encodeURIComponent(requestId)}`);
    res.data = normalizeRequest(res.data?.data ?? res.data);
return res;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    console.warn(`Backend onboarding request ${requestId} unavailable, using MockStore fallback:`, err.message);
    return { data: { data: MockStore.getRequestById(requestId) } };
  }
};