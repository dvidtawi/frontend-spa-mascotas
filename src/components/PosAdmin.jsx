import { useEffect, useState } from 'react';
import { paymentServices, slotServices } from '../api/scheduleService';

const EMPTY_FORM = {
  cita_id: '',
  metodo_pago: 'efectivo',
  monto: '',
  concepto: '',
  observaciones: '',
  tipo_venta: 'cita',
};

export default function PosAdmin() {
  const today = new Date().toISOString().slice(0, 10);
  const [citasFinalizadas, setCitasFinalizadas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [cierre, setCierre] = useState({ resumen: [], total_dia: 0, fecha: today });
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [fechaReporte, setFechaReporte] = useState(today);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [fechaReporte]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [citasRes, pagosRes, cierreRes] = await Promise.all([
        slotServices.getCitas({ estado: 'finalizada', fecha: fechaReporte }),
        paymentServices.getPagos({ fecha: fechaReporte }),
        paymentServices.getCierreCaja(fechaReporte),
      ]);

      setCitasFinalizadas(citasRes.data || []);
      setPagos(pagosRes.data || []);
      setCierre(cierreRes.data || { resumen: [], total_dia: 0, fecha: fechaReporte });
      setError(null);
    } catch (err) {
      setError('Error al cargar la informacion de caja');
    } finally {
      setLoading(false);
    }
  };

  const selectedCita = citasFinalizadas.find((item) => item.id === formData.cita_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await paymentServices.registrarPago({
        ...formData,
        monto: formData.monto ? Number(formData.monto) : undefined,
        tipo_venta: formData.cita_id ? 'cita' : 'directa',
      });
      setFormData(EMPTY_FORM);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo registrar el pago');
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">POS y Caja Simulada</h2>
        <p className="text-sm text-gray-500">Cobro base de servicios y cierre diario por metodo de pago.</p>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-6 md:grid-cols-3">
        <select
          value={formData.cita_id}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              cita_id: e.target.value,
              monto: '',
              concepto: '',
            }))
          }
          className="rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="">Venta directa / sin cita</option>
          {citasFinalizadas.map((cita) => (
            <option key={cita.id} value={cita.id}>
              {cita.mascota_nombre} - {cita.servicio_nombre} - Bs {cita.precio_final}
            </option>
          ))}
        </select>

        <select
          value={formData.metodo_pago}
          onChange={(e) => setFormData((prev) => ({ ...prev, metodo_pago: e.target.value }))}
          className="rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="efectivo">Efectivo</option>
          <option value="qr">QR</option>
          <option value="transferencia">Transferencia</option>
        </select>

        <input
          type="number"
          min="0"
          step="0.01"
          value={formData.monto}
          onChange={(e) => setFormData((prev) => ({ ...prev, monto: e.target.value }))}
          placeholder={selectedCita ? `Monto opcional. Base: ${selectedCita.precio_final}` : 'Monto'}
          className="rounded-lg border border-gray-300 px-3 py-2"
        />

        <input
          type="text"
          value={formData.concepto}
          onChange={(e) => setFormData((prev) => ({ ...prev, concepto: e.target.value }))}
          placeholder="Concepto para venta directa"
          className="rounded-lg border border-gray-300 px-3 py-2 md:col-span-2"
        />

        <input
          type="text"
          value={formData.observaciones}
          onChange={(e) => setFormData((prev) => ({ ...prev, observaciones: e.target.value }))}
          placeholder="Observaciones"
          className="rounded-lg border border-gray-300 px-3 py-2"
        />

        <div className="md:col-span-3">
          <button type="submit" className="rounded-lg bg-green-600 px-4 py-2 text-white">
            Registrar pago
          </button>
        </div>
      </form>

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-semibold text-gray-700">Fecha de cierre</label>
        <input
          type="date"
          value={fechaReporte}
          onChange={(e) => setFechaReporte(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      {loading ? (
        <div className="py-8 text-center">Cargando caja...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-lg font-bold text-gray-900">Cierre del dia</h3>
            <p className="mb-3 text-2xl font-bold text-green-700">Bs {Number(cierre.total_dia || 0).toFixed(2)}</p>
            <div className="space-y-2">
              {(cierre.resumen || []).map((item) => (
                <div key={`${item.metodo_pago}-${item.tipo_movimiento}`} className="flex justify-between rounded bg-gray-50 px-3 py-2 text-sm">
                  <span>{item.metodo_pago} · {item.tipo_movimiento}</span>
                  <span>{item.total_transacciones} pagos - Bs {Number(item.total_monto).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-lg font-bold text-gray-900">Pagos registrados</h3>
            <div className="space-y-2">
              {pagos.length === 0 ? (
                <p className="text-sm text-gray-500">No hay pagos registrados en la fecha seleccionada.</p>
              ) : (
                pagos.map((pago) => (
                  <div key={pago.id} className="rounded bg-gray-50 px-3 py-2 text-sm">
                    <p className="font-semibold text-gray-900">
                      {pago.concepto || 'Pago sin concepto'} - Bs {Number(pago.monto).toFixed(2)}
                    </p>
                    <p className="text-gray-600">
                      {pago.metodo_pago} · {pago.tipo_movimiento || 'ingreso'} · {pago.origen || 'manual'}
                    </p>
                    <p className="text-gray-500">{new Date(pago.fecha_pago).toLocaleString('es-ES')}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
