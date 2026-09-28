import api from "./api";

export const getSubscriptions = async () => {
  const response = await api.get(
    "/api/maker/subscriptions"
  );

  return response.data;
};

export const getSubscription = async (
  subscriptionId
) => {
  const response = await api.get(
    `/api/maker/subscriptions/${subscriptionId}`
  );

  return response.data;
};