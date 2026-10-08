const KEYCLOAK_URL = "https://43.204.108.73:8347";
const KEYCLOAK_REALM = "nishkaiv";
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