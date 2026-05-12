import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RoleRoute({
  children,
  roles,
}) {

  const { user } = useAuth();
  const location = useLocation();

  if (!user || !roles.includes(user.rol)) {
    return <Navigate to="/login" />;
  }

  if (
    user.rol === 1 &&
    user.primer_inicio &&
    !user.dos_fa &&
    location.pathname !== "/admin/setup-2fa"
  ) {
    return <Navigate to="/admin/setup-2fa" replace />;
  }

  return children;
}