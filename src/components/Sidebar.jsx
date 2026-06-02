import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { clearTokens } from '../utils/token';
import { FiX } from 'react-icons/fi';

const dashboardRoute = {
  1: '/admin',
  2: '/groomer',
  3: '/recepcion',
  4: '/cliente',
};

export default function Sidebar({ onChangePassword, open = false, onClose }) {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogoutAll = async () => {
    const confirmed = window.confirm('¿Estás seguro de cerrar sesión en todos los dispositivos?');
    if (!confirmed) return;

    try {
      await api.post('/auth/logout-all');
      toast.success('Sesiones cerradas');
    } catch (err) {
      toast.error('No se pudo cerrar sesión en todos los dispositivos');
    }

    clearTokens();
    setUser(null);
    navigate('/');
  };

  const handleLogout = async () => {
    const confirmed = window.confirm('¿Estás seguro de cerrar sesión?');
    if (!confirmed) return;

    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error('No se pudo cerrar sesión');
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-[1px] transition-opacity duration-300 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-[300px] flex-col overflow-hidden border-r border-slate-200 bg-white text-slate-800 shadow-[0_20px_60px_rgba(15,23,42,0.22)] transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="relative border-b border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-6 py-5 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.35),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.18),transparent_40%)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-sky-200/80">PetSpa</p>
              <h2 className="mt-1 text-2xl font-black">Panel</h2>
              <p className="mt-1 text-sm text-slate-200/90">{user?.nombre || user?.email || 'Mi cuenta'}</p>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Cerrar menú"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
          <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Navegación
          </div>

          <Link
            to={dashboardRoute[user.rol] || '/'}
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-white"
          >
            Dashboard
          </Link>

          {user.rol === 1 && (
            <>
              <Link to="/admin/schedule" onClick={onClose} className="rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-slate-100">
                Agenda operativa
              </Link>
              <Link to="/admin/users" onClick={onClose} className="rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-slate-100">
                Usuarios
              </Link>
              <Link to="/admin/audit" onClick={onClose} className="rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-slate-100">
                Auditoría
              </Link>
            </>
          )}

          {user.rol === 3 && (
            <Link to="/admin/schedule" onClick={onClose} className="rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-slate-100">
              Agenda operativa
            </Link>
          )}

          {user.rol === 2 && (
            <Link to="/groomer" onClick={onClose} className="rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-slate-100">
              Mi agenda
            </Link>
          )}

          {user.rol === 4 && (
            <>
              <Link to="/cliente" onClick={onClose} className="rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-slate-100">
                Tienda
              </Link>
              <Link to="/cliente?section=mascotas" onClick={onClose} className="rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-slate-100">
                Mis mascotas
              </Link>
              <Link to="/cliente/schedule" onClick={onClose} className="rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-slate-100">
                Mis citas
              </Link>
            </>
          )}

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Mi cuenta
            </div>

            {onChangePassword ? (
              <button
                type="button"
                onClick={onChangePassword}
                className="mb-2 block w-full rounded-xl px-4 py-3 text-left font-medium text-slate-700 transition hover:bg-white"
              >
                Cambiar contraseña
              </button>
            ) : (
              <Link to="/change-password" className="mb-2 block rounded-xl px-4 py-3 font-medium text-slate-700 transition hover:bg-white">
                Cambiar contraseña
              </Link>
            )}

            <button
              type="button"
              onClick={handleLogoutAll}
              className="mb-2 block w-full rounded-xl px-4 py-3 text-left font-medium text-slate-700 transition hover:bg-white"
            >
              Cerrar sesión en todos los dispositivos
            </button>
          </div>

          <div className="mt-auto pt-3">
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full rounded-2xl bg-red-500 px-4 py-3 text-left font-semibold text-white shadow-sm transition hover:bg-red-600"
            >
              Cerrar sesión
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
