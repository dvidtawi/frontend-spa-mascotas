import { useEffect, useMemo, useState } from 'react';
import { inventoryServices, paymentServices, shopServices } from '../api/scheduleService';

const createEmptyRow = () => ({ id: crypto.randomUUID(), productoId: '', cantidad: 1 });

const formatMoney = (value) => `Bs ${Number(value || 0).toFixed(2)}`;

export default function PosAdmin() {
  const today = new Date().toISOString().slice(0, 10);
  const [tab, setTab] = useState('venta');
  const [productos, setProductos] = useState([]);
  const [saleRows, setSaleRows] = useState([createEmptyRow()]);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [observaciones, setObservaciones] = useState('');
  const [pagos, setPagos] = useState([]);
  const [cierre, setCierre] = useState({ resumen: [], total_dia: 0, fecha: today });
  const [fechaReporte, setFechaReporte] = useState(today);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  useEffect(() => {
    loadData();
  }, [fechaReporte]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productosRes, pagosRes, cierreRes] = await Promise.allSettled([
        inventoryServices.getInventario({ include_inactive: false }),
        paymentServices.getPagos({ fecha: fechaReporte }),
        paymentServices.getCierreCaja(fechaReporte),
      ]);

      if (productosRes.status === 'fulfilled') {
        const inventario = Array.isArray(productosRes.value.data) ? productosRes.value.data : [];
        setProductos(inventario.filter((item) => item.tipo === 'producto_tienda' && item.estado_activo));
      }

      if (pagosRes.status === 'fulfilled') {
        setPagos(Array.isArray(pagosRes.value.data) ? pagosRes.value.data : []);
      }

      if (cierreRes.status === 'fulfilled') {
        setCierre(cierreRes.value.data || { resumen: [], total_dia: 0, fecha: fechaReporte });
      }

      const issues = [];
      const formatIssue = (label, result) => {
        if (result.status !== 'rejected') return null;
        const detail = result.reason?.response?.data?.error || result.reason?.message || 'error desconocido';
        return `${label}: ${detail}`;
      };

      const productoIssue = formatIssue('productos', productosRes);
      const pagosIssue = formatIssue('pagos', pagosRes);
      const cierreIssue = formatIssue('cierre', cierreRes);
      if (productoIssue) issues.push(productoIssue);
      if (pagosIssue) issues.push(pagosIssue);
      if (cierreIssue) issues.push(cierreIssue);

      setError(issues.length ? 'No se pudo cargar toda la caja' : null);
      setWarning(issues.length ? issues.join(' | ') : null);
    } catch (err) {
      setError('Error al cargar la informacion de caja');
    } finally {
      setLoading(false);
    }
  };

  const saleRowsEnriched = useMemo(() => saleRows.map((row) => {
    const producto = productos.find((item) => item.id === row.productoId);
    const precio = Number(producto?.precio_venta || 0);
    const cantidad = Number(row.cantidad || 0);
    return {
      ...row,
      producto,
      subtotal: precio * cantidad,
    };
  }), [saleRows, productos]);

  const saleSubtotal = saleRowsEnriched.reduce((sum, row) => sum + row.subtotal, 0);

  const updateRow = (rowId, field, value) => {
    setSaleRows((prev) => prev.map((row) => (
      row.id === rowId ? { ...row, [field]: value } : row
    )));
  };

  const addRow = () => {
    setSaleRows((prev) => [...prev, { id: crypto.randomUUID(), productoId: '', cantidad: 1 }]);
  };

  const removeRow = (rowId) => {
    setSaleRows((prev) => prev.filter((row) => row.id !== rowId));
  };

  const resetVenta = () => {
    setSaleRows([createEmptyRow()]);
    setMetodoPago('efectivo');
    setObservaciones('');
  };

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const items = saleRowsEnriched
        .filter((row) => row.producto && Number(row.cantidad) > 0)
        .map((row) => ({
          id: row.producto.id,
          cantidad: Number(row.cantidad),
        }));

      if (items.length === 0) {
        setError('Debes seleccionar al menos un producto');
        return;
      }

      await shopServices.crearVenta({
        items,
        metodo_pago: metodoPago,
        observaciones,
      });

      resetVenta();
      setTab('historial');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo registrar la venta');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">POS y Caja</h2>
        <p className="text-sm text-gray-500">Ventas de tienda, pagos de servicios y cierre por fecha.</p>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {warning && !error && (
        <div className="mb-4 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          {warning}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          ['venta', 'Nueva venta'],
          ['historial', 'Historial de pagos'],
          ['cierre', 'Cierre del dia'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-xl px-4 py-2 font-semibold transition ${
              tab === id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'venta' && (
        <form onSubmit={handleSaleSubmit} className="rounded-2xl border bg-gray-50 p-5">
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_180px]">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Metodo de pago</label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="efectivo">Efectivo</option>
                <option value="qr">QR</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Subtotal</label>
              <div className="rounded-lg border border-gray-300 bg-white px-3 py-2 font-bold text-gray-900">
                {formatMoney(saleSubtotal)}
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={addRow}
                className="w-full rounded-lg bg-slate-700 px-4 py-2 text-white"
              >
                Agregar producto
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {saleRows.map((row) => {
              const producto = productos.find((item) => item.id === row.productoId);
              return (
                <div key={row.id} className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-[minmax(0,1fr)_140px_140px_120px]">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Producto</label>
                    <select
                      value={row.productoId}
                      onChange={(e) => updateRow(row.id, 'productoId', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    >
                      <option value="">Seleccionar producto</option>
                      {productos.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nombre} | Stock: {item.stock_actual}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      value={row.cantidad}
                      onChange={(e) => updateRow(row.id, 'cantidad', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div className="flex flex-col justify-center">
                    <p className="text-xs font-semibold text-gray-700">Monto</p>
                    <p className="font-bold text-gray-900">{formatMoney((producto?.precio_venta || 0) * Number(row.cantidad || 0))}</p>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="w-full rounded-lg bg-gray-200 px-3 py-2 text-gray-700"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-semibold text-gray-700">Notas</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows="3"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Observaciones de la venta"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-60"
            >
              {saving ? 'Procesando...' : 'Registrar venta'}
            </button>
          </div>
        </form>
      )}

      {tab === 'historial' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border p-5">
            <h3 className="mb-3 text-lg font-bold text-gray-900">Pagos registrados</h3>
            <div className="space-y-3">
              {pagos.length === 0 ? (
                <p className="text-sm text-gray-500">No hay pagos registrados para la fecha seleccionada.</p>
              ) : (
                pagos.map((pago) => (
                  <div key={pago.id} className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {pago.concepto || 'Pago sin concepto'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(pago.fecha_pago).toLocaleString('es-ES')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {pago.metodo_pago} · {pago.tipo_movimiento || 'ingreso'} · {pago.origen || 'manual'}
                        </p>
                        <p className="text-xs text-emerald-700">
                          {pago.tipo_venta === 'tienda'
                            ? `Venta de tienda${pago.pedido_nombre ? ` - ${pago.pedido_nombre}` : ''}`
                            : 'Servicio de grooming'}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {formatMoney(pago.monto)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border p-5">
            <h3 className="mb-3 text-lg font-bold text-gray-900">Cierre del dia</h3>
            <p className="mb-4 text-3xl font-bold text-green-700">{formatMoney(cierre.total_dia)}</p>
            <div className="space-y-2">
              {(cierre.resumen || []).map((item) => (
                <div key={`${item.metodo_pago}-${item.tipo_movimiento}`} className="flex justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  <span>{item.metodo_pago} · {item.tipo_movimiento}</span>
                  <span>{item.total_transacciones} mov. - {formatMoney(item.total_monto)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'cierre' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <div className="rounded-2xl border p-5">
            <label className="mb-1 block text-sm font-semibold text-gray-700">Fecha de cierre</label>
            <input
              type="date"
              value={fechaReporte}
              onChange={(e) => setFechaReporte(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
            <p className="mt-3 text-sm text-gray-500">
              El cierre suma servicios, ventas y reembolsos registrados en la fecha.
            </p>
          </div>

          <div className="rounded-2xl border p-5">
            <h3 className="mb-3 text-lg font-bold text-gray-900">Resumen por metodo</h3>
            <p className="mb-4 text-3xl font-bold text-green-700">{formatMoney(cierre.total_dia)}</p>
            <div className="space-y-2">
              {(cierre.resumen || []).map((item) => (
                <div key={`${item.metodo_pago}-${item.tipo_movimiento}`} className="flex justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  <span>{item.metodo_pago} · {item.tipo_movimiento}</span>
                  <span>{item.total_transacciones} mov. - {formatMoney(item.total_monto)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
