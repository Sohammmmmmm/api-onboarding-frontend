import api, { USE_MOCK_API } from "./api";
import { MockStore } from "./mockDataStore";
import { normalizeRequest } from "./mappers";

export const createOnboardingRequest = async (request) => {
  try {
    const response = await api.post("/onboarding/requests", request);
    return response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    console.warn("Backend createOnboardingRequest unavailable, saving to MockStore:", err.message);
    const saved = MockStore.addRequest({
      ...request,
      maker: "Soham Matkar",
      makerEmail: "soham@nishkaiv.com",
    });
    return saved;
  }
};

export const getRequest = async (requestId) => {
  try {
    const response = await api.get(`/onboarding/requests/${encodeURIComponent(requestId)}`);
   const request = normalizeRequest(response.data?.data ?? response.data);
    const status = await getRequestStatus(requestId);
    const resolvedStatus = typeof status === "string" ? status : status?.status;
    return resolvedStatus ? { ...request, status: resolvedStatus } : request;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    console.warn(`Backend getRequest for ${requestId} unavailable, using MockStore:`, err.message);
    return MockStore.getRequestById(requestId);
  }
};

export const getRequestStatus = async (requestId) => {
  try {
    const response = await api.get(`/onboarding/requests/${encodeURIComponent(requestId)}/status`);
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    const request = MockStore.getRequestById(requestId);
    return request ? { requestId, status: request.status } : null;
  }
};

export const getRequestTimeline = async (requestId) => {
  try {
    const response = await api.get(
      `/onboarding/requests/${encodeURIComponent(requestId)}/timeline`
    );
    return response.data?.data ?? response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    const request = MockStore.getRequestById(requestId);
    return request?.timeline ?? [];
  }
};

export const sendClarification = async (requestId, { clarification } = {}) => {
  try {
    const response = await api.post(`/onboarding/requests/${encodeURIComponent(requestId)}/clarification`, { message: clarification });
    return response.data;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    console.warn(`Backend sendClarification for ${requestId} unavailable, updating MockStore:`, err.message);
    return MockStore.respondClarification(requestId, clarification);
  }
};