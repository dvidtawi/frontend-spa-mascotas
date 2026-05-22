import { useEffect, useMemo, useState } from 'react';
import {
  groomerAvailabilityServices,
  petServices,
  scheduleServices,
  slotServices,
} from '../api/scheduleService';

const ESTADOS = ['en_revision', 'confirmada', 'en_proceso', 'finalizada', 'cancelada'];

const addDays = (dateString, days) => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const getWeekRange = (baseDate) => ({
  inicio: baseDate,
  fin: addDays(baseDate, 6),
});

const formatHour = (value) => String(value).slice(0, 5);

export default function AgendaAdmin() {
  const today = new Date().toISOString().slice(0, 10);
  const [vista, setVista] = useState('dia');
  const [fechaBase, setFechaBase] = useState(today);
  const [agenda, setAgenda] = useState({ groomers: [], citas: [], bloqueos: [] });
  const [servicios, setServicios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [groomers, setGroomers] = useState([]);
  const [mascotasCliente, setMascotasCliente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingCita, setEditingCita] = useState(null);
  const [selectedFicha, setSelectedFicha] = useState(null);
  const [formData, setFormData] = useState({
    cliente_id: '',
    mascota_id: '',
    servicio_id: '',
    groomer_id: '',
    fecha: today,
    hora_inicio: '09:00',
    estado: 'confirmada',
    notas: '',
  });
  const [editData, setEditData] = useState({
    groomer_id: '',
    fecha: today,
    hora_inicio: '09:00',
    estado: 'confirmada',
    notas: '',
  });

  const range = useMemo(() => {
    if (vista === 'dia') {
      return { inicio: fechaBase, fin: fechaBase };
    }
    return getWeekRange(fechaBase);
  }, [vista, fechaBase]);

  useEffect(() => {
    loadBaseData();
  }, []);

  useEffect(() => {
    loadAgenda();
  }, [range.inicio, range.fin]);

  useEffect(() => {
    if (formData.cliente_id) {
      loadMascotasCliente(formData.cliente_id);
    } else {
      setMascotasCliente([]);
    }
  }, [formData.cliente_id]);

  const loadBaseData = async () => {
    try {
      const [serviciosRes, clientesRes, groomersRes] = await Promise.all([
        scheduleServices.getServicios(),
        groomerAvailabilityServices.getClientes(),
        groomerAvailabilityServices.getGroomers(),
      ]);

      setServicios(serviciosRes.data || []);
      setClientes(clientesRes.data || []);
      setGroomers(groomersRes.data || []);
    } catch (err) {
      setError('Error al cargar datos de referencia');
    }
  };

  const loadAgenda = async () => {
    try {
      setLoading(true);
      const res = await slotServices.getAgenda({
        fecha_inicio: range.inicio,
        fecha_fin: range.fin,
      });
      setAgenda(res.data || { groomers: [], citas: [], bloqueos: [] });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar agenda');
    } finally {
      setLoading(false);
    }
  };

  const loadMascotasCliente = async (clienteId) => {
    try {
      const res = await petServices.getMascotasByCliente(clienteId);
      setMascotasCliente(res.data || []);
    } catch (err) {
      setError('No se pudieron cargar las mascotas del cliente');
    }
  };

  const resetCreateForm = () => {
    setFormData({
      cliente_id: '',
      mascota_id: '',
      servicio_id: '',
      groomer_id: '',
      fecha: fechaBase,
      hora_inicio: '09:00',
      estado: 'confirmada',
      notas: '',
    });
    setMascotasCliente([]);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await slotServices.createCitaAdmin(formData);
      setShowCreate(false);
      resetCreateForm();
      await loadAgenda();
    } catch (err) {
      setError(err.response?.data?.errores?.join(', ') || err.response?.data?.error || 'No se pudo crear la cita');
    }
  };

  const openEdit = (cita) => {
    setEditingCita(cita);
    setEditData({
      groomer_id: cita.groomer_id || '',
      fecha: cita.fecha ? String(cita.fecha).slice(0, 10) : String(cita.fecha_inicio).slice(0, 10),
      hora_inicio: formatHour(cita.hora_inicio || new Date(cita.fecha_inicio).toTimeString()),
      estado: cita.estado,
      notas: cita.notas || '',
    });
    setShowEdit(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCita) return;

    try {
      await slotServices.updateCita(editingCita.id, editData);
      setShowEdit(false);
      setEditingCita(null);
      await loadAgenda();
    } catch (err) {
      setError(err.response?.data?.errores?.join(', ') || err.response?.data?.error || 'No se pudo actualizar la cita');
    }
  };

  const handleCancel = async (citaId) => {
    if (!window.confirm('¿Deseas cancelar esta cita?')) return;
    try {
      await slotServices.cancelarCita(citaId, 'Cancelada por administracion');
      await loadAgenda();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cancelar la cita');
    }
  };

  const openFicha = async (citaId) => {
    try {
      const res = await slotServices.getCita(citaId);
      setSelectedFicha(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cargar la ficha del servicio');
    }
  };

  const daysToRender = vista === 'dia'
    ? [fechaBase]
    : Array.from({ length: 7 }, (_, index) => addDays(fechaBase, index));

  const citasPorDiaYGroomer = (fecha, groomerId) =>
    (agenda.citas || []).filter(
      (cita) =>
        String(cita.fecha).slice(0, 10) === fecha &&
        cita.groomer_id === groomerId
    );

  const bloqueosPorDiaYGroomer = (fecha, groomerId) =>
    (agenda.bloqueos || []).filter(
      (bloqueo) =>
        String(bloqueo.fecha).slice(0, 10) === fecha &&
        (bloqueo.groomer_id === groomerId || bloqueo.groomer_id === null)
    );

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calendario Maestro</h2>
          <p className="text-sm text-gray-500">Agenda diaria o semanal por groomer.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={vista}
            onChange={(e) => setVista(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="dia">Vista diaria</option>
            <option value="semana">Vista semanal</option>
          </select>

          <input
            type="date"
            value={fechaBase}
            onChange={(e) => setFechaBase(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2"
          />

          <button
            onClick={() => {
              resetCreateForm();
              setShowCreate(true);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            + Crear cita manual
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-6 rounded-lg border-l-4 border-blue-600 bg-gray-50 p-6">
          <h3 className="mb-4 text-lg font-bold">Nueva cita manual</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <select
              value={formData.cliente_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, cliente_id: e.target.value, mascota_id: '' }))}
              className="rounded-lg border border-gray-300 px-3 py-2"
              required
            >
              <option value="">Seleccionar cliente...</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} - {cliente.email}
                </option>
              ))}
            </select>

            <select
              value={formData.mascota_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, mascota_id: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2"
              required
            >
              <option value="">Seleccionar mascota...</option>
              {mascotasCliente.map((mascota) => (
                <option key={mascota.id} value={mascota.id}>
                  {mascota.nombre} ({mascota.tamano})
                </option>
              ))}
            </select>

            <select
              value={formData.servicio_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, servicio_id: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2"
              required
            >
              <option value="">Seleccionar servicio...</option>
              {servicios.map((servicio) => (
                <option key={servicio.id} value={servicio.id}>
                  {servicio.nombre} - {servicio.duracion_minutos} min
                </option>
              ))}
            </select>

            <select
              value={formData.groomer_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, groomer_id: e.target.value }))}
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
              value={formData.fecha}
              onChange={(e) => setFormData((prev) => ({ ...prev, fecha: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2"
              required
            />

            <input
              type="time"
              value={formData.hora_inicio}
              onChange={(e) => setFormData((prev) => ({ ...prev, hora_inicio: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2"
              required
            />

            <select
              value={formData.estado}
              onChange={(e) => setFormData((prev) => ({ ...prev, estado: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="confirmada">Confirmada</option>
              <option value="en_revision">En revision</option>
            </select>

            <input
              type="text"
              value={formData.notas}
              onChange={(e) => setFormData((prev) => ({ ...prev, notas: e.target.value }))}
              placeholder="Notas"
              className="rounded-lg border border-gray-300 px-3 py-2 md:col-span-2"
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white">
              Guardar cita
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded-lg bg-gray-300 px-4 py-2 text-gray-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {showEdit && editingCita && (
        <form onSubmit={handleUpdate} className="mb-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-6">
          <h3 className="mb-4 text-lg font-bold">Reprogramar o editar cita</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <select
              value={editData.groomer_id}
              onChange={(e) => setEditData((prev) => ({ ...prev, groomer_id: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2"
            >
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
            />

            <input
              type="time"
              value={editData.hora_inicio}
              onChange={(e) => setEditData((prev) => ({ ...prev, hora_inicio: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />

            <select
              value={editData.estado}
              onChange={(e) => setEditData((prev) => ({ ...prev, estado: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2"
            >
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={editData.notas}
              onChange={(e) => setEditData((prev) => ({ ...prev, notas: e.target.value }))}
              placeholder="Notas"
              className="rounded-lg border border-gray-300 px-3 py-2 md:col-span-2"
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 text-white">
              Guardar cambios
            </button>
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="rounded-lg bg-gray-300 px-4 py-2 text-gray-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-8 text-center">Cargando agenda...</div>
      ) : (
        <div className="space-y-6">
          {daysToRender.map((day) => (
            <section key={day}>
              {vista === 'semana' && (
                <h3 className="mb-3 text-lg font-bold text-gray-900">
                  {new Date(`${day}T00:00:00`).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
              )}

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {(agenda.groomers || []).map((groomer) => {
                  const citas = citasPorDiaYGroomer(day, groomer.id);
                  const bloqueos = bloqueosPorDiaYGroomer(day, groomer.id);

                  return (
                    <div key={`${day}-${groomer.id}`} className="rounded-lg border bg-gray-50 p-4">
                      <div className="mb-3 border-b pb-2">
                        <h4 className="font-bold text-gray-900">{groomer.nombre}</h4>
                        <p className="text-xs text-gray-500">{groomer.email}</p>
                      </div>

                      {bloqueos.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {bloqueos.map((bloqueo) => (
                            <div key={bloqueo.id} className="rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                              Bloqueo: {bloqueo.tipo} {bloqueo.hora_inicio?.slice(0, 5)} - {bloqueo.hora_fin?.slice(0, 5)}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-3">
                        {citas.length === 0 ? (
                          <p className="text-sm text-gray-500">Sin citas para este groomer.</p>
                        ) : (
                          citas.map((cita) => (
                            <div key={cita.id} className="rounded-lg bg-white p-3 shadow-sm">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-semibold text-gray-900">{cita.mascota_nombre}</p>
                                  <p className="text-sm text-gray-600">{cita.servicio_nombre}</p>
                                  <p className="text-xs text-gray-500">
                                    {formatHour(cita.hora_inicio)} - {formatHour(cita.hora_fin)}
                                  </p>
                                  <p className="text-xs text-gray-500">{cita.cliente_nombre}</p>
                                </div>
                                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                  {cita.estado}
                                </span>
                              </div>

                              {(cita.diagnostico?.errores?.length || 0) > 0 && (
                                <div className="mt-3 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                                  <p className="mb-1 font-semibold">Requiere revisión</p>
                                  {cita.diagnostico.errores.map((item) => (
                                    <p key={item}>- {item}</p>
                                  ))}
                                </div>
                              )}

                              {(cita.diagnostico?.advertencias?.length || 0) > 0 && (
                                <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                                  <p className="mb-1 font-semibold">Advertencias</p>
                                  {cita.diagnostico.advertencias.map((item) => (
                                    <p key={item}>- {item}</p>
                                  ))}
                                </div>
                              )}

                              <div className="mt-3 flex gap-2">
                                {['en_revision', 'confirmada'].includes(cita.estado) ? (
                                  <>
                                    <button
                                      onClick={() => openEdit(cita)}
                                      className="flex-1 rounded bg-amber-500 px-2 py-1 text-xs text-white"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => handleCancel(cita.id)}
                                      className="flex-1 rounded bg-red-500 px-2 py-1 text-xs text-white"
                                    >
                                      Cancelar
                                    </button>
                                  </>
                                ) : (
                                  <div className="w-full space-y-2">
                                    <div className="rounded bg-gray-100 px-2 py-2 text-center text-xs font-semibold text-gray-600">
                                      {cita.estado === 'finalizada' ? 'Servicio concluido' : 'Servicio en proceso'}
                                    </div>
                                    <button
                                      onClick={() => openFicha(cita.id)}
                                      className="w-full rounded bg-slate-700 px-2 py-2 text-xs font-semibold text-white"
                                    >
                                      Ver ficha
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {selectedFicha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-5xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedFicha.mascota_nombre} - {selectedFicha.servicio_nombre}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedFicha.cliente_nombre} | {selectedFicha.groomer_nombre}
                </p>
              </div>
              <button
                onClick={() => setSelectedFicha(null)}
                className="rounded bg-gray-300 px-4 py-2 text-gray-700"
              >
                Cerrar
              </button>
            </div>

            <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-700">
                Estado actual: <span className="font-semibold">{selectedFicha.estado}</span>
              </p>
              <p className="text-sm text-gray-700">
                Horario: <span className="font-semibold">{formatHour(selectedFicha.hora_inicio)} - {formatHour(selectedFicha.hora_fin)}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">Foto del antes</p>
                {selectedFicha.ficha_grooming?.foto_antes_path ? (
                  <img
                    src={`http://localhost:3000${selectedFicha.ficha_grooming.foto_antes_path}`}
                    alt="Antes"
                    className="h-64 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500">
                    Sin foto del antes.
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">Foto del despues</p>
                {selectedFicha.ficha_grooming?.foto_despues_path ? (
                  <img
                    src={`http://localhost:3000${selectedFicha.ficha_grooming.foto_despues_path}`}
                    alt="Despues"
                    className="h-64 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500">
                    Sin foto del despues.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="mb-2 text-sm font-semibold text-gray-700">Estado de ingreso</p>
                <p className="whitespace-pre-wrap text-sm text-gray-800">
                  {selectedFicha.ficha_grooming?.estado_ingreso || 'Sin registro.'}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <p className="mb-2 text-sm font-semibold text-gray-700">Observaciones</p>
                <p className="whitespace-pre-wrap text-sm text-gray-800">
                  {selectedFicha.ficha_grooming?.observaciones_iniciales || 'Sin observaciones.'}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <p className="mb-2 text-sm font-semibold text-gray-700">Insumos utilizados</p>
                <p className="whitespace-pre-wrap text-sm text-gray-800">
                  {selectedFicha.ficha_grooming?.insumos_texto || 'Sin insumos registrados.'}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <p className="mb-2 text-sm font-semibold text-gray-700">Recomendaciones</p>
                <p className="whitespace-pre-wrap text-sm text-gray-800">
                  {selectedFicha.ficha_grooming?.recomendaciones || 'Sin recomendaciones registradas.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
