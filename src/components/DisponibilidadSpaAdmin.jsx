import { useState, useEffect } from 'react';
import { spaAvailabilityServices } from '../api/scheduleService';

export default function DisponibilidadSpaAdmin() {
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    dia_semana: 1,
    hora_inicio: '09:00',
    hora_fin: '18:00',
    capacidad_diaria: 10
  });

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  useEffect(() => {
    loadDisponibilidades();
  }, []);

  const loadDisponibilidades = async () => {
    try {
      setLoading(true);
      const res = await spaAvailabilityServices.getDisponibilidad();
      const datos = Array.isArray(res.data) ? res.data : (res.data?.disponibilidades || []);
      setDisponibilidades(datos);
      setError(null);
    } catch (err) {
      setError('Error al cargar disponibilidades');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacidad_diaria' ? parseInt(value) : value
    }));
  };

  const resetForm = () => {
    setFormData({
      dia_semana: 1,
      hora_inicio: '09:00',
      hora_fin: '18:00',
      capacidad_diaria: 10
    });
    setEditingId(null);
  };

  const handleEdit = (disp) => {
    setFormData({
      dia_semana: disp.dia_semana,
      hora_inicio: disp.hora_inicio,
      hora_fin: disp.hora_fin,
      capacidad_diaria: disp.capacidad_diaria
    });
    setEditingId(disp.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.hora_inicio || !formData.hora_fin || formData.capacidad_diaria <= 0) {
      setError('Por favor completa todos los campos correctamente');
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        await spaAvailabilityServices.updateHorario(editingId, formData);
      } else {
        await spaAvailabilityServices.createHorario(formData);
      }

      await loadDisponibilidades();
      resetForm();
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta disponibilidad?')) return;

    try {
      await spaAvailabilityServices.deleteHorario(id);
      setDisponibilidades(disponibilidades.filter(d => d.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar disponibilidad');
    }
  };

  if (loading && !showForm) {
    return <div className="text-center py-8">Cargando disponibilidades...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Horarios del Spa</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Agregar Horario
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
            {editingId ? 'Editar Horario' : 'Nuevo Horario'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Día de la Semana *
                </label>
                <select
                  name="dia_semana"
                  value={formData.dia_semana}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {diasSemana.map((dia, idx) => (
                    <option key={idx} value={idx + 1}>
                      {dia}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Hora Inicio *
                </label>
                <input
                  type="time"
                  name="hora_inicio"
                  value={formData.hora_inicio}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Hora Fin *
                </label>
                <input
                  type="time"
                  name="hora_fin"
                  value={formData.hora_fin}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Capacidad Diaria (citas) *
                </label>
                <input
                  type="number"
                  name="capacidad_diaria"
                  value={formData.capacidad_diaria}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
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
              <th className="px-4 py-2 text-left font-semibold">Día</th>
              <th className="px-4 py-2 text-left font-semibold">Hora Inicio</th>
              <th className="px-4 py-2 text-left font-semibold">Hora Fin</th>
              <th className="px-4 py-2 text-left font-semibold">Capacidad</th>
              <th className="px-4 py-2 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {disponibilidades.map(disp => (
              <tr key={disp.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-900">
                  {diasSemana[disp.dia_semana - 1]}
                </td>
                <td className="px-4 py-3">{disp.hora_inicio}</td>
                <td className="px-4 py-3">{disp.hora_fin}</td>
                <td className="px-4 py-3">{disp.capacidad_diaria} citas</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(disp)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(disp.id)}
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

      {disponibilidades.length === 0 && !showForm && (
        <div className="text-center py-8 text-gray-500">
          No hay horarios configurados. Crea uno nuevo para comenzar.
        </div>
      )}
    </div>
  );
}
