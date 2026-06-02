import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import NotificationBell from './NotificationBell';
import { FiMenu } from 'react-icons/fi';

export default function Navbar({
  title,
  tabs = [],
  activeTab = '',
  onTabChange,
  onMenuToggle,
}) {
  const { user } = useAuth();

  const resolvedTitle = title || (
    user?.rol === 1 ? 'Administrador'
      : user?.rol === 2 ? 'Groomer'
        : user?.rol === 3 ? 'Recepcionista'
          : user?.rol === 4 ? 'Cliente'
            : 'PetSpa Mascotas'
  );

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          {user && onMenuToggle && (
            <button
              type="button"
              onClick={onMenuToggle}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
              aria-label="Abrir o cerrar menu"
            >
              <FiMenu className="text-xl" />
            </button>
          )}
          <div>
            <h1 className="text-lg font-bold text-slate-900 md:text-2xl">{resolvedTitle}</h1>
            {user && (
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                {user?.rol === 1 ? 'Panel administrativo' :
                  user?.rol === 2 ? 'Panel grooming' :
                    user?.rol === 3 ? 'Panel recepción' :
                      user?.rol === 4 ? 'Panel cliente' : ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && <NotificationBell />}
          {!user && (
            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white">
                Iniciar sesión
              </Link>
              <Link to="/register" className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>

      {user && tabs.length > 0 && (
        <div className="border-t border-slate-200 px-4 py-3 md:px-6">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange?.(tab.id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
