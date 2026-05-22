import { useEffect, useMemo, useState } from 'react';
import { blockServices, scheduleUtils, spaAvailabilityServices } from '../api/scheduleService';

const addDays = (dateString, days) => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const getWeekStart = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
};

const buildHabitualForm = (diasSemana, habitual = []) =>
  diasSemana.map((dia, index) => {
    const existente = habitual.find((item) => item.dia_semana === index + 1);
    return {
      dia_semana: index + 1,
      dia_nombre: dia,
      hora_inicio: existente ? String(existente.hora_inicio).slice(0, 5) : '',
      hora_fin: existente ? String(existente.hora_fin).slice(0, 5) : '',
      activo: Boolean(existente),
    };
  });

const EMPTY_EXCEPTION = {
  fecha: new Date().toISOString().slice(0, 10),
  hora_inicio: '09:00',
  hora_fin: '18:00',
  tipo: 'feriado',
  motivo: '',
};

export default function DisponibilidadSpaAdmin() {
  const diasSemana = useMemo(() => scheduleUtils.getDiasSemanaNombres(), []);
  const [fechaBase, setFechaBase] = useState(getWeekStart(new Date().toISOString().slice(0, 10)));
  const [horarioSpa, setHorarioSpa] = useState({ habitual: [], excepciones: [], total_excepciones_semana: 0 });
  const [showHabitualForm, setShowHabitualForm] = useState(false);
  const [showExceptionForm, setShowExceptionForm] = useState(false);
  const [habitualForm, setHabitualForm] = useState(buildHabitualForm(diasSemana));
  const [exceptionForm, setExceptionForm] = useState(EMPTY_EXCEPTION);
  const [editingExceptionId, setEditingExceptionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const semanaDias = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(fechaBase, index)),
    [fechaBase]
  );

  useEffect(() => {
    loadData();
  }, [fechaBase]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await spaAvailabilityServices.getDisponibilidad(fechaBase);
      const data = res.data || {};
      setHorarioSpa(data);
      setHabitualForm(buildHabitualForm(diasSemana, data.habitual || []));
      setError(null);
    } catch (err) {
      setError('No se pudo cargar la configuracion del spa');
    } finally {
      setLoading(false);
    }
  };

  const guardarHorarioHabitual = async (e) => {
    e.preventDefault();

    const dias = habitualForm
      .filter((item) => item.activo && item.hora_inicio && item.hora_fin)
      .map((item) => ({
        dia_semana: item.dia_semana,
        hora_inicio: item.hora_inicio,
        hora_fin: item.hora_fin,
      }));

    try {
      await spaAvailabilityServices.createHorario({ dias });
      setShowHabitualForm(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar el horario habitual');
    }
  };

  const guardarExcepcion = async (e) => {
    e.preventDefault();

    try {
      if (editingExceptionId) {
        await blockServices.updateBloqueo(editingExceptionId, { ...exceptionForm, groomer_id: null });
      } else {
        await blockServices.createBloqueo({ ...exceptionForm, groomer_id: null });
      }

      setExceptionForm(EMPTY_EXCEPTION);
      setEditingExceptionId(null);
      setShowExceptionForm(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar la excepcion');
    }
  };

  const editarExcepcion = (item) => {
    setEditingExceptionId(item.id);
    setExceptionForm({
      fecha: String(item.fecha).slice(0, 10),
      hora_inicio: String(item.hora_inicio).slice(0, 5),
      hora_fin: String(item.hora_fin).slice(0, 5),
      tipo: item.tipo,
      motivo: item.motivo || item.razon || '',
    });
    setShowExceptionForm(true);
  };

  const eliminarExcepcion = async (id) => {
    if (!window.confirm('¿Deseas eliminar esta excepción del spa?')) return;
    try {
      await blockServices.deleteBloqueo(id);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo eliminar la excepcion');
    }
  };

  const excepcionesPorDia = (fecha) =>
    (horarioSpa.excepciones || []).filter((item) => String(item.fecha).slice(0, 10) === fecha);

  if (loading && !showHabitualForm && !showExceptionForm) {
    return <div className="py-8 text-center">Cargando horarios del spa...</div>;
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Horarios del Spa</h2>
          <p className="text-sm text-gray-500">Horario habitual del spa y excepciones semanales como feriados o cierres puntuales.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowHabitualForm((prev) => !prev)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            Definir horario habitual
          </button>
          <button
            onClick={() => {
              setEditingExceptionId(null);
              setExceptionForm(EMPTY_EXCEPTION);
              setShowExceptionForm((prev) => !prev);
            }}
            className="rounded-lg bg-amber-600 px-4 py-2 text-white"
          >
            Agregar excepción
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {showHabitualForm && (
        <form onSubmit={guardarHorarioHabitual} className="mb-6 rounded-lg border-l-4 border-blue-600 bg-gray-50 p-6">
          <h3 className="mb-4 text-lg font-bold">Horario habitual desde esta configuración en adelante</h3>
          <div className="space-y-3">
            {habitualForm.map((item) => (
              <div key={item.dia_semana} className="grid grid-cols-1 gap-3 rounded bg-white p-3 md:grid-cols-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={item.activo}
                    onChange={(e) =>
                      setHabitualForm((prev) =>
                        prev.map((current) =>
                          current.dia_semana === item.dia_semana
                            ? { ...current, activo: e.target.checked }
                            : current
                        )
                      )
                    }
                  />
                  {item.dia_nombre}
                </label>

                <input
                  type="time"
                  value={item.hora_inicio}
                  disabled={!item.activo}
                  onChange={(e) =>
                    setHabitualForm((prev) =>
                      prev.map((current) =>
                        current.dia_semana === item.dia_semana
                          ? { ...current, hora_inicio: e.target.value }
                          : current
                      )
                    )
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                />

                <input
                  type="time"
                  value={item.hora_fin}
                  disabled={!item.activo}
                  onChange={(e) =>
                    setHabitualForm((prev) =>
                      prev.map((current) =>
                        current.dia_semana === item.dia_semana
                          ? { ...current, hora_fin: e.target.value }
                          : current
                      )
                    )
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                />

                <div className="flex items-center text-sm text-gray-500">
                  {item.activo ? 'Disponible' : 'Cerrado'}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white">
              Guardar horario habitual
            </button>
            <button
              type="button"
              onClick={() => {
                setShowHabitualForm(false);
                setHabitualForm(buildHabitualForm(diasSemana, horarioSpa.habitual || []));
              }}
              className="rounded-lg bg-gray-300 px-4 py-2 text-gray-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {showExceptionForm && (
        <form onSubmit={guardarExcepcion} className="mb-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-6">
          <h3 className="mb-4 text-lg font-bold">{editingExceptionId ? 'Editar excepción' : 'Nueva excepción'}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              type="date"
              value={exceptionForm.fecha}
              onChange={(e) => setExceptionForm((prev) => ({ ...prev, fecha: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2"
              required
            />

            <select
              value={exceptionForm.tipo}
              onChange={(e) => setExceptionForm((prev) => ({ ...prev, tipo: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="feriado">Feriado</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="inconveniente">Inconveniente</option>
              <option value="cambio_horario">Cambio de horario</option>
            </select>

            <input
              type="time"
              value={exceptionForm.hora_inicio}
              onChange={(e) => setExceptionForm((prev) => ({ ...prev, hora_inicio: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2"
              required
            />

            <input
              type="time"
              value={exceptionForm.hora_fin}
              onChange={(e) => setExceptionForm((prev) => ({ ...prev, hora_fin: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2"
              required
            />

            <input
              type="text"
              value={exceptionForm.motivo}
              onChange={(e) => setExceptionForm((prev) => ({ ...prev, motivo: e.target.value }))}
              placeholder="Motivo"
              className="rounded-lg border border-gray-300 px-3 py-2 md:col-span-2"
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 text-white">
              {editingExceptionId ? 'Actualizar excepción' : 'Guardar excepción'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowExceptionForm(false);
                setEditingExceptionId(null);
                setExceptionForm(EMPTY_EXCEPTION);
              }}
              className="rounded-lg bg-gray-300 px-4 py-2 text-gray-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="mb-4 flex flex-col gap-3 rounded-lg border bg-gray-50 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-semibold text-gray-900">Semana visible</p>
          <p className="text-sm text-gray-600">
            {horarioSpa.total_excepciones_semana > 0
              ? `${horarioSpa.total_excepciones_semana} excepción(es) registradas en esta semana`
              : 'No hay excepciones en esta semana'}
          </p>
        </div>

        <input
          type="date"
          value={fechaBase}
          onChange={(e) => setFechaBase(getWeekStart(e.target.value))}
          className="rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        {semanaDias.map((fecha, index) => {
          const habitual = (horarioSpa.habitual || []).find((item) => item.dia_semana === index + 1);
          const excepciones = excepcionesPorDia(fecha);

          return (
            <div key={fecha} className="rounded-lg border bg-white p-4">
              <div className="mb-3 border-b pb-2">
                <p className="font-semibold text-gray-900">{diasSemana[index]}</p>
                <p className="text-xs text-gray-500">{fecha}</p>
              </div>

              <div className="mb-3 rounded bg-blue-50 p-2 text-sm text-blue-800">
                {habitual
                  ? `Habitual: ${String(habitual.hora_inicio).slice(0, 5)} - ${String(habitual.hora_fin).slice(0, 5)}`
                  : 'Habitual: cerrado'}
              </div>

              <div className="space-y-2">
                {excepciones.length === 0 ? (
                  <p className="text-sm text-gray-500">Sin excepciones.</p>
                ) : (
                  excepciones.map((item) => (
                    <div key={item.id} className="rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
                      <p className="font-semibold">{item.tipo}</p>
                      <p>{String(item.hora_inicio).slice(0, 5)} - {String(item.hora_fin).slice(0, 5)}</p>
                      <p>{item.motivo || item.razon || 'Sin motivo'}</p>
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => editarExcepcion(item)} className="rounded bg-amber-500 px-2 py-1 text-white">
                          Editar
                        </button>
                        <button onClick={() => eliminarExcepcion(item.id)} className="rounded bg-red-500 px-2 py-1 text-white">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
