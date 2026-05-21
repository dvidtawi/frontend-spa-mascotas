import { useState, useEffect } from 'react';
import { slotServices, scheduleUtils } from '../api/scheduleService';

export default function CitasAdmin() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    estado: '',
    fecha: '',
    groomer_id: ''
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
      setCitas(Array.isArray(res.data) ? res.data : (res.data?.citas || []));
    } catch (err) {
      setError('Error al cargar citas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancelCita = async (citaId) => {
    if (!window.confirm('¿Deseas cancelar esta cita?')) return;

    try {
      await slotServices.cancelarCita(citaId, 'Cancelada por administrador');
      setCitas(citas.map(c => c.id === citaId ? { ...c, estado: 'cancelada' } : c));
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cancelar cita');
    }
  };

  const handleDeleteCita = async (citaId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta cita?')) return;

    try {
      await slotServices.deleteCita(citaId);
      setCitas(citas.filter(c => c.id !== citaId));
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar cita');
    }
  };

  const getStatusBadgeColor = (estado) => {
    const colors = {
      confirmada: 'bg-green-100 text-green-800',
      pendiente: 'bg-yellow-100 text-yellow-800',
      cancelada: 'bg-red-100 text-red-800',
      completada: 'bg-blue-100 text-blue-800'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-8">Cargando citas...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Gestión de Citas</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Estado
            </label>
            <select
              name="estado"
              value={filtros.estado}
              onChange={handleFiltroChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="confirmada">Confirmada</option>
              <option value="pendiente">Pendiente</option>
              <option value="cancelada">Cancelada</option>
              <option value="completada">Completada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              name="fecha"
              value={filtros.fecha}
              onChange={handleFiltroChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Groomer
            </label>
            <input
              type="text"
              name="groomer_id"
              value={filtros.groomer_id}
              onChange={handleFiltroChange}
              placeholder="ID del groomer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tabla de citas */}
      <div className="overflow-x-auto">
        {citas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No hay citas que coincidan con los filtros
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Cliente</th>
                <th className="px-4 py-2 text-left font-semibold">Mascota</th>
                <th className="px-4 py-2 text-left font-semibold">Servicio</th>
                <th className="px-4 py-2 text-left font-semibold">Fecha y Hora</th>
                <th className="px-4 py-2 text-left font-semibold">Duración</th>
                <th className="px-4 py-2 text-left font-semibold">Estado</th>
                <th className="px-4 py-2 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citas.map(cita => (
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
                          minute: '2-digit'
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
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(cita.estado)}`}>
                      {cita.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      {cita.estado === 'confirmada' && (
                        <button
                          onClick={() => handleCancelCita(cita.id)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition text-xs"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCita(cita.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-xs"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-sm text-gray-500 mt-4">
        Total de citas: {citas.length}
      </p>
    </div>
  );
}
