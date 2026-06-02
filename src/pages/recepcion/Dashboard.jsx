import { Link, useNavigate } from 'react-router-dom';
import DashboardShell from '../../components/DashboardShell';

export default function DashboardRecepcion() {
  const navigate = useNavigate();

  const tabs = [
    { id: 'dashboard', label: 'Inicio' },
    { id: 'schedule', label: 'Agenda' },
    { id: 'inventario', label: 'Insumos' },
    { id: 'pagos', label: 'POS' },
  ];

  const handleTabChange = (tab) => {
    if (tab === 'schedule') navigate('/admin/schedule');
    if (tab === 'inventario') navigate('/admin/schedule?tab=insumos');
    if (tab === 'pagos') navigate('/admin/schedule?tab=pagos');
  };

  return (
    <DashboardShell title="Recepción" tabs={tabs} activeTab="dashboard" onTabChange={handleTabChange}>
      <div className="mt-2 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Link
          to="/admin/schedule"
          className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <h2 className="mb-2 text-xl font-semibold text-slate-900">Agenda y solicitudes</h2>
          <p className="text-slate-600">Controlar citas, aprobar solicitudes, bloquear horarios y reprogramar.</p>
        </Link>

        <Link
          to="/admin/schedule"
          className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <h2 className="mb-2 text-xl font-semibold text-slate-900">POS simulado</h2>
          <p className="text-slate-600">Registrar cobros base y revisar el cierre diario por método de pago.</p>
        </Link>
      </div>
    </DashboardShell>
  );
}
