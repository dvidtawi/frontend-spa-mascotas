import { useState, useEffect } from 'react';
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
    activo: true
  });

  useEffect(() => {
    loadServicios();
  }, []);

  const loadServicios = async () => {
    try {
      setLoading(true);
      const res = await scheduleServices.getServicios();
      // Mostrar tanto activos como inactivos
      const servicios = Array.isArray(res.data) ? res.data : [];
      setServicios(servicios);
    } catch (err) {
      setError('Error al cargar servicios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      duracion_minutos: '',
      precio: '',
      activo: true
    });
    setEditingServicio(null);
  };

  const handleEdit = (servicio) => {
    setFormData({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || '',
      duracion_minutos: servicio.duracion_base || servicio.duracion_minutos || '',
      precio: servicio.precio || '',
      activo: servicio.estado_activo !== undefined ? servicio.estado_activo : (servicio.activo || true)
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
        duracion_base: parseInt(formData.duracion_minutos),
        precio: parseFloat(formData.precio),
        estado_activo: formData.activo
      };

      if (editingServicio) {
        await scheduleServices.updateServicio(editingServicio, submitData);
      } else {
        await scheduleServices.createServicio(submitData);
      }

      await loadServicios();
      resetForm();
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar servicio');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este servicio?')) return;

    try {
      await scheduleServices.deleteServicio(id);
      setServicios(servicios.filter(s => s.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar servicio');
    }
  };

  if (loading && !showForm) {
    return <div className="text-center py-8">Cargando servicios...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Servicios</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Nuevo Servicio
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6 border-l-4 border-blue-600">
          <h3 className="text-lg font-bold mb-4">
            {editingServicio ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Baño completo"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Duración (minutos) *
                </label>
                <input
                  type="number"
                  name="duracion_minutos"
                  value={formData.duracion_minutos}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 60"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Precio ($) *
                </label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 40.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Activo
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleFormChange}
                    className="w-4 h-4"
                  />
                  <span className="ml-2 text-sm text-gray-700">Servicio activo</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe el servicio..."
                rows="3"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b-2 border-gray-300">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Nombre</th>
              <th className="px-4 py-2 text-left font-semibold">Duración</th>
              <th className="px-4 py-2 text-left font-semibold">Precio</th>
              <th className="px-4 py-2 text-left font-semibold">Estado</th>
              <th className="px-4 py-2 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map(servicio => (
              <tr key={servicio.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-900">
                  {servicio.nombre}
                </td>
                <td className="px-4 py-3">{servicio.duracion_base || servicio.duracion_minutos} min</td>
                <td className="px-4 py-3">${parseFloat(servicio.precio).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      servicio.estado_activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {servicio.estado_activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(servicio)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(servicio.id)}
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
      </div>
    </div>
  );
}
