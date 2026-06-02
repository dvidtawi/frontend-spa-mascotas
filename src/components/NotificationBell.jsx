import { useEffect, useRef, useState } from 'react';
import { FiBell, FiCheck, FiCheckSquare } from 'react-icons/fi';
import { notificationServices } from '../api/scheduleService';

const formatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('es-BO', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

export default function NotificationBell({ className = '' }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [blink, setBlink] = useState(false);
  const prevUnreadRef = useRef(0);

  const refresh = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [listRes, countRes] = await Promise.all([
        notificationServices.getMine({ limit: 50 }),
        notificationServices.countUnread(),
      ]);

      const list = Array.isArray(listRes.data) ? listRes.data : [];
      const count = Number(countRes.data?.total || 0);
      setNotifications(list);
      setUnreadCount(count);
      setError(null);

      if (count > prevUnreadRef.current) {
        setBlink(true);
        setTimeout(() => setBlink(false), 1400);
      }
      prevUnreadRef.current = count;
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron cargar las notificaciones');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(() => refresh(true), 25000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    try {
      await notificationServices.markRead(id);
      await refresh(true);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo marcar la notificacion');
    }
  };

  const markAllRead = async () => {
    try {
      await notificationServices.markAllRead();
      await refresh(true);
      setOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo marcar todo como leido');
    }
  };

  return (
    <div className={`fixed right-4 top-4 z-[90] ${className}`}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={`flex items-center gap-2 rounded-full border border-white/40 bg-slate-900 px-4 py-3 text-white shadow-lg transition hover:scale-[1.02] ${blink ? 'ring-4 ring-emerald-300' : ''}`}
        >
          <FiBell className="text-lg" />
          <span className="text-sm font-semibold">Notificaciones</span>
          {unreadCount > 0 && (
            <span className="min-w-6 rounded-full bg-emerald-500 px-2 py-0.5 text-center text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 mt-3 w-[24rem] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
              <div>
                <p className="font-bold text-gray-900">Centro de notificaciones</p>
                <p className="text-xs text-gray-500">{unreadCount} sin leer</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refresh}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700"
                >
                  Actualizar
                </button>
                <button
                  type="button"
                  onClick={markAllRead}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Marcar todo
                </button>
              </div>
            </div>

            <div className="max-h-[32rem] overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">Cargando notificaciones...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">No tienes notificaciones pendientes.</div>
              ) : (
                notifications.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => (item.leido ? null : markRead(item.id))}
                    className="block w-full border-b px-4 py-3 text-left transition hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="flex items-center gap-2 font-semibold text-gray-900">
                          <FiCheckSquare className="text-emerald-600" />
                          {item.titulo}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">{item.mensaje}</p>
                        <p className="mt-1 text-xs text-gray-400">{formatTime(item.created_at)}</p>
                      </div>
                      {!item.leido ? (
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      ) : (
                        <FiCheck className="mt-1 text-gray-400" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {error && (
              <div className="border-t border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
