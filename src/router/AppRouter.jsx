import {
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import Landing from '../pages/Landing';
import Login from '../pages/auth/Login';           // ← 2 puntos + pages
import Register from '../pages/auth/Register';     // ← 2 puntos + pages
import VerifyEmail from '../pages/auth/VerifyEmail';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import ChangePassword from '../pages/auth/ChangePassword';
import Users from '../pages/admin/Users';
import AuditLogs from '../pages/admin/AuditLogs';
import Setup2FA from '../pages/admin/Setup2FA';
// CORREGIDO: desde auth/AppRouter.jsx a pages/admin/
import DashboardAdmin from '../pages/admin/Dashboard';
import DashboardCliente from '../pages/cliente/Dashboard';
import DashboardGroomer from '../pages/groomer/Dashboard';
import DashboardRecepcion from '../pages/recepcion/Dashboard';

import ProtectedRoute from '../auth/ProtectedRoute';
import RoleRoute from '../auth/RoleRoute';

const AppRouter = () => {

  return (

    <Routes>

      <Route
        path="/"
        element={<Landing />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/verify-email"
        element={<VerifyEmail />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      {/* ADMIN */}

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

      {/* GROOMER */}

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

      {/* RECEPCION */}

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

      {/* CLIENTE */}

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
        path="*"
        element={<Navigate to="/login" />}
      />
      <Route
        path="/admin/users"
        element={
            <ProtectedRoute>
            <RoleRoute roles={[1]}>
                <Users />
            </RoleRoute>
            </ProtectedRoute>
        }
        />

        <Route
        path="/admin/audit"
        element={
            <ProtectedRoute>
            <RoleRoute roles={[1]}>
                <AuditLogs />
            </RoleRoute>
            </ProtectedRoute>
        }
        />

        <Route
        path="/admin/setup-2fa"
        element={
            <ProtectedRoute>
            <RoleRoute roles={[1]}>
                <Setup2FA />
            </RoleRoute>
            </ProtectedRoute>
        }
        />

    </Routes>
  );
};

export default AppRouter;