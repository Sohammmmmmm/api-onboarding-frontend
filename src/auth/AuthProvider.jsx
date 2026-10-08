import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Loader from "../components/common/Loader";

import {
  KEYCLOAK_URL,
  KEYCLOAK_REALM,
  KEYCLOAK_CLIENT_ID,
} from "./keycloak";
import { registerAuthSessionHandlers } from "./authSessionBridge";

const AuthContext = createContext(null);

const OIDC_BASE = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect`;
const TOKEN_URL = `${OIDC_BASE}/token`;
const LOGOUT_URL = `${OIDC_BASE}/logout`;

// Refresh the access token this long before it expires.
const REFRESH_MARGIN_MS = 30 * 1000;

const KEYS = {
  access: "access_token",
  refresh: "refresh_token",
  user: "user",
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Decode the payload of a JWT. Returns null if the token is not a valid JWT. */
const decodeJwtPayload = (token) => {
  if (typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/**
 * Roles the backend understands:
 *  - realm roles           -> realm_access.roles
 *  - this client's roles   -> resource_access.<client-id>.roles
 * (must match SecurityConfig on the backend)
 */
const extractRoles = (payload) => {
  const realmRoles = payload?.realm_access?.roles ?? [];
  const clientRoles = payload?.resource_access?.[KEYCLOAK_CLIENT_ID]?.roles ?? [];

  return [
    ...new Set(
      [...realmRoles, ...clientRoles]
        .filter(Boolean)
        .map((role) => String(role).toUpperCase().replace(/^ROLE_/, ""))
    ),
  ];
};

/** Resolve the user's primary portal role when multiple roles are present. */
const resolveRole = (roles) => {
  if (roles.includes("ADMIN")) return "ADMIN";
  if (roles.includes("PUBLISHER")) return "PUBLISHER";
  if (roles.includes("CHECKER")) return "CHECKER";
  if (roles.includes("MAKER")) return "MAKER";
  return null;
};

const buildUser = (payload, fallbackUsername = "") => {
  const roles = extractRoles(payload);
  const username = payload.preferred_username || fallbackUsername;

  return {
    username,
    name: payload.name || username,
    email: payload.email || username,
    roles,
    role: resolveRole(roles),
  };
};

/** POST to the Keycloak token endpoint. Never throws on HTTP errors. */
const requestToken = async (params) => {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
};

const loginErrorMessage = (status, data) => {
  const { error, error_description: description } = data || {};

  if (error === "unauthorized_client") {
    return "Keycloak has disabled password login for this client. Enable Direct Access Grants for it.";
  }
  if (error === "invalid_client") {
    return "Keycloak rejected this client. Check the configured realm and client ID.";
  }
  if (description) return description;
  if (error === "invalid_grant") {
    return "Invalid username or password, or the account is disabled or not fully set up.";
  }
  return `Login failed (HTTP ${status}). Please try again.`;
};

/* -------------------------------------------------------------------------- */
/* Provider                                                                   */
/* -------------------------------------------------------------------------- */

export function AuthProvider({ children }) {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const refreshInFlight = useRef(null);
  const refreshTimer = useRef(null);

  /** Remove everything auth-related. ProtectedRoute then redirects to /login. */
  const clearSession = useCallback(() => {
    clearTimeout(refreshTimer.current);
    Object.values(KEYS).forEach((key) => sessionStorage.removeItem(key));
    sessionStorage.removeItem("expires_in");

    setAccessToken(null);
    setUser(null);
    setAuthenticated(false);
  }, []);

  /**
   * Validate a token response, persist it and update state.
   * services/api.js reads access_token from sessionStorage on every request,
   * so storing it here is what makes the new token get used.
   */
  const applyTokens = useCallback((data, fallbackUsername = "") => {
    const payload = decodeJwtPayload(data?.access_token);
    if (!payload) {
      return { success: false, message: "The login service returned an invalid token." };
    }

    const userData = buildUser(payload, fallbackUsername);
    if (!userData.role) {
      return {
        success: false,
        message: "User does not have a MAKER, CHECKER, PUBLISHER, or ADMIN role.",
      };
    }

    sessionStorage.setItem(KEYS.access, data.access_token);
    if (data.refresh_token) {
      sessionStorage.setItem(KEYS.refresh, data.refresh_token);
    }
    sessionStorage.setItem(KEYS.user, JSON.stringify(userData));

    setAccessToken(data.access_token);
    setUser(userData);
    setAuthenticated(true);

    return { success: true, user: userData };
  }, []);

  /** Exchange the refresh token for a new access token. Resolves true/false. */
  const refreshSession = useCallback(() => {
    if (refreshInFlight.current) return refreshInFlight.current;

    const refreshToken = sessionStorage.getItem(KEYS.refresh);
    if (!refreshToken) return Promise.resolve(false);

    refreshInFlight.current = (async () => {
      try {
        const result = await requestToken({
          grant_type: "refresh_token",
          client_id: KEYCLOAK_CLIENT_ID,
          refresh_token: refreshToken,
        });
        if (!result.ok) return false;
        return applyTokens(result.data).success;
      } catch {
        return false;
      } finally {
        refreshInFlight.current = null;
      }
    })();

    return refreshInFlight.current;
  }, [applyTokens]);

  useEffect(() => {
    registerAuthSessionHandlers({
      refresh: refreshSession,
      clear: clearSession,
    });
  }, [refreshSession, clearSession]);

  /* ---- Restore an existing session on page load ------------------------- */
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      const token = sessionStorage.getItem(KEYS.access);

      if (token) {
        const payload = decodeJwtPayload(token);

        if (!payload) {
          // Not a real JWT (e.g. a leftover "demo_token_..." value).
          clearSession();
        } else if (payload.exp * 1000 - Date.now() <= REFRESH_MARGIN_MS) {
          const refreshed = await refreshSession();
          if (!refreshed) clearSession();
        } else {
          const restored = applyTokens({
            access_token: token,
            refresh_token: sessionStorage.getItem(KEYS.refresh),
          });
          if (!restored.success) clearSession();
        }
      }

      if (!cancelled) setInitialized(true);
    };

    restore();
    return () => {
      cancelled = true;
    };
  }, [applyTokens, refreshSession, clearSession]);

  /* ---- Silent refresh shortly before the access token expires ------------ */
  useEffect(() => {
    clearTimeout(refreshTimer.current);
    if (!accessToken) return undefined;

    const payload = decodeJwtPayload(accessToken);
    if (!payload?.exp) return undefined;

    const delay = Math.max(payload.exp * 1000 - Date.now() - REFRESH_MARGIN_MS, 0);

    refreshTimer.current = setTimeout(async () => {
      const refreshed = await refreshSession();
      if (!refreshed) clearSession();
    }, delay);

    return () => clearTimeout(refreshTimer.current);
  }, [accessToken, refreshSession, clearSession]);

  /* ---- Public API -------------------------------------------------------- */

  /**
   * Log in with Keycloak (password grant).
   * The 3rd argument is ignored; it is kept so existing callers
   * (initiateLogin(username, password, false)) keep working.
   */
  const initiateLogin = useCallback(
    async (username, password) => {
      try {
        const result = await requestToken({
          grant_type: "password",
          client_id: KEYCLOAK_CLIENT_ID,
          username,
          password,
        });

        if (!result.ok) {
          return {
            success: false,
            requiresOtp: false,
            message: loginErrorMessage(result.status, result.data),
          };
        }

        const applied = applyTokens(result.data, username);
        if (!applied.success) {
          return { success: false, requiresOtp: false, message: applied.message };
        }

        return { success: true, requiresOtp: false, user: applied.user };
      } catch (error) {
        console.error("Keycloak login request failed:", error);
        return {
          success: false,
          requiresOtp: false,
          message: "Unable to reach the authentication service. Please try again.",
        };
      }
    },
    [applyTokens]
  );

  const login = initiateLogin;

  const logout = useCallback(async () => {
    const refreshToken = sessionStorage.getItem(KEYS.refresh);

    // Clear locally first so the UI logs out immediately.
    clearSession();

    // Best effort: end the Keycloak session too.
    if (refreshToken) {
      try {
        await fetch(LOGOUT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: KEYCLOAK_CLIENT_ID,
            refresh_token: refreshToken,
          }).toString(),
        });
      } catch (error) {
        console.warn("Keycloak logout failed:", error.message);
      }
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      authenticated,
      user,
      accessToken,
      initiateLogin,
      login,
      logout,
    }),
    [authenticated, user, accessToken, initiateLogin, login, logout]
  );

  if (!initialized) {
    return <Loader text="Loading Nishkaiv Solution..." fullScreen />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}