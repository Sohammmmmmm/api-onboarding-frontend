import axios from "axios";
import {
  tryRefreshSession,
  clearAuthSession,
} from "../auth/authSessionBridge";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://43.204.108.73:8348/onboarding/api";
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let refreshInFlight = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && originalRequest && !originalRequest._authRetry) {
      originalRequest._authRetry = true;

      if (!refreshInFlight) {
        refreshInFlight = tryRefreshSession().finally(() => {
          refreshInFlight = null;
        });
      }

      const refreshed = await refreshInFlight;
      if (refreshed) {
        const token = sessionStorage.getItem("access_token");
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      }

      clearAuthSession();
      error.userMessage = "Your session has expired. Please sign in again.";
      return Promise.reject(error);
    }

    if (status === 403) {
      error.userMessage =
        "You do not have permission to perform this action.";
    } else if (status === 409) {
      error.userMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "This request conflicts with an existing record.";
    } else if (status >= 500) {
      error.userMessage =
        "Something went wrong on the server. Please try again.";
    }

    return Promise.reject(error);
  }
);

/**
 * User-safe message from an Axios (or network) error.
 */
export const getApiErrorMessage = (error, fallback = "Something went wrong.") => {
  if (error?.userMessage) return error.userMessage;

  if (!error?.response) {
    if (error?.message === "Network Error") {
      return "Unable to reach the server. Check your connection and try again.";
    }
    return error?.message || fallback;
  }

  const { status, data } = error.response;
  const serverMsg =
    data?.message ||
    data?.error ||
    (Array.isArray(data?.errors) ? data.errors.join(", ") : null);

  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }
  if (status === 403) {
    return "You do not have permission to perform this action.";
  }
  if (status === 404) {
    return serverMsg || "The requested resource was not found.";
  }
  if (status === 409) {
    return serverMsg || "This request conflicts with an existing record.";
  }
  if (status === 422) {
    return serverMsg || "Validation failed. Please check your input.";
  }
  if (status >= 500) {
    return "Something went wrong on the server. Please try again.";
  }

  return serverMsg || fallback;
};

export default api;
