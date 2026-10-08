import api, { USE_MOCK_API } from "./api";
import { MockStore } from "./mockDataStore";

const normalizeCatalogueApi = (item = {}) => ({
  ...item,
  id: item.id || item.apiId || item.api_id || item.catalogueApiId || item.catalogueId,
  apiName: item.apiName || item.name || item.api || item.title || item.api_name || "",
  provider: item.provider || item.providerName || item.providerSystem || item.provider_name || "",
  category: item.category || item.categoryName || item.category_name || "",
  version: item.version || item.apiVersion || item.api_version || "",
  status: item.status || item.apiStatus || item.api_status,
  description: item.description || item.apiDescription || item.api_description || item.summary || "",
  baseUrl: item.baseUrl || item.baseURL || item.baseUri || item.base_url || item.url || "",
  authType: item.authType || item.authenticationType || item.authMethod || item.auth_type || "",
  rateLimit: item.rateLimit || item.rateLimitPolicy || item.rate_limit || "",
  endpoints: item.endpoints || item.apiEndpoints || item.api_endpoints || item.operations || [],
  updatedAt: item.updatedAt || item.lastUpdated || item.modifiedAt || item.updated_at,
});

/**
 * Get API Catalogue items.
 */
export const getApiCatalogue = async (filters = {}) => {
  try {
    const response = await api.get("/catalogue/apis", { params: filters });
    const data = response.data?.data ?? response.data;
    const catalogue = Array.isArray(data)
      ? data
      : data?.content ?? data?.apis ?? data?.items ?? data?.catalogue ?? [];
    return Array.isArray(catalogue) ? catalogue.map(normalizeCatalogueApi) : [];
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    console.warn("Backend API catalogue unavailable, using MockStore:", err.message);
    let list = MockStore.getCatalogue();

    if (filters.category && filters.category !== "ALL") {
      list = list.filter((a) => (a.category || "").toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.provider && filters.provider !== "ALL") {
      list = list.filter((a) => (a.provider || "").toLowerCase() === filters.provider.toLowerCase());
    }
    if (filters.status && filters.status !== "ALL") {
      list = list.filter((a) => (a.status || "").toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (a) =>
          (a.apiName || "").toLowerCase().includes(q) ||
          (a.description || "").toLowerCase().includes(q) ||
          (a.provider || "").toLowerCase().includes(q) ||
          (a.category || "").toLowerCase().includes(q)
      );
    }
    return list.map(normalizeCatalogueApi);
  }
};

/**
 * Get catalogue data available to a Checker during request review.
 */
export const getCheckerCatalogue = async (filters = {}) => {
  try {
    const response = await api.get("/checker/catalogue", { params: filters });
    const data = response.data?.data ?? response.data;
    const catalogue = Array.isArray(data)
      ? data
      : data?.content ?? data?.apis ?? data?.items ?? data?.catalogue ?? [];
    return Array.isArray(catalogue) ? catalogue.map(normalizeCatalogueApi) : [];
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    console.warn("Checker catalogue unavailable, using MockStore:", err.message);
    return MockStore.getCatalogue().map(normalizeCatalogueApi);
  }
};

/**
 * Get API details by ID.
 */
export const getApiById = async (apiId) => {
  try {
    const response = await api.get(`/catalogue/apis/${encodeURIComponent(apiId)}`);
    const data = response.data?.data ?? response.data;
    return data ? normalizeCatalogueApi(data) : null;
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    const catalogue = MockStore.getCatalogue();
    const lookupId = String(apiId ?? "").toLowerCase();
    const item = catalogue.find((entry) =>
      [entry.id, entry.apiName].some((value) => String(value ?? "").toLowerCase() === lookupId)
    );
    return item ? normalizeCatalogueApi(item) : null;
  }
};

/**
 * Create/Register new API in the inventory.
 */
export const createApi = async (apiData) => {
  try {
    const response = await api.post("/checker/catalogue/register", apiData);
    const data = response.data?.data ?? response.data;
    return normalizeCatalogueApi(data);
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    console.warn("Backend API registration unavailable, using MockStore:", err.message);
    return normalizeCatalogueApi(MockStore.createApiInCatalogue(apiData));
  }
};

/**
 * Check if requested API matches any entry in catalogue.
 */
export const checkApiMatch = async (apiName, provider) => {
  const catalogue = await getCheckerCatalogue();
  const normalize = (value) => (value || "").trim().toLowerCase().replace(/\s+/g, " ");
  const requestedName = normalize(apiName);
  const requestedProvider = normalize(provider);

  if (!requestedName) return null;

  return catalogue.find((item) => {
    const itemName = normalize(item.apiName);
    const itemProvider = normalize(item.provider);
    return itemName === requestedName && (!requestedProvider || itemProvider === requestedProvider);
  });
};
