import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import PetManager from '../../components/PetManager';
import CitasCliente from '../../components/CitasCliente';
import TiendaPedidosCliente from '../../components/TiendaPedidosCliente';
import DashboardShell from '../../components/DashboardShell';

const sections = {
  tienda: {
    title: 'Tienda y pedidos',
    description: 'Compra productos, revisa promociones y gestiona tus pedidos.',
  },
  mascotas: {
    title: 'Mis mascotas',
    description: 'Administra los perfiles de tus mascotas y sus documentos.',
  },
  citas: {
    title: 'Mis citas',
    description: 'Consulta, solicita y administra tus servicios de grooming.',
  },
};

export default function DashboardCliente() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const initialSection = location.pathname.includes('/schedule')
    ? 'citas'
    : (searchParams.get('section') || 'tienda');
  const [section, setSection] = useState(sections[initialSection] ? initialSection : 'tienda');

  useEffect(() => {
    const nextSection = location.pathname.includes('/schedule')
      ? 'citas'
      : (searchParams.get('section') || 'tienda');
    if (sections[nextSection] && nextSection !== section) {
      setSection(nextSection);
    }
  }, [location.pathname, searchParams, section]);

  const activeInfo = sections[section] || sections.tienda;

  return (
    <DashboardShell title={activeInfo.title} tabs={[]} activeTab="" onTabChange={null}>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Cliente</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">{activeInfo.title}</h2>
          <p className="mt-1 text-slate-600">{activeInfo.description}</p>
        </div>

        {section === 'mascotas' && <PetManager />}
        {section === 'citas' && <CitasCliente />}
        {section === 'tienda' && <TiendaPedidosCliente />}
      </div>
    </DashboardShell>
  );
}
