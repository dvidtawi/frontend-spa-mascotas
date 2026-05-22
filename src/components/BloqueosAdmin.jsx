import { useEffect, useMemo, useState } from 'react';
import { blockServices, groomerAvailabilityServices, scheduleUtils } from '../api/scheduleService';

const EMPTY_BLOCK = {
  groomer_id: '',
  fecha: new Date().toISOString().slice(0, 10),
  hora_inicio: '09:00',
  hora_fin: '18:00',
  tipo: 'ausencia',
  motivo: '',
};

const EMPTY_AVAILABILITY = {
  groomer_id: '',
  dia_semana: 1,
  hora_inicio: '09:00',
  hora_fin: '18:00',
};

export default function BloqueosAdmin() {
  const [groomers, setGroomers] = useState([]);
  const [bloqueos, setBloqueos] = useState([]);
  const [selectedGroomer, setSelectedGroomer] = useState('');
  const [horarios, setHorarios] = useState([]);
  const [blockForm, setBlockForm] = useState(EMPTY_BLOCK);
  const [availabilityForm, setAvailabilityForm] = useState(EMPTY_AVAILABILITY);
  const [editingBlockId, setEditingBlockId] = useState(null);
  const [editingAvailabilityId, setEditingAvailabilityId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const diasSemana = useMemo(() => scheduleUtils.getDiasSemanaNombres(), []);

  useEffect(() => {
    loadGroomers();
  }, []);

  useEffect(() => {
    if (selectedGroomer) {
      loadGroomerData(selectedGroomer);
    } else {
      setHorarios([]);
      setBloqueos([]);
    }
  }, [selectedGroomer]);

  const loadGroomers = async () => {
    try {
      setLoading(true);
      const res = await groomerAvailabilityServices.getGroomers();
      const data = res.data || [];
      setGroomers(data);
      if (!selectedGroomer && data[0]?.id) {
        setSelectedGroomer(data[0].id);
        setBlockForm((prev) => ({ ...prev, groomer_id: data[0].id }));
        setAvailabilityForm((prev) => ({ ...prev, groomer_id: data[0].id }));
      }
      setError(null);
    } catch (err) {
      setError('Error al cargar groomers');
    } finally {
      setLoading(false);
    }
  };

  const loadGroomerData = async (groomerId) => {
    try {
      setLoading(true);
      const [horariosRes, bloqueosRes] = await Promise.all([
        groomerAvailabilityServices.getDisponibilidadGroomer(groomerId),
        blockServices.getBloqueos(groomerId),
      ]);

      setHorarios((horariosRes.data || []).filter((item) => item.groomer_id === groomerId));
      setBloqueos((bloqueosRes.data || []).filter((item) => item.groomer_id === groomerId));
      setBlockForm((prev) => ({ ...prev, groomer_id: groomerId }));
      setAvailabilityForm((prev) => ({ ...prev, groomer_id: groomerId }));
      setError(null);
    } catch (err) {
      setError('Error al cargar horarios del groomer');
    } finally {
      setLoading(false);
    }
  };

  const submitAvailability = async (e) => {
    e.preventDefault();
    try {
      if (editingAvailabilityId) {
        await groomerAvailabilityServices.updateHorarioGroomer(editingAvailabilityId, availabilityForm);
      } else {
        await groomerAvailabilityServices.createHorarioGroomer(availabilityForm);
      }

      setAvailabilityForm((prev) => ({ ...EMPTY_AVAILABILITY, groomer_id: selectedGroomer || '' }));
      setEditingAvailabilityId(null);
      await loadGroomerData(selectedGroomer);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar el horario del groomer');
    }
  };

  const submitBlock = async (e) => {
    e.preventDefault();
    try {
      if (editingBlockId) {
        await blockServices.updateBloqueo(editingBlockId, blockForm);
      } else {
        await blockServices.createBloqueo(blockForm);
      }

      setBlockForm((prev) => ({ ...EMPTY_BLOCK, groomer_id: selectedGroomer || '' }));
      setEditingBlockId(null);
      await loadGroomerData(selectedGroomer);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar el permiso o bloqueo del groomer');
    }
  };

  const editAvailability = (item) => {
    setEditingAvailabilityId(item.id);
    setAvailabilityForm({
      groomer_id: item.groomer_id,
      dia_semana: item.dia_semana,
      hora_inicio: String(item.hora_inicio).slice(0, 5),
      hora_fin: String(item.hora_fin).slice(0, 5),
    });
  };

  const editBlock = (item) => {
    setEditingBlockId(item.id);
    setBlockForm({
      groomer_id: item.groomer_id,
      fecha: String(item.fecha).slice(0, 10),
      hora_inicio: String(item.hora_inicio).slice(0, 5),
      hora_fin: String(item.hora_fin).slice(0, 5),
      tipo: item.tipo,
      motivo: item.motivo || item.razon || '',
    });
  };

  const deleteAvailability = async (id) => {
    if (!window.confirm('¿Deseas desactivar este horario del groomer?')) return;
    try {
      await groomerAvailabilityServices.deleteHorarioGroomer(id);
      await loadGroomerData(selectedGroomer);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo desactivar el horario del groomer');
    }
  };

  const toggleBlockStatus = async (item) => {
    const nuevoEstado = !item.estado_activo;
    const mensaje = nuevoEstado
      ? '¿Deseas volver a activar este permiso o bloqueo?'
      : '¿Deseas desactivar este permiso o bloqueo?';

    if (!window.confirm(mensaje)) return;

    try {
      await blockServices.updateBloqueo(item.id, { estado_activo: nuevoEstado });
      await loadGroomerData(selectedGroomer);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cambiar el estado del permiso o bloqueo');
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Horarios Groomer</h2>
        <p className="text-sm text-gray-500">Define el horario semanal del groomer y sus permisos, ausencias o descansos.</p>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="mb-1 block text-sm font-semibold text-gray-700">Groomer</label>
        <select
          value={selectedGroomer}
          onChange={(e) => setSelectedGroomer(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="">Seleccionar groomer...</option>
          {groomers.map((groomer) => (
            <option key={groomer.id} value={groomer.id}>
              {groomer.nombre}
            </option>
          ))}
        </select>
      </div>

      {selectedGroomer && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="rounded-lg border p-4">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Horario semanal</h3>
            <form onSubmit={submitAvailability} className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <select
                value={availabilityForm.dia_semana}
                onChange={(e) => setAvailabilityForm((prev) => ({ ...prev, dia_semana: Number(e.target.value) }))}
                className="rounded-lg border border-gray-300 px-3 py-2"
                required
              >
                {diasSemana.map((dia, index) => (
                  <option key={dia} value={index + 1}>
                    {dia}
                  </option>
                ))}
              </select>

              <input
                type="time"
                value={availabilityForm.hora_inicio}
                onChange={(e) => setAvailabilityForm((prev) => ({ ...prev, hora_inicio: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2"
                required
              />

              <input
                type="time"
                value={availabilityForm.hora_fin}
                onChange={(e) => setAvailabilityForm((prev) => ({ ...prev, hora_fin: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2"
                required
              />

              <div className="flex gap-3">
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white">
                  {editingAvailabilityId ? 'Actualizar' : 'Agregar'}
                </button>
                {editingAvailabilityId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAvailabilityId(null);
                      setAvailabilityForm((prev) => ({ ...EMPTY_AVAILABILITY, groomer_id: selectedGroomer }));
                    }}
                    className="rounded-lg bg-gray-300 px-4 py-2 text-gray-700"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-gray-500">Cargando horarios...</p>
              ) : horarios.length === 0 ? (
                <p className="text-sm text-gray-500">Este groomer no tiene horario semanal configurado.</p>
              ) : (
                horarios.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2 rounded bg-gray-50 p-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{diasSemana[item.dia_semana - 1]}</p>
                      <p className="text-sm text-gray-600">{String(item.hora_inicio).slice(0, 5)} - {String(item.hora_fin).slice(0, 5)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editAvailability(item)} className="rounded bg-amber-500 px-3 py-1 text-sm text-white">
                        Editar
                      </button>
                      <button onClick={() => deleteAvailability(item.id)} className="rounded bg-red-500 px-3 py-1 text-sm text-white">
                        Desactivar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-lg border p-4">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Permisos y bloqueos del groomer</h3>
            <form onSubmit={submitBlock} className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                type="date"
                value={blockForm.fecha}
                onChange={(e) => setBlockForm((prev) => ({ ...prev, fecha: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2"
                required
              />

              <select
                value={blockForm.tipo}
                onChange={(e) => setBlockForm((prev) => ({ ...prev, tipo: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="ausencia">Ausencia</option>
                <option value="permiso">Permiso</option>
                <option value="descanso">Descanso</option>
              </select>

              <input
                type="time"
                value={blockForm.hora_inicio}
                onChange={(e) => setBlockForm((prev) => ({ ...prev, hora_inicio: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2"
                required
              />

              <input
                type="time"
                value={blockForm.hora_fin}
                onChange={(e) => setBlockForm((prev) => ({ ...prev, hora_fin: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2"
                required
              />

              <input
                type="text"
                value={blockForm.motivo}
                onChange={(e) => setBlockForm((prev) => ({ ...prev, motivo: e.target.value }))}
                placeholder="Motivo"
                className="rounded-lg border border-gray-300 px-3 py-2 md:col-span-2"
              />

              <div className="flex gap-3 md:col-span-2">
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white">
                  {editingBlockId ? 'Actualizar' : 'Agregar'}
                </button>
                {editingBlockId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBlockId(null);
                      setBlockForm((prev) => ({ ...EMPTY_BLOCK, groomer_id: selectedGroomer }));
                    }}
                    className="rounded-lg bg-gray-300 px-4 py-2 text-gray-700"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-gray-500">Cargando bloqueos...</p>
              ) : bloqueos.length === 0 ? (
                <p className="text-sm text-gray-500">No hay permisos o bloqueos cargados para este groomer.</p>
              ) : (
                bloqueos.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2 rounded bg-gray-50 p-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.tipo} - {String(item.fecha).slice(0, 10)}
                      </p>
                      <p className="text-sm text-gray-600">{String(item.hora_inicio).slice(0, 5)} - {String(item.hora_fin).slice(0, 5)}</p>
                      <p className="text-sm text-gray-600">{item.motivo || item.razon || 'Sin motivo'}</p>
                      <p className="text-xs text-gray-500">{item.estado_activo ? 'Activo' : 'Inactivo'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editBlock(item)} className="rounded bg-amber-500 px-3 py-1 text-sm text-white">
                        Editar
                      </button>
                      <button
                        onClick={() => toggleBlockStatus(item)}
                        className={`rounded px-3 py-1 text-sm text-white ${
                          item.estado_activo ? 'bg-red-500' : 'bg-green-600'
                        }`}
                      >
                        {item.estado_activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
