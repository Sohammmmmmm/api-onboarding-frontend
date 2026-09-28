import api from "./api";

export const createOnboardingRequest = async (request) => {
  const response = await api.post(
    "/api/onboarding/requests",
    request
  );

  return response.data;
};

export const getRequest = async (requestId) => {
  const response = await api.get(
    `/api/maker/requests/${requestId}`
  );

  return response.data;
};

export const sendClarification = async (
  requestId,
  clarification
) => {
  const response = await api.post(
    `/api/maker/requests/${requestId}/clarification`,
    clarification
  );

  return response.data;
};