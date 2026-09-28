import api from "./api";

/**
 * Get Maker dashboard summary.
 */
export const getDashboard = () => {
  return api.get("/api/maker/dashboard");
};

/**
 * Get all requests belonging to the logged-in Maker.
 */
export const getRequests = () => {
  return api.get("/api/maker/requests");
};

/**
 * Get complete details of one request.
 */
export const getRequestDetails = (requestId) => {
  return api.get(`/api/maker/requests/${requestId}`);
};