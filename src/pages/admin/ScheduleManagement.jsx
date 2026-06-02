import { useState } from 'react';
import ServiciosAdmin from '../../components/ServiciosAdmin';
import DisponibilidadSpaAdmin from '../../components/DisponibilidadSpaAdmin';
import AgendaAdmin from '../../components/AgendaAdmin';
import SolicitudesAdmin from '../../components/SolicitudesAdmin';
import BloqueosAdmin from '../../components/BloqueosAdmin';
import PosAdmin from '../../components/PosAdmin';
import ServiciosConcluidosAdmin from '../../components/ServiciosConcluidosAdmin';
import InventarioAdmin from '../../components/InventarioAdmin';
import InsumosAdmin from '../../components/InsumosAdmin';
import PromocionesAdmin from '../../components/PromocionesAdmin';
import ReportesAdmin from '../../components/ReportesAdmin';
import DashboardShell from '../../components/DashboardShell';

export default function ScheduleAdminDashboard() {
  const [tab, setTab] = useState('agenda');

  const tabs = [
    { id: 'agenda', label: 'Agenda' },
    { id: 'solicitudes', label: 'Solicitudes' },
    { id: 'concluidos', label: 'Servicios Concluidos' },
    { id: 'insumos', label: 'Insumos' },
    { id: 'promociones', label: 'Promociones' },
    { id: 'reportes', label: 'Reportes' },
    { id: 'bloqueos', label: 'Horarios Groomer' },
    { id: 'pagos', label: 'POS y Caja' },
    { id: 'servicios', label: 'Servicios' },
    { id: 'inventario', label: 'Inventario' },
    { id: 'disponibilidad', label: 'Horarios del Spa' },
  ];

  return (
    <DashboardShell
      title="Gestión operativa de agenda"
      tabs={tabs}
      activeTab={tab}
      onTabChange={setTab}
    >
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        {tab === 'agenda' && <AgendaAdmin />}
        {tab === 'solicitudes' && <SolicitudesAdmin />}
        {tab === 'concluidos' && <ServiciosConcluidosAdmin />}
        {tab === 'insumos' && <InsumosAdmin />}
        {tab === 'promociones' && <PromocionesAdmin />}
        {tab === 'reportes' && <ReportesAdmin />}
        {tab === 'bloqueos' && <BloqueosAdmin />}
        {tab === 'pagos' && <PosAdmin />}
        {tab === 'servicios' && <ServiciosAdmin />}
        {tab === 'inventario' && <InventarioAdmin />}
        {tab === 'disponibilidad' && <DisponibilidadSpaAdmin />}
      </div>
    </DashboardShell>
  );
}
