import "./fonts/NotoSansKhmerFont";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";

import Layout from "./layout/Layouts";
import {
  Auth,
  Home,
  Orders,
  Tables,
  POSTerminal,
  Menu,
  Customer,
  Inventory,
  Report,
  Dashboard,
} from "./pages";

// ✅ ProtectedRoutes with optional adminOnly prop
function ProtectedRoutes({ children, adminOnly = false }) {
  const user = useSelector((state) => state.user);

  if (!user?.isAuth) return <Navigate to="/auth" />; // Not authenticated
  if (adminOnly && user.role !== "Admin") return <Navigate to="/" />; // Admin-only

  return children;
}

function App() {
  const { isAuth } = useSelector((state) => state.user);

  return (
    <Router>
      <Routes>
        {/* AUTH PAGE */}
        <Route path="/auth" element={isAuth ? <Navigate to="/" /> : <Auth />} />

        {/* MAIN LAYOUT */}
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <ProtectedRoutes>
                <Home />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoutes>
                <Orders />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/tables"
            element={
              <ProtectedRoutes>
                <Tables />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/pos"
            element={
              <ProtectedRoutes>
                <POSTerminal />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/menu"
            element={
              <ProtectedRoutes>
                <Menu />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/customer"
            element={
              <ProtectedRoutes>
                <Customer />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoutes>
                <Inventory />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoutes>
                <Report />
              </ProtectedRoutes>
            }
          />

          {/* ADMIN DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoutes adminOnly={true}>
                <Dashboard />
              </ProtectedRoutes>
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
