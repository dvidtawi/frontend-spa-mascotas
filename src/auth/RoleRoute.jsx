import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RoleRoute({
  children,
  roles,
}) {

  const { user } = useAuth();

  if (!user || !roles.includes(user.rol)) {
    return <Navigate to="/login" />;
  }

  return children;
}