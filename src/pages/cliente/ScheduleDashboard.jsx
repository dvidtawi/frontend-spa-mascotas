import PetManager from '../../components/PetManager';
import CitasCliente from '../../components/CitasCliente';

export default function DashboardClienteSchedule() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard - Cliente</h1>

        <div className="space-y-6">
          {/* Sección de Mascotas */}
          <PetManager />

          {/* Sección de Citas */}
          <CitasCliente />
        </div>
      </div>
    </div>
  );
}
