const KEYCLOAK_URL = "http://localhost:8080";
const KEYCLOAK_REALM = "api-onboarding";
const KEYCLOAK_CLIENT_ID = "api-onboarding-frontend";

const keycloakConfig = {
  url: KEYCLOAK_URL,
  realm: KEYCLOAK_REALM,
  clientId: KEYCLOAK_CLIENT_ID,
};

export {
  KEYCLOAK_URL,
  KEYCLOAK_REALM,
  KEYCLOAK_CLIENT_ID,
};

export default keycloakConfig;