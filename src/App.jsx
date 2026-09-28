import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import ProtectedRoute from "./auth/ProtectedRoute";

import MakerLayout from "./layouts/MakerLayout";

import MakerDashboard from "./pages/maker/MakerDashboard";
import ApiRequestForm from "./pages/maker/ApiRequestForm";
import RequestDetails from "./pages/maker/RequestDetails";
import Subscriptions from "./pages/maker/Subscriptions";
import Notifications from "./pages/maker/Notifications";

export default function App() {
  return (
    <Routes>

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        element={
          <ProtectedRoute>
            <MakerLayout />
          </ProtectedRoute>
        }
      >

        <Route
          path="/"
          element={<MakerDashboard />}
        />

        <Route
          path="/requests"
          element={<MakerDashboard />}
        />

        <Route
          path="/requests/new"
          element={<ApiRequestForm />}
        />

        <Route
          path="/requests/:requestId"
          element={<RequestDetails />}
        />

        <Route
          path="/subscriptions"
          element={<Subscriptions />}
        />

        <Route
          path="/notifications"
          element={<Notifications />}
        />

      </Route>

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
}