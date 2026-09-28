import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  KEYCLOAK_URL,
  KEYCLOAK_REALM,
  KEYCLOAK_CLIENT_ID,
} from "./keycloak";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    loadExistingSession();
  }, []);

  const loadExistingSession = () => {
    const token = sessionStorage.getItem("access_token");
    const userData = sessionStorage.getItem("user");

    if (token) {
      setAccessToken(token);
      setAuthenticated(true);

      // Temporary log for testing
      console.log("========== EXISTING KEYCLOAK SESSION ==========");
      console.log("Authenticated: true");
      console.log("Access Token:", token);
      console.log("===============================================");

      if (userData) {
        setUser(JSON.parse(userData));
      }
    }

    setInitialized(true);
  };

  const login = async (username, password) => {
    const tokenUrl =
      `${KEYCLOAK_URL}/realms/` +
      `${KEYCLOAK_REALM}/protocol/openid-connect/token`;

    const body = new URLSearchParams();

    body.append("grant_type", "password");
    body.append("client_id", KEYCLOAK_CLIENT_ID);
    body.append("username", username);
    body.append("password", password);

    try {
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error_description ||
            "Invalid username or password"
        );
      }

      const token = data.access_token;

      // ==========================================
      // TEMPORARY TOKEN LOGGING FOR TESTING
      // ==========================================
      console.log("========== KEYCLOAK LOGIN ==========");
      console.log("Authenticated: true");
      console.log("Username:", username);
      console.log("Access Token:", token);
      console.log("Refresh Token:", data.refresh_token);
      console.log("Expires In:", data.expires_in);
      console.log("====================================");

      const tokenPayload = JSON.parse(
        atob(token.split(".")[1])
      );

      console.log("========== TOKEN PAYLOAD ==========");
      console.log(tokenPayload);
      console.log("===================================");

      const userData = {
        username:
          tokenPayload.preferred_username || username,

        name:
          tokenPayload.name ||
          tokenPayload.preferred_username ||
          username,

        email:
          tokenPayload.email || "",

        roles:
          tokenPayload.realm_access?.roles || [],
      };

      sessionStorage.setItem(
        "access_token",
        token
      );

      sessionStorage.setItem(
        "refresh_token",
        data.refresh_token
      );

      sessionStorage.setItem(
        "expires_in",
        String(data.expires_in)
      );

      sessionStorage.setItem(
        "user",
        JSON.stringify(userData)
      );

      setAccessToken(token);
      setAuthenticated(true);
      setUser(userData);

      return {
        success: true,
        user: userData,
      };
    } catch (error) {
      console.error("Login failed:", error);

      return {
        success: false,
        message: error.message,
      };
    }
  };

  const logout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("expires_in");
    sessionStorage.removeItem("user");

    setAccessToken(null);
    setAuthenticated(false);
    setUser(null);

    window.location.href = "/login";
  };

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        user,
        accessToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
