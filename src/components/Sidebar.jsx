import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const dashboardRoute = {
  1: "/admin",
  2: "/groomer",
  3: "/recepcion",
  4: "/cliente",
};

export default function Sidebar({ onChangePassword }) {

  const { user } = useAuth();

  if (!user) return null;

  return (

    <aside
      className="
      w-64
      bg-gray-900
      text-white
      min-h-screen
      p-6
      "
    >

      <h2
        className="
        text-2xl
        font-bold
        mb-8
        "
      >
        Panel
      </h2>

      <nav className="flex flex-col gap-4">

        <Link
          to={dashboardRoute[user.rol] || "/"}
          className="hover:text-blue-300"
        >
          Dashboard
        </Link>

        <div className="pt-4 border-t border-white/20 text-xs uppercase tracking-[.2em] text-gray-400">
          Cuenta
        </div>

        {onChangePassword ? (
          <button
            onClick={onChangePassword}
            className="text-left hover:text-blue-300"
          >
            Cambiar contraseña
          </button>
        ) : (
          <Link
            to="/change-password"
            className="hover:text-blue-300"
          >
            Cambiar contraseña
          </Link>
        )}

        <span className="text-sm text-gray-500">
          Mi cuenta (próximamente)
        </span>

        {user.rol === 1 && (
          <>
            <div className="pt-4 border-t border-white/20 text-xs uppercase tracking-[.2em] text-gray-400">
              Administrador
            </div>

            {user.primer_inicio ? (
              <Link
                to="/admin/setup-2fa"
                className="hover:text-blue-300"
              >
                Configurar 2FA
              </Link>
            ) : (
              <>
                <Link
                  to="/admin/users"
                  className="hover:text-blue-300"
                >
                  Usuarios
                </Link>

                <Link
                  to="/admin/audit"
                  className="hover:text-blue-300"
                >
                  Audit Logs
                </Link>

                {user.two_factor_enabled && (
                  <span className="text-sm text-emerald-300">
                    2FA activado
                  </span>
                )}
              </>
            )}
          </>
        )}

      </nav>

    </aside>
  );
}