import { Routes, Route, Navigate } from "react-router";
import Signup from "./components/Signup";
import Otp from "./components/Otp";
import RestaurantHome from "./components/RestaurantHome";

function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("fastor_token");
  if (token) {
    return <Navigate to="/restaurant" replace />;
  }
  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("fastor_token");
  if (!token) {
    return <Navigate to="/signup" replace />;
  }
  return <>{children}</>;
}

function App() {
  const token = localStorage.getItem("fastor_token");

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={token ? "/restaurant" : "/signup"} replace />}
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
      <Route
        path="/otp"
        element={
          <PublicRoute>
            <Otp />
          </PublicRoute>
        }
      />
      <Route
        path="/restaurant"
        element={
          <ProtectedRoute>
            <RestaurantHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate to={token ? "/restaurant" : "/signup"} replace />}
      />
    </Routes>
  );
}

export default App;
