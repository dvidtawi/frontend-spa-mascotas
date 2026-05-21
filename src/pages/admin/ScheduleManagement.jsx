import { useState } from 'react';
import ServiciosAdmin from '../../components/ServiciosAdmin';
import CitasAdmin from '../../components/CitasAdmin';
import DisponibilidadSpaAdmin from '../../components/DisponibilidadSpaAdmin';

export default function ScheduleAdminDashboard() {
  const [tab, setTab] = useState('servicios'); // 'servicios' | 'citas' | 'disponibilidad'

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestión de Agenda y Servicios</h1>

        {/* Tabs */}
        <div className="flex border-b mb-6 bg-white rounded-t-lg overflow-hidden">
          <button
            onClick={() => setTab('servicios')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              tab === 'servicios'
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Servicios
          </button>
          <button
            onClick={() => setTab('citas')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              tab === 'citas'
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Citas
          </button>
          <button
            onClick={() => setTab('disponibilidad')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              tab === 'disponibilidad'
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Disponibilidad del Spa
          </button>
        </div>

        {/* Contenido */}
        <div className="bg-white rounded-b-lg">
          {tab === 'servicios' && <ServiciosAdmin />}
          {tab === 'citas' && <CitasAdmin />}
          {tab === 'disponibilidad' && <DisponibilidadSpaAdmin />}
        </div>
      </div>
    </div>
  );
}
