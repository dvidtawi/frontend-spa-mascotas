import { useEffect, useMemo, useState } from 'react';
import { petServices, scheduleServices, slotServices } from '../api/scheduleService';

const STATUS_STYLES = {
  en_revision: 'bg-yellow-100 text-yellow-800',
  confirmada: 'bg-green-100 text-green-800',
  en_proceso: 'bg-blue-100 text-blue-800',
  finalizada: 'bg-emerald-100 text-emerald-800',
  cancelada: 'bg-red-100 text-red-800',
};

const STATUS_LABELS = {
  en_revision: 'En revision',
  confirmada: 'Confirmada',
  en_proceso: 'En proceso',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
};

const parseTimeToMinutes = (value) => {
  if (!value) return null;
  const [hours, minutes] = String(value).slice(0, 5).split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return (hours * 60) + minutes;
};

const getSlotDistance = (slot, rangeStart, rangeEnd) => {
  const slotStart = parseTimeToMinutes(slot.hora_inicio);
  const slotEnd = parseTimeToMinutes(slot.hora_fin);

  if (slotStart === null || slotEnd === null || rangeStart === null || rangeEnd === null) {
    return Number.MAX_SAFE_INTEGER;
  }

  if (slotEnd <= rangeStart) {
    return rangeStart - slotEnd;
  }

  if (slotStart >= rangeEnd) {
    return slotStart - rangeEnd;
  }

  return 0;
};

const sortByClosestRange = (slots, rangeStart, rangeEnd) => (
  [...slots].sort((a, b) => {
    const distanceA = getSlotDistance(a, rangeStart, rangeEnd);
    const distanceB = getSlotDistance(b, rangeStart, rangeEnd);

    if (distanceA !== distanceB) {
      return distanceA - distanceB;
    }

    return String(a.hora_inicio).localeCompare(String(b.hora_inicio));
  })
);

export default function CitasCliente() {
  const [tab, setTab] = useState('reservar');
  const [mascotas, setMascotas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [citas, setCitas] = useState([]);
  const [slotsDisponibles, setSlotsDisponibles] = useState([]);
  const [slotSeleccionado, setSlotSeleccionado] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [cancelModal, setCancelModal] = useState({ open: false, citaId: null, motivo: 'Cambio de planes' });
  const [filtros, setFiltros] = useState({
    fecha: '',
    mascotaId: '',
    servicioId: '',
    horaDesde: '15:00',
    horaHasta: '19:00',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (tab === 'mis-citas' || tab === 'concluidos') {
      loadMisCitas();
    }
  }, [tab]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [mascotasRes, serviciosRes] = await Promise.all([
        petServices.getMascotasCliente(),
        scheduleServices.getServicios(),
      ]);

      setMascotas(mascotasRes.data || []);
      setServicios(Array.isArray(serviciosRes.data) ? serviciosRes.data : []);
      setError(null);
    } catch (err) {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const loadMisCitas = async () => {
    try {
      setLoading(true);
      const res = await slotServices.getMisCitas();
      setCitas(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      setError('Error al cargar citas');
    } finally {
      setLoading(false);
    }
  };

  const servicioSeleccionado = useMemo(
    () => servicios.find((item) => item.id === filtros.servicioId),
    [servicios, filtros.servicioId]
  );

  const slotsSugeridos = useMemo(() => {
    const rangeStart = parseTimeToMinutes(filtros.horaDesde);
    const rangeEnd = parseTimeToMinutes(filtros.horaHasta);

    if (rangeStart === null || rangeEnd === null || rangeStart >= rangeEnd) {
      return slotsDisponibles;
    }

    const exactos = slotsDisponibles.filter((slot) => (
      getSlotDistance(slot, rangeStart, rangeEnd) === 0
    ));

    if (exactos.length > 0) {
      return sortByClosestRange(exactos, rangeStart, rangeEnd);
    }

    return sortByClosestRange(slotsDisponibles, rangeStart, rangeEnd);
  }, [slotsDisponibles, filtros.horaDesde, filtros.horaHasta]);

  const showingNearbySlots = useMemo(() => {
    const rangeStart = parseTimeToMinutes(filtros.horaDesde);
    const rangeEnd = parseTimeToMinutes(filtros.horaHasta);

    if (rangeStart === null || rangeEnd === null || rangeStart >= rangeEnd || slotsSugeridos.length === 0) {
      return false;
    }

    return getSlotDistance(slotsSugeridos[0], rangeStart, rangeEnd) > 0;
  }, [slotsSugeridos, filtros.horaDesde, filtros.horaHasta]);

  const citasActivas = useMemo(
    () => citas.filter((cita) => ['en_revision', 'confirmada'].includes(cita.estado)),
    [citas]
  );

  const citasConcluidas = useMemo(
    () => citas.filter((cita) => ['finalizada', 'cancelada'].includes(cita.estado)),
    [citas]
  );

  const buscarSlotsDisponibles = async (e) => {
    e.preventDefault();

    if (!filtros.fecha || !filtros.mascotaId || !filtros.servicioId) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    if (!filtros.horaDesde || !filtros.horaHasta || filtros.horaDesde >= filtros.horaHasta) {
      setError('Debes indicar un rango horario valido');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSlotSeleccionado('');

      const res = await slotServices.getSlotsDisponibles({
        fecha: filtros.fecha,
        mascota_id: filtros.mascotaId,
        servicio_id: filtros.servicioId,
      });

      const slots = Array.isArray(res.data) ? res.data : [];
      setSlotsDisponibles(slots);
      if (slots.length === 0) {
        setError('No hay horarios disponibles para la fecha seleccionada.');
      }
    } catch (err) {
      setError(err.response?.data?.errores?.join(', ') || err.response?.data?.error || 'Error al buscar horarios');
    } finally {
      setLoading(false);
    }
  };

  const handleReservar = async () => {
    const slot = slotsSugeridos.find(
      (item) => `${item.groomer_id}-${item.hora_inicio}` === slotSeleccionado
    );

    if (!slot) {
      setError('Debes elegir un horario disponible antes de reservar.');
      return;
    }

    try {
      setLoading(true);
      await slotServices.createCita({
        mascota_id: filtros.mascotaId,
        servicio_id: filtros.servicioId,
        groomer_id: slot.groomer_id,
        fecha: filtros.fecha,
        hora_inicio: slot.hora_inicio,
      });

      setSlotsDisponibles([]);
      setSlotSeleccionado('');
      setFiltros({ fecha: '', mascotaId: '', servicioId: '', horaDesde: '15:00', horaHasta: '19:00' });
      setError(null);
      setTab('mis-citas');
      await loadMisCitas();
    } catch (err) {
      setError(
        err.response?.data?.errores?.join(', ')
          || err.response?.data?.error
          || 'Error al reservar cita'
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmarCancelacion = async () => {
    try {
      setLoading(true);
      await slotServices.cancelarCita(cancelModal.citaId, cancelModal.motivo);
      setCancelModal({ open: false, citaId: null, motivo: 'Cambio de planes' });
      await loadMisCitas();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cancelar cita');
    } finally {
      setLoading(false);
    }
  };

  const openFicha = async (citaId) => {
    try {
      const res = await slotServices.getCita(citaId);
      const cita = res.data;
      setPreviewData({
        path: cita.ficha_grooming?.foto_antes_path || cita.ficha_grooming?.foto_despues_path || '',
        title: `${cita.mascota_nombre} - ${cita.servicio_nombre}`,
        cita,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cargar la ficha del servicio');
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-6 flex border-b">
        {[
          ['reservar', 'Solicitar Cita'],
          ['mis-citas', 'Mis Citas'],
          ['concluidos', 'Servicios Concluidos'],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`border-b-2 px-4 py-2 font-semibold transition ${
              tab === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {tab === 'reservar' && (
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Solicitar Cita</h2>

          <form onSubmit={buscarSlotsDisponibles} className="mb-6 rounded-lg bg-gray-50 p-6">
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Mascota *</label>
                <select
                  name="mascotaId"
                  value={filtros.mascotaId}
                  onChange={handleFiltroChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="">Seleccionar mascota...</option>
                  {mascotas.map((mascota) => (
                    <option key={mascota.id} value={mascota.id}>
                      {mascota.nombre} ({mascota.tamano})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Servicio *</label>
                <select
                  name="servicioId"
                  value={filtros.servicioId}
                  onChange={handleFiltroChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="">Seleccionar servicio...</option>
                  {servicios.map((servicio) => (
                    <option key={servicio.id} value={servicio.id}>
                      {servicio.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Fecha *</label>
                <input
                  type="date"
                  name="fecha"
                  value={filtros.fecha}
                  onChange={handleFiltroChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Desde *</label>
                <input
                  type="time"
                  name="horaDesde"
                  value={filtros.horaDesde}
                  onChange={handleFiltroChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Hasta *</label>
                <input
                  type="time"
                  name="horaHasta"
                  value={filtros.horaHasta}
                  onChange={handleFiltroChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
            </div>

            {servicioSeleccionado && (
              <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="font-semibold text-blue-900">Servicio seleccionado</p>
                <p className="text-sm text-blue-800">{servicioSeleccionado.nombre}</p>
                <p className="text-sm text-blue-800">Duracion: {servicioSeleccionado.duracion_minutos} min</p>
                <p className="text-sm font-semibold text-blue-900">Precio: Bs {Number(servicioSeleccionado.precio).toFixed(2)}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Buscando...' : 'Buscar Horarios'}
            </button>
          </form>

          {slotsDisponibles.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="mb-4 text-lg font-bold text-gray-900">Elegir horario disponible</h3>
              <p className="mb-4 text-sm text-gray-600">
                {showingNearbySlots
                  ? 'No encontramos horarios exactos en el rango solicitado. Te mostramos las opciones mas cercanas disponibles.'
                  : 'Te mostramos los horarios disponibles dentro del rango solicitado.'}
              </p>
              <select
                value={slotSeleccionado}
                onChange={(e) => setSlotSeleccionado(e.target.value)}
                className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="">Seleccionar horario...</option>
                {slotsSugeridos.map((slot, idx) => (
                  <option key={`${slot.groomer_id}-${slot.hora_inicio}-${idx}`} value={`${slot.groomer_id}-${slot.hora_inicio}`}>
                    {slot.hora_inicio} - {slot.hora_fin} | Groomer: {slot.groomer_nombre || slot.groomer_id}
                  </option>
                ))}
              </select>

              <button
                onClick={handleReservar}
                disabled={loading || !slotSeleccionado}
                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-green-400"
              >
                Reservar
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'mis-citas' && (
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Mis Citas</h2>
          {loading ? (
            <div className="py-8 text-center">Cargando citas...</div>
          ) : citasActivas.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No tienes citas activas.</div>
          ) : (
            <div className="space-y-4">
              {citasActivas.map((cita) => (
                <div key={cita.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{cita.mascota_nombre}</h3>
                      <p className="text-sm text-gray-600">{cita.servicio_nombre}</p>
                      <p className="mt-2 text-sm text-gray-600">{new Date(cita.fecha_inicio).toLocaleDateString('es-ES')}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(cita.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[cita.estado]}`}>
                      {STATUS_LABELS[cita.estado]}
                    </span>
                  </div>

                  <button
                    onClick={() => setCancelModal({ open: true, citaId: cita.id, motivo: 'Cambio de planes' })}
                    className="mt-4 w-full rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                  >
                    Cancelar Cita
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'concluidos' && (
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Servicios Concluidos</h2>
          {loading ? (
            <div className="py-8 text-center">Cargando historial...</div>
          ) : citasConcluidas.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No hay servicios concluidos o cancelados.</div>
          ) : (
            <div className="space-y-4">
              {citasConcluidas.map((cita) => (
                <div key={cita.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{cita.mascota_nombre}</h3>
                      <p className="text-sm text-gray-600">{cita.servicio_nombre}</p>
                      <p className="mt-2 text-sm text-gray-600">{new Date(cita.fecha_inicio).toLocaleDateString('es-ES')}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[cita.estado]}`}>
                      {STATUS_LABELS[cita.estado]}
                    </span>
                  </div>

                  {cita.estado === 'finalizada' && (
                    <button
                      onClick={() => openFicha(cita.id)}
                      className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                      Ver ficha
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {cancelModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-gray-900">Cancelar cita</h3>
            <p className="mb-4 text-sm text-amber-700">
              Solo puedes anular citas con al menos 24 horas de anticipacion.
            </p>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Motivo de cancelacion</label>
            <textarea
              value={cancelModal.motivo}
              onChange={(e) => setCancelModal((prev) => ({ ...prev, motivo: e.target.value }))}
              rows="4"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setCancelModal({ open: false, citaId: null, motivo: 'Cambio de planes' })}
                className="flex-1 rounded bg-gray-300 px-4 py-2 text-gray-700"
              >
                Cerrar
              </button>
              <button
                onClick={confirmarCancelacion}
                className="flex-1 rounded bg-red-500 px-4 py-2 text-white"
              >
                Confirmar anulacion
              </button>
            </div>
          </div>
        </div>
      )}

      {previewData?.cita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-5xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{previewData.title}</h3>
                <p className="text-sm text-gray-600">Recomendaciones y evidencia del servicio concluido.</p>
              </div>
              <button
                onClick={() => setPreviewData(null)}
                className="rounded bg-gray-300 px-4 py-2 text-gray-700"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">Foto del antes</p>
                {previewData.cita.ficha_grooming?.foto_antes_path ? (
                  <img
                    src={`http://localhost:3000${previewData.cita.ficha_grooming.foto_antes_path}`}
                    alt="Antes"
                    className="h-64 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500">Sin foto del antes.</div>
                )}
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">Foto del despues</p>
                {previewData.cita.ficha_grooming?.foto_despues_path ? (
                  <img
                    src={`http://localhost:3000${previewData.cita.ficha_grooming.foto_despues_path}`}
                    alt="Despues"
                    className="h-64 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500">Sin foto del despues.</div>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-gray-200 p-4">
              <p className="mb-2 text-sm font-semibold text-gray-700">Recomendaciones del groomer</p>
              <p className="whitespace-pre-wrap text-sm text-gray-800">
                {previewData.cita.ficha_grooming?.recomendaciones || 'Sin recomendaciones registradas.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
