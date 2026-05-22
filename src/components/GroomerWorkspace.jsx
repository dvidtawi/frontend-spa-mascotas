import { useEffect, useState } from 'react';
import { groomingServices } from '../api/scheduleService';

const BACKEND_BASE_URL = 'http://localhost:3000';

const photoUrl = (path) => (path ? `${BACKEND_BASE_URL}${path}` : '');

export default function GroomerWorkspace() {
  const today = new Date().toISOString().slice(0, 10);
  const [fecha, setFecha] = useState(today);
  const [agenda, setAgenda] = useState([]);
  const [selectedCita, setSelectedCita] = useState(null);
  const [ficha, setFicha] = useState({
    estado_ingreso: '',
    observaciones_iniciales: '',
    insumos_texto: '',
    recomendaciones: '',
    foto_antes_path: '',
    foto_despues_path: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAgenda();
  }, [fecha]);

  const loadAgenda = async () => {
    try {
      setLoading(true);
      const res = await groomingServices.getAgendaHoy(fecha);
      const citas = res.data?.citas || [];
      setAgenda(citas);

      if (citas.length > 0) {
        const currentSelected = selectedCita
          ? citas.find((cita) => cita.id === selectedCita.id)
          : citas[0];

        if (currentSelected) {
          await loadFicha(currentSelected.id);
        } else {
          setSelectedCita(null);
        }
      } else {
        setSelectedCita(null);
      }

      setError(null);
    } catch (err) {
      setError('Error al cargar la agenda del groomer');
    } finally {
      setLoading(false);
    }
  };

  const loadFicha = async (citaId) => {
    try {
      const res = await groomingServices.getFicha(citaId);
      setSelectedCita(res.data.cita);
      setFicha({
        estado_ingreso: res.data.ficha?.estado_ingreso || '',
        observaciones_iniciales: res.data.ficha?.observaciones_iniciales || '',
        insumos_texto: res.data.ficha?.insumos_texto || '',
        recomendaciones: res.data.ficha?.recomendaciones || '',
        foto_antes_path: res.data.ficha?.foto_antes_path || '',
        foto_despues_path: res.data.ficha?.foto_despues_path || '',
      });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cargar la ficha');
    }
  };

  const saveFicha = async (payload = {}) => {
    if (!selectedCita) return;
    try {
      setSaving(true);
      await groomingServices.guardarFicha(selectedCita.id, {
        estado_ingreso: payload.estado_ingreso ?? ficha.estado_ingreso,
        observaciones_iniciales: payload.observaciones_iniciales ?? ficha.observaciones_iniciales,
        insumos_texto: payload.insumos_texto ?? ficha.insumos_texto,
        recomendaciones: payload.recomendaciones ?? ficha.recomendaciones,
      });
      setError(null);
    } catch (err) {
      throw new Error(err.response?.data?.error || 'No se pudo guardar la ficha');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (tipo, file) => {
    if (!selectedCita || !file) return;
    try {
      setSaving(true);
      const res = await groomingServices.subirFoto(selectedCita.id, tipo, file);
      setFicha((prev) => ({
        ...prev,
        foto_antes_path: res.data.foto_antes_path || prev.foto_antes_path,
        foto_despues_path: res.data.foto_despues_path || prev.foto_despues_path,
      }));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo subir la foto');
    } finally {
      setSaving(false);
    }
  };

  const iniciarServicio = async () => {
    if (!selectedCita) return;
    try {
      await saveFicha();
      await groomingServices.iniciarServicio(selectedCita.id);
      await loadAgenda();
    } catch (err) {
      setError(err.message || err.response?.data?.error || 'No se pudo iniciar el servicio');
    }
  };

  const finalizarServicio = async () => {
    if (!selectedCita) return;
    try {
      await saveFicha();
      await groomingServices.finalizarServicio(selectedCita.id);
      await loadAgenda();
    } catch (err) {
      setError(err.message || err.response?.data?.error || 'No se pudo finalizar el servicio');
    }
  };

  const renderPreStartForm = () => (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Estado de ingreso</label>
        <textarea
          value={ficha.estado_ingreso}
          onChange={(e) => setFicha((prev) => ({ ...prev, estado_ingreso: e.target.value }))}
          rows="4"
          placeholder="Nudos, heridas, pulgas, suciedad, comportamiento..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Observaciones (opcional)</label>
        <textarea
          value={ficha.observaciones_iniciales}
          onChange={(e) => setFicha((prev) => ({ ...prev, observaciones_iniciales: e.target.value }))}
          rows="3"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="rounded-lg border border-gray-200 p-4">
        <label className="mb-2 block text-sm font-semibold text-gray-700">Foto del antes</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleUpload('antes', e.target.files?.[0])}
          className="mb-3 block w-full text-sm"
        />
        {ficha.foto_antes_path && (
          <img
            src={photoUrl(ficha.foto_antes_path)}
            alt="Antes"
            className="h-52 w-full rounded-lg object-cover"
          />
        )}
      </div>

      <button
        onClick={iniciarServicio}
        disabled={saving}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white"
      >
        Iniciar servicio
      </button>
    </div>
  );

  const renderInProgressForm = () => (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Registro de insumos</label>
        <textarea
          value={ficha.insumos_texto}
          onChange={(e) => setFicha((prev) => ({ ...prev, insumos_texto: e.target.value }))}
          rows="4"
          placeholder="Shampoo x1, perfume x1, toalla x2..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Recomendaciones al cliente (opcional)</label>
        <textarea
          value={ficha.recomendaciones}
          onChange={(e) => setFicha((prev) => ({ ...prev, recomendaciones: e.target.value }))}
          rows="3"
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="rounded-lg border border-gray-200 p-4">
        <label className="mb-2 block text-sm font-semibold text-gray-700">Foto del despues</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleUpload('despues', e.target.files?.[0])}
          className="mb-3 block w-full text-sm"
        />
        {ficha.foto_despues_path && (
          <img
            src={photoUrl(ficha.foto_despues_path)}
            alt="Despues"
            className="h-52 w-full rounded-lg object-cover"
          />
        )}
      </div>

      <button
        onClick={finalizarServicio}
        disabled={saving}
        className="rounded-lg bg-green-600 px-4 py-2 text-white"
      >
        Finalizar servicio
      </button>
    </div>
  );

  const renderFinalSummary = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Foto del antes</p>
          {ficha.foto_antes_path ? (
            <img src={photoUrl(ficha.foto_antes_path)} alt="Antes" className="h-56 w-full rounded-lg object-cover" />
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500">Sin foto del antes.</div>
          )}
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Foto del despues</p>
          {ficha.foto_despues_path ? (
            <img src={photoUrl(ficha.foto_despues_path)} alt="Despues" className="h-56 w-full rounded-lg object-cover" />
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500">Sin foto del despues.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="mb-2 text-sm font-semibold text-gray-700">Estado de ingreso</p>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{ficha.estado_ingreso || 'Sin registro.'}</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="mb-2 text-sm font-semibold text-gray-700">Observaciones</p>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{ficha.observaciones_iniciales || 'Sin observaciones.'}</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="mb-2 text-sm font-semibold text-gray-700">Insumos usados</p>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{ficha.insumos_texto || 'Sin registro.'}</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="mb-2 text-sm font-semibold text-gray-700">Recomendaciones al cliente</p>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{ficha.recomendaciones || 'Sin recomendaciones.'}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <section className="rounded-xl bg-white p-6 shadow">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Agenda del Groomer</h2>
          <p className="text-sm text-gray-500">Servicios asignados ordenados por hora.</p>
        </div>

        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2"
        />

        {loading ? (
          <div className="py-8 text-center">Cargando agenda...</div>
        ) : agenda.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No hay servicios asignados para esta fecha.</div>
        ) : (
          <div className="space-y-3">
            {agenda.map((cita) => (
              <button
                key={cita.id}
                onClick={() => loadFicha(cita.id)}
                className={`w-full rounded-lg border p-4 text-left transition ${
                  selectedCita?.id === cita.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <p className="font-bold text-gray-900">{cita.mascota_nombre}</p>
                <p className="text-sm text-gray-600">{cita.servicio_nombre}</p>
                <p className="text-sm text-gray-500">
                  {String(cita.hora_inicio).slice(0, 5)} - {String(cita.hora_fin).slice(0, 5)}
                </p>
                <p className="mt-1 text-xs text-blue-700">{cita.estado}</p>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        {!selectedCita ? (
          <div className="py-12 text-center text-gray-500">
            Selecciona un servicio para abrir la ficha.
          </div>
        ) : (
          <>
            <div className="mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCita.mascota_nombre} - {selectedCita.servicio_nombre}
              </h2>
              <p className="text-sm text-gray-600">Cliente: {selectedCita.cliente_nombre}</p>
              <p className="text-sm text-gray-600">Estado: {selectedCita.estado}</p>
            </div>

            {error && (
              <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}

            {(selectedCita.estado === 'en_revision' || selectedCita.estado === 'confirmada') && renderPreStartForm()}
            {selectedCita.estado === 'en_proceso' && renderInProgressForm()}
            {selectedCita.estado === 'finalizada' && renderFinalSummary()}
          </>
        )}
      </section>
    </div>
  );
}
