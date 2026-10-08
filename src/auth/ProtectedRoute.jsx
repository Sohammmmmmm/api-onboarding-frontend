import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const ROLE_HOME = {
  MAKER: "/",
  CHECKER: "/checker",
  PUBLISHER: "/publisher",
  ADMIN: "/admin",
};

const normalizeRole = (role) =>
  String(role || "").toUpperCase().replace(/^ROLE_/, "");

export default function ProtectedRoute({ children, allowedRole }) {
  const { authenticated, user } = useAuth();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = normalizeRole(user?.role);
  const userRoles = (user?.roles || []).map(normalizeRole);
  if (userRole) userRoles.push(userRole);

  if (allowedRole && !userRoles.includes(normalizeRole(allowedRole))) {
    return <Navigate to={ROLE_HOME[userRole] || "/login"} replace />;
  }

  return children;
}