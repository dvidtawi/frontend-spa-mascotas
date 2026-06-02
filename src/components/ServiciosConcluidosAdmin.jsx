import { useEffect, useState } from 'react';
import { slotServices } from '../api/scheduleService';

const BACKEND_BASE_URL = 'http://localhost:3000';

const photoUrl = (path) => (path ? `${BACKEND_BASE_URL}${path}` : '');

export default function ServiciosConcluidosAdmin() {
  const [citas, setCitas] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCitas();
  }, []);

  const loadCitas = async () => {
    try {
      setLoading(true);
      const res = await slotServices.getCitas({ estado: 'finalizada' });
      setCitas(res.data || []);
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar los servicios concluidos');
    } finally {
      setLoading(false);
    }
  };

  const openFicha = async (citaId) => {
    try {
      const res = await slotServices.getCita(citaId);
      setSelected(res.data || null);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cargar la ficha del servicio');
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Servicios Concluidos</h2>
        <p className="text-sm text-gray-500">Vista solo lectura de fichas ya finalizadas para administracion y recepcion.</p>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center">Cargando servicios concluidos...</div>
      ) : (
        <div className="space-y-3">
          {citas.length === 0 ? (
            <p className="text-sm text-gray-500">No hay servicios finalizados registrados.</p>
          ) : (
            citas.map((cita) => (
              <div key={cita.id} className="flex flex-col gap-3 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{cita.servicio_nombre} - {cita.mascota_nombre}</p>
                  <p className="text-sm text-gray-600">Cliente: {cita.cliente_nombre}</p>
                  <p className="text-sm text-gray-600">Groomer: {cita.groomer_nombre}</p>
                  <p className="text-sm text-gray-600">
                    {String(cita.fecha).slice(0, 10)} {String(cita.hora_inicio).slice(0, 5)} - {String(cita.hora_fin).slice(0, 5)}
                  </p>
                </div>

                <button
                  onClick={() => openFicha(cita.id)}
                  className="rounded bg-blue-600 px-4 py-2 text-white"
                >
                  Ver ficha
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-5xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selected.mascota_nombre} - {selected.servicio_nombre}
                </h3>
                <p className="text-sm text-gray-600">Cliente: {selected.cliente_nombre}</p>
                <p className="text-sm text-gray-600">Groomer: {selected.groomer_nombre}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded bg-gray-300 px-4 py-2 text-gray-700"
              >
                Cerrar
              </button>
            </div>

            <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-700">
                Estado actual: <span className="font-semibold">{selected.estado}</span>
              </p>
              <p className="text-sm text-gray-700">
                Horario: <span className="font-semibold">{String(selected.hora_inicio).slice(0, 5)} - {String(selected.hora_fin).slice(0, 5)}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">Foto del antes</p>
                {selected.ficha_grooming?.foto_antes_path ? (
                  <img src={photoUrl(selected.ficha_grooming.foto_antes_path)} alt="Antes" className="h-64 w-full rounded-lg object-cover" />
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500">Sin foto del antes.</div>
                )}
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">Foto del despues</p>
                {selected.ficha_grooming?.foto_despues_path ? (
                  <img src={photoUrl(selected.ficha_grooming.foto_despues_path)} alt="Despues" className="h-64 w-full rounded-lg object-cover" />
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500">Sin foto del despues.</div>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="mb-2 text-sm font-semibold text-gray-700">Estado de ingreso</p>
                <p className="whitespace-pre-wrap text-sm text-gray-800">{selected.ficha_grooming?.estado_ingreso || 'Sin registro.'}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="mb-2 text-sm font-semibold text-gray-700">Observaciones</p>
                <p className="whitespace-pre-wrap text-sm text-gray-800">{selected.ficha_grooming?.observaciones_iniciales || 'Sin observaciones.'}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="mb-2 text-sm font-semibold text-gray-700">Recomendaciones</p>
                <p className="whitespace-pre-wrap text-sm text-gray-800">{selected.ficha_grooming?.recomendaciones || 'Sin recomendaciones.'}</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-gray-200 p-4">
              <p className="mb-3 text-sm font-semibold text-gray-700">Insumos del servicio</p>
              {(selected.insumos_servicio || []).length === 0 ? (
                <p className="text-sm text-gray-500">No hay insumos registrados para esta cita.</p>
              ) : (
                <div className="space-y-2">
                  {selected.insumos_servicio.map((item) => (
                    <div key={item.id} className="rounded bg-gray-50 p-3 text-sm text-gray-800">
                      <p className="font-semibold">{item.insumo_nombre}</p>
                      <p>
                        Entregado: {item.cantidad_entregada} | Usado: {item.cantidad_usada} | Devuelto: {item.cantidad_devuelta} | Merma: {item.cantidad_desperdiciada}
                      </p>
                      <p className="text-xs text-gray-500">Estado: {item.estado}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
