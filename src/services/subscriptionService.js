import { USE_MOCK_API } from "./api";
import { MockStore } from "./mockDataStore";
import {
  getApplications,
  getApplicationSubscriptions as fetchApplicationSubscriptions,
} from "./applicationService";

const normalizeSubscription = (subscription = {}) => {
  const details = subscription.subscription || {};
  const credentials = subscription.credentials || subscription.credential || details.credentials || {};
  return {
    ...details,
    ...subscription,
    id: subscription.id || subscription.subscriptionId || subscription.subscription_id || details.id,
    subscriptionId: subscription.subscriptionId || subscription.subscription_id || details.subscriptionId || details.subscription_id || subscription.id,
    requestId: subscription.requestId || subscription.request_id || details.requestId || details.request_id,
    apiId: subscription.apiId || subscription.api_id || subscription.catalogueApiId || details.apiId || details.api_id,
    apiName: subscription.apiName || subscription.api_name || subscription.api || subscription.name || details.apiName || details.api_name,
    provider: subscription.provider || subscription.providerName || subscription.provider_name || details.provider,
    environment: subscription.environment || subscription.environmentName || details.environment,
    clientId: subscription.clientId || subscription.client_id || subscription.clientID || credentials.clientId || credentials.client_id || credentials.clientID || details.clientId || details.client_id,
    clientSecret: subscription.clientSecret || subscription.client_secret || credentials.clientSecret || credentials.client_secret || details.clientSecret || details.client_secret,
    endpointUrl: subscription.endpointUrl || subscription.endpoint_url || subscription.apiUrl || subscription.api_url || subscription.baseUrl || subscription.baseURL || subscription.base_url || subscription.url || details.endpointUrl || details.endpoint_url || details.apiUrl || details.api_url || details.baseUrl || details.baseURL || details.base_url || details.url,
  };
};

const getRows = (data) => {
  const payload = data?.data ?? data;
  if (Array.isArray(payload)) return payload;
  return payload?.content ?? payload?.subscriptions ?? payload?.items ?? [];
};

const getApplicationBasedSubscriptions = async () => {
  try {
    const applications = await getApplications();
    const rows = Array.isArray(applications)
      ? applications
      : applications?.content ?? applications?.applications ?? [];
    const subscriptions = await Promise.all(
      rows.map(async (application) => {
        const applicationId = application.id ?? application.applicationId;
        if (applicationId == null) return [];
        const result = await fetchApplicationSubscriptions(applicationId);
        return getRows(result).map((subscription) =>
          normalizeSubscription({ ...subscription, applicationId })
        );
      })
    );
    return subscriptions.flat();
  } catch (err) {
    if (!USE_MOCK_API) throw err;
    console.warn("Backend getSubscriptions unavailable, using MockStore:", err.message);
    return MockStore.getSubscriptions();
  }
};

export const getSubscriptions = getApplicationBasedSubscriptions;

export const getAllSubscriptions = getApplicationBasedSubscriptions;