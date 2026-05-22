import { useEffect, useState } from 'react';
import { scheduleServices } from '../api/scheduleService';

export default function ServiciosAdmin() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingServicio, setEditingServicio] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    duracion_minutos: '',
    precio: '',
  });

  useEffect(() => {
    loadServicios();
  }, []);

  const loadServicios = async () => {
    try {
      setLoading(true);
      const res = await scheduleServices.getServicios({ includeInactive: true });
      setServicios(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      setError('Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      duracion_minutos: '',
      precio: '',
    });
    setEditingServicio(null);
  };

  const handleEdit = (servicio) => {
    setFormData({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || '',
      duracion_minutos: servicio.duracion_base || servicio.duracion_minutos || '',
      precio: servicio.precio || '',
    });
    setEditingServicio(servicio.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.duracion_minutos || !formData.precio) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        duracion_base: parseInt(formData.duracion_minutos, 10),
        precio: parseFloat(formData.precio),
      };

      if (editingServicio) {
        await scheduleServices.updateServicio(editingServicio, submitData);
      } else {
        await scheduleServices.createServicio(submitData);
      }

      await loadServicios();
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar servicio');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (servicio) => {
    const nuevoEstado = !servicio.estado_activo;
    const mensaje = nuevoEstado
      ? '¿Deseas volver a activar este servicio?'
      : '¿Deseas cambiar este servicio a inactivo?';

    if (!window.confirm(mensaje)) return;

    try {
      await scheduleServices.updateServicio(servicio.id, { estado_activo: nuevoEstado });
      await loadServicios();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar el estado del servicio');
    }
  };

  if (loading && !showForm) {
    return <div className="py-8 text-center">Cargando servicios...</div>;
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestion de Servicios</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
        >
          + Nuevo Servicio
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6 rounded-lg border-l-4 border-blue-600 bg-gray-50 p-6">
          <h3 className="mb-4 text-lg font-bold">
            {editingServicio ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Ej: Bano completo"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Duracion (minutos) *</label>
                <input
                  type="number"
                  name="duracion_minutos"
                  value={formData.duracion_minutos}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  min="1"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Precio *</label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Descripcion</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                rows="3"
                placeholder="Describe el servicio..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-400"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="flex-1 rounded-lg bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b-2 border-gray-300 bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Nombre</th>
              <th className="px-4 py-2 text-left font-semibold">Duracion</th>
              <th className="px-4 py-2 text-left font-semibold">Precio</th>
              <th className="px-4 py-2 text-left font-semibold">Estado</th>
              <th className="px-4 py-2 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((servicio) => (
              <tr key={servicio.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-900">{servicio.nombre}</td>
                <td className="px-4 py-3">{servicio.duracion_base || servicio.duracion_minutos} min</td>
                <td className="px-4 py-3">Bs {parseFloat(servicio.precio).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      servicio.estado_activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {servicio.estado_activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(servicio)}
                      className="rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleStatus(servicio)}
                      className={`rounded px-3 py-1 text-xs text-white ${
                        servicio.estado_activo
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {servicio.estado_activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
