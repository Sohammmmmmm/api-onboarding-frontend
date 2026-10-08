import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import ProtectedRoute from "./auth/ProtectedRoute";
import { useAuth } from "./auth/AuthProvider";

import MakerLayout from "./layouts/MakerLayout";
import CheckerLayout from "./layouts/CheckerLayout";
import PublisherLayout from "./layouts/PublisherLayout";
import AdminLayout from "./layouts/AdminLayout";

// Maker Pages
import MakerDashboard from "./pages/maker/MakerDashboard";
import ApiRequestForm from "./pages/maker/ApiRequestForm";
import RequestDetails from "./pages/maker/RequestDetails";
import Subscriptions from "./pages/maker/Subscriptions";
import Notifications from "./pages/maker/Notifications";
import MyApplications from "./pages/maker/MyApplications";
import ApplicationDetails from "./pages/maker/ApplicationDetails";

// Checker Pages
import CheckerDashboard from "./pages/checker/CheckerDashboard";
import CheckerReviewScreen from "./pages/checker/CheckerReviewScreen";

// Publisher Pages
import PublisherDashboard from "./pages/publisher/PublisherDashboard";
import PendingPublication from "./pages/publisher/PendingPublication";
import PublishedApis from "./pages/publisher/PublishedApis";
import PublisherApiDetails from "./pages/publisher/PublisherApiDetails";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ApplicationManagement from "./pages/admin/ApplicationManagement";
import MasterConfiguration from "./pages/admin/MasterConfiguration";
import AuditLogs from "./pages/admin/AuditLogs";
import SlaConfiguration from "./pages/admin/SlaConfiguration";
import NotificationConfiguration from "./pages/admin/NotificationConfiguration";
import UserManagement from "./pages/admin/UserManagement";
import UserDetail from "./pages/admin/UserDetail";

// Shared Pages
import ApiCatalogue from "./pages/catalogue/ApiCatalogue";

function RootRedirect() {
  const { authenticated, user } = useAuth();
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  const role = String(user?.role || "").toUpperCase().replace(/^ROLE_/, "");
  const destinations = {
    MAKER: "/",
    CHECKER: "/checker",
    PUBLISHER: "/publisher",
    ADMIN: "/admin",
  };
  if (role !== "MAKER") {
    return <Navigate to={destinations[role] || "/login"} replace />;
  }
  return <MakerDashboard />;
}

export default function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* CHECKER PORTAL ROUTES */}
      <Route
        path="/checker"
        element={
          <ProtectedRoute allowedRole="CHECKER">
            <CheckerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CheckerDashboard />} />
        <Route path="requests" element={<CheckerDashboard view="filtered" />} />
        <Route path="requests/:requestId" element={<CheckerReviewScreen />} />
        <Route path="catalogue" element={<ApiCatalogue />} />
        <Route path="clarifications" element={<CheckerDashboard view="clarifications" />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* PUBLISHER PORTAL ROUTES */}
      <Route
        path="/publisher"
        element={
          <ProtectedRoute allowedRole="PUBLISHER">
            <PublisherLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PublisherDashboard />} />
        <Route path="pending-publication" element={<PendingPublication />} />
        <Route path="published" element={<PublishedApis />} />
        <Route path="apis/:apiId" element={<PublisherApiDetails />} />
        <Route path="catalogue" element={<ApiCatalogue />} />
      </Route>

      {/* ADMIN PORTAL ROUTES */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="applications" element={<ApplicationManagement />} />
        <Route path="catalogue" element={<ApiCatalogue />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="users/:userId" element={<UserDetail />} />
        <Route path="master-configuration" element={<MasterConfiguration />} />
        <Route path="sla" element={<SlaConfiguration />} />
        <Route path="audit" element={<AuditLogs />} />
        <Route path="notifications" element={<NotificationConfiguration />} />
      </Route>

      {/* MAKER PORTAL ROUTES */}
      <Route
        element={
          <ProtectedRoute allowedRole="MAKER">
            <MakerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<RootRedirect />} />
        <Route path="/requests" element={<MakerDashboard />} />
        <Route path="/requests/new" element={<ApiRequestForm />} />
        <Route path="/requests/:requestId" element={<RequestDetails />} />
        <Route path="/applications" element={<MyApplications />} />
        <Route path="/applications/:applicationId" element={<ApplicationDetails />} />
        <Route path="/catalogue" element={<ApiCatalogue />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}