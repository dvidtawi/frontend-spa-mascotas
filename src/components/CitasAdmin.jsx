import { useEffect, useState } from 'react';
import { slotServices, scheduleUtils } from '../api/scheduleService';

const STATUS_STYLES = {
  en_revision: 'bg-yellow-100 text-yellow-800',
  confirmada: 'bg-green-100 text-green-800',
  en_proceso: 'bg-blue-100 text-blue-800',
  finalizada: 'bg-emerald-100 text-emerald-800',
  cancelada: 'bg-red-100 text-red-800',
};

export default function CitasAdmin() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    estado: '',
    fecha: '',
    groomer_id: '',
  });

  useEffect(() => {
    loadCitas();
  }, [filtros]);

  const loadCitas = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtros.estado) params.estado = filtros.estado;
      if (filtros.fecha) params.fecha = filtros.fecha;
      if (filtros.groomer_id) params.groomer_id = filtros.groomer_id;

      const res = await slotServices.getCitas(params);
      setCitas(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      setError('Error al cargar citas');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelCita = async (citaId) => {
    if (!window.confirm('¿Deseas cancelar esta cita?')) return;

    try {
      await slotServices.cancelarCita(citaId, 'Cancelada por administrador');
      setCitas((prev) =>
        prev.map((cita) => (cita.id === citaId ? { ...cita, estado: 'cancelada' } : cita))
      );
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cancelar cita');
    }
  };

  if (loading) {
    return <div className="py-8 text-center">Cargando citas...</div>;
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Gestion de Citas</h2>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 rounded-lg bg-gray-50 p-4">
        <h3 className="mb-4 font-semibold text-gray-900">Filtros</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Estado</label>
            <select
              name="estado"
              value={filtros.estado}
              onChange={handleFiltroChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="en_revision">En revision</option>
              <option value="confirmada">Confirmada</option>
              <option value="en_proceso">En proceso</option>
              <option value="finalizada">Finalizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Fecha</label>
            <input
              type="date"
              name="fecha"
              value={filtros.fecha}
              onChange={handleFiltroChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Groomer</label>
            <input
              type="text"
              name="groomer_id"
              value={filtros.groomer_id}
              onChange={handleFiltroChange}
              placeholder="ID del groomer"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {citas.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No hay citas que coincidan con los filtros
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b-2 border-gray-300 bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Cliente</th>
                <th className="px-4 py-2 text-left font-semibold">Mascota</th>
                <th className="px-4 py-2 text-left font-semibold">Servicio</th>
                <th className="px-4 py-2 text-left font-semibold">Fecha y Hora</th>
                <th className="px-4 py-2 text-left font-semibold">Duracion</th>
                <th className="px-4 py-2 text-left font-semibold">Estado</th>
                <th className="px-4 py-2 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((cita) => (
                <tr key={cita.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{cita.cliente_nombre}</td>
                  <td className="px-4 py-3 font-semibold">{cita.mascota_nombre}</td>
                  <td className="px-4 py-3">{cita.servicio_nombre}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p>{new Date(cita.fecha_inicio).toLocaleDateString('es-ES')}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(cita.fecha_inicio).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {scheduleUtils.formatearDuracion(
                      (new Date(cita.fecha_fin) - new Date(cita.fecha_inicio)) / 60000
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        STATUS_STYLES[cita.estado] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {cita.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      {(cita.estado === 'en_revision' || cita.estado === 'confirmada') && (
                        <button
                          onClick={() => handleCancelCita(cita.id)}
                          className="rounded bg-yellow-500 px-3 py-1 text-xs text-white transition hover:bg-yellow-600"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-4 text-sm text-gray-500">Total de citas: {citas.length}</p>
    </div>
  );
}
