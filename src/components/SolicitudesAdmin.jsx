import { useEffect, useState } from 'react';
import { groomerAvailabilityServices, slotServices } from '../api/scheduleService';

const formatHour = (value) => String(value || '').slice(0, 5);

export default function SolicitudesAdmin() {
  const today = new Date().toISOString().slice(0, 10);
  const [solicitudes, setSolicitudes] = useState([]);
  const [groomers, setGroomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({
    groomer_id: '',
    fecha: today,
    hora_inicio: '09:00',
    estado: 'en_revision',
    notas: '',
  });

  useEffect(() => {
    loadSolicitudes();
    loadGroomers();
  }, []);

  const loadSolicitudes = async () => {
    try {
      setLoading(true);
      try {
        const res = await slotServices.getCitas({ estado: 'en_revision', include_diagnostico: true });
        setSolicitudes(res.data || []);
        setError(null);
      } catch (diagnosticError) {
        const fallbackRes = await slotServices.getCitas({ estado: 'en_revision', include_diagnostico: false });
        setSolicitudes(resolverSolicitudesFallback(fallbackRes.data || []));
        setError('Se cargaron las solicitudes sin diagnóstico avanzado. Revisa backend para el detalle completo.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const resolverSolicitudesFallback = (items) =>
    items.map((item) => ({
      ...item,
      diagnostico: item.diagnostico || {
        errores: [],
        advertencias: ['Diagnóstico no disponible temporalmente para esta solicitud.'],
      },
    }));

  const loadGroomers = async () => {
    try {
      const res = await groomerAvailabilityServices.getGroomers();
      setGroomers(res.data || []);
    } catch (err) {
      setError('No se pudo cargar la lista de groomers');
    }
  };

  const openEdit = (cita) => {
    setEditing(cita);
    setEditData({
      groomer_id: cita.groomer_id || '',
      fecha: String(cita.fecha).slice(0, 10),
      hora_inicio: formatHour(cita.hora_inicio),
      estado: cita.estado,
      notas: cita.notas || '',
    });
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    if (!editing) return;

    try {
      await slotServices.updateCita(editing.id, editData);
      setEditing(null);
      await loadSolicitudes();
    } catch (err) {
      setError(err.response?.data?.errores?.join(', ') || err.response?.data?.error || 'No se pudo actualizar la solicitud');
    }
  };

  const aprobar = async (id) => {
    try {
      await slotServices.aprobarCita(id);
      await loadSolicitudes();
    } catch (err) {
      setError(err.response?.data?.errores?.join(', ') || err.response?.data?.error || 'No se pudo aprobar la solicitud');
    }
  };

  const rechazar = async (id) => {
    const razon = window.prompt('Motivo de rechazo:', 'No disponible en el horario solicitado');
    if (razon === null) return;

    try {
      await slotServices.rechazarCita(id, { razon });
      await loadSolicitudes();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo rechazar la solicitud');
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Bandeja de Solicitudes</h2>
        <p className="text-sm text-gray-500">Recepcion puede revisar, editar y aprobar con diagnostico previo.</p>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {editing && (
        <form onSubmit={guardarEdicion} className="mb-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-6">
          <h3 className="mb-4 text-lg font-bold">Editar solicitud antes de aprobar</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <select
              value={editData.groomer_id}
              onChange={(e) => setEditData((prev) => ({ ...prev, groomer_id: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2"
              required
            >
              <option value="">Seleccionar groomer...</option>
              {groomers.map((groomer) => (
                <option key={groomer.id} value={groomer.id}>
                  {groomer.nombre}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={editData.fecha}
              onChange={(e) => setEditData((prev) => ({ ...prev, fecha: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2"
              required
            />

            <input
              type="time"
              value={editData.hora_inicio}
              onChange={(e) => setEditData((prev) => ({ ...prev, hora_inicio: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2"
              required
            />

            <input
              type="text"
              value={editData.notas}
              onChange={(e) => setEditData((prev) => ({ ...prev, notas: e.target.value }))}
              placeholder="Notas internas"
              className="rounded-lg border border-gray-300 px-3 py-2 md:col-span-3"
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 text-white">
              Guardar cambios
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg bg-gray-300 px-4 py-2 text-gray-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-8 text-center">Cargando solicitudes...</div>
      ) : solicitudes.length === 0 ? (
        <div className="py-8 text-center text-gray-500">No hay solicitudes pendientes.</div>
      ) : (
        <div className="space-y-4">
          {solicitudes.map((cita) => {
            const errores = cita.diagnostico?.errores || [];
            const advertencias = cita.diagnostico?.advertencias || [];

            return (
              <div key={cita.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div>
                      <p className="font-bold text-gray-900">{cita.mascota_nombre} - {cita.servicio_nombre}</p>
                      <p className="text-sm text-gray-600">Cliente: {cita.cliente_nombre}</p>
                      <p className="text-sm text-gray-600">Groomer: {cita.groomer_nombre || 'Por asignar'}</p>
                      <p className="text-sm text-gray-600">
                        Fecha: {String(cita.fecha).slice(0, 10)} {formatHour(cita.hora_inicio)} - {formatHour(cita.hora_fin)}
                      </p>
                    </div>

                    {errores.length > 0 && (
                      <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        <p className="mb-1 font-semibold">Restricciones detectadas</p>
                        {errores.map((item) => (
                          <p key={item}>- {item}</p>
                        ))}
                      </div>
                    )}

                    {advertencias.length > 0 && (
                      <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        <p className="mb-1 font-semibold">Advertencias</p>
                        {advertencias.map((item) => (
                          <p key={item}>- {item}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openEdit(cita)}
                      className="rounded bg-amber-500 px-4 py-2 text-white"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => aprobar(cita.id)}
                      className="rounded bg-green-600 px-4 py-2 text-white disabled:bg-green-300"
                      disabled={errores.length > 0}
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => rechazar(cita.id)}
                      className="rounded bg-red-600 px-4 py-2 text-white"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
