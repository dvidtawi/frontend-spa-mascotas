import { useState } from 'react';
import ServiciosAdmin from '../../components/ServiciosAdmin';
import DisponibilidadSpaAdmin from '../../components/DisponibilidadSpaAdmin';
import AgendaAdmin from '../../components/AgendaAdmin';
import SolicitudesAdmin from '../../components/SolicitudesAdmin';
import BloqueosAdmin from '../../components/BloqueosAdmin';
import PosAdmin from '../../components/PosAdmin';
import ServiciosConcluidosAdmin from '../../components/ServiciosConcluidosAdmin';

export default function ScheduleAdminDashboard() {
  const [tab, setTab] = useState('agenda');

  const tabs = [
    { id: 'agenda', label: 'Agenda' },
    { id: 'solicitudes', label: 'Solicitudes' },
    { id: 'concluidos', label: 'Servicios Concluidos' },
    { id: 'bloqueos', label: 'Horarios Groomer' },
    { id: 'pagos', label: 'POS y Caja' },
    { id: 'servicios', label: 'Servicios' },
    { id: 'disponibilidad', label: 'Horarios del Spa' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Gestion Operativa de Agenda
        </h1>

        <div className="mb-6 flex flex-wrap overflow-hidden rounded-t-lg border-b bg-white">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`border-b-2 px-6 py-3 font-semibold transition ${
                tab === item.id
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="rounded-b-lg bg-white">
          {tab === 'agenda' && <AgendaAdmin />}
          {tab === 'solicitudes' && <SolicitudesAdmin />}
          {tab === 'concluidos' && <ServiciosConcluidosAdmin />}
          {tab === 'bloqueos' && <BloqueosAdmin />}
          {tab === 'pagos' && <PosAdmin />}
          {tab === 'servicios' && <ServiciosAdmin />}
          {tab === 'disponibilidad' && <DisponibilidadSpaAdmin />}
        </div>
      </div>
    </div>
  );
}
