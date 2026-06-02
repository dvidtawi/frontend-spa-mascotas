import { Link, useNavigate } from 'react-router-dom';
import DashboardShell from '../../components/DashboardShell';

export default function DashboardAdmin() {
  const navigate = useNavigate();

  const tabs = [
    { id: 'dashboard', label: 'Inicio' },
    { id: 'schedule', label: 'Agenda' },
    { id: 'users', label: 'Usuarios' },
    { id: 'audit', label: 'Auditoría' },
  ];

  const handleTabChange = (tab) => {
    if (tab === 'schedule') navigate('/admin/schedule');
    if (tab === 'users') navigate('/admin/users');
    if (tab === 'audit') navigate('/admin/audit');
  };

  return (
    <DashboardShell title="Administrador" tabs={tabs} activeTab="dashboard" onTabChange={handleTabChange}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Link
          to="/admin/schedule"
          className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <h2 className="mb-2 text-xl font-semibold text-slate-900">Agenda Operativa</h2>
          <p className="text-slate-600">Calendario maestro, solicitudes, bloqueos y caja simulada.</p>
        </Link>

        <Link
          to="/admin/users"
          className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <h2 className="mb-2 text-xl font-semibold text-slate-900">Gestión de usuarios</h2>
          <p className="text-slate-600">Crear, editar y gestionar usuarios del sistema.</p>
        </Link>

        <Link
          to="/admin/audit"
          className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <h2 className="mb-2 text-xl font-semibold text-slate-900">Auditoría</h2>
          <p className="text-slate-600">Ver logs de auditoría y trazabilidad del sistema.</p>
        </Link>
      </div>
    </DashboardShell>
  );
}
