import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "../pages/auth/Login";

import ProtectedRoute
from "../auth/ProtectedRoute";

import RoleRoute
from "../auth/RoleRoute";

// TEMPORALES
const DashboardAdmin = () => <h1>ADMIN</h1>;
const DashboardCliente = () => <h1>CLIENTE</h1>;
const DashboardGroomer = () => <h1>GROOMER</h1>;
const DashboardRecepcion = () => <h1>RECEPCION</h1>;
const ChangePassword = () => <h1>CHANGE PASSWORD</h1>;

const AppRouter = () => {

  return (

    <Routes>

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/change-password"
        element={
          <ProtectedRoute>

            <ChangePassword />

          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>

            <RoleRoute roles={[1]}>

              <DashboardAdmin />

            </RoleRoute>

          </ProtectedRoute>
        }
      />

      <Route
        path="/cliente"
        element={
          <ProtectedRoute>

            <RoleRoute roles={[4]}>

              <DashboardCliente />

            </RoleRoute>

          </ProtectedRoute>
        }
      />

      <Route
        path="/groomer"
        element={
          <ProtectedRoute>

            <RoleRoute roles={[2]}>

              <DashboardGroomer />

            </RoleRoute>

          </ProtectedRoute>
        }
      />

      <Route
        path="/recepcion"
        element={
          <ProtectedRoute>

            <RoleRoute roles={[3]}>

              <DashboardRecepcion />

            </RoleRoute>

          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={
          <Navigate to="/login" />
        }
      />

    </Routes>
  );
};

export default AppRouter;