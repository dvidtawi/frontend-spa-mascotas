import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({
  children,
}) {

  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!user) {
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