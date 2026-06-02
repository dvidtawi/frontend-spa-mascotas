import { useEffect, useState } from 'react';
import { inventoryServices } from '../api/scheduleService';

export default function InsumosAdmin() {
  const [citasPendientes, setCitasPendientes] = useState([]);
  const [inventarioItems, setInventarioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ open: false, cita: null });
  const [items, setItems] = useState([{ id_insumo: '', cantidad_entregada: 1 }]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pendientesRes, inventarioRes] = await Promise.all([
        inventoryServices.getCitasPendientesInsumos(),
        inventoryServices.getInventario({ include_inactive: false }),
      ]);

      setCitasPendientes(Array.isArray(pendientesRes.data) ? pendientesRes.data : []);
      setInventarioItems(Array.isArray(inventarioRes.data) ? inventarioRes.data : []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cargar la bandeja de insumos');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (cita) => {
    setModal({ open: true, cita });
    setItems([{ id_insumo: '', cantidad_entregada: 1 }]);
  };

  const closeModal = () => {
    setModal({ open: false, cita: null });
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((item, itemIndex) => (
      itemIndex === index
        ? { ...item, [field]: field === 'id_insumo' ? value : Number(value) || 0 }
        : item
    )));
  };

  const addRow = () => {
    setItems((prev) => ([...prev, { id_insumo: '', cantidad_entregada: 1 }]));
  };

  const removeRow = (index) => {
    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const submit = async () => {
    try {
      if (!modal.cita) return;

      const payloadItems = items.filter((item) => item.id_insumo && Number(item.cantidad_entregada) > 0);
      if (payloadItems.length === 0) {
        setError('Debes agregar al menos un insumo con cantidad mayor a 0');
        return;
      }

      setSaving(true);
      await inventoryServices.entregarInsumos({
        cita_id: modal.cita.id,
        items: payloadItems,
      });
      closeModal();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo entregar los insumos');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Insumos</h2>
        <p className="text-sm text-gray-500">Citas confirmadas sin insumos asignados.</p>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-gray-500">Cargando citas pendientes...</div>
      ) : citasPendientes.length === 0 ? (
        <div className="rounded-xl border bg-white p-6 text-center text-gray-500">
          No hay citas pendientes de asignación de insumos.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {citasPendientes.map((cita) => (
            <div key={cita.id} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{cita.mascota_nombre}</h3>
                  <p className="text-sm text-gray-600">{cita.servicio_nombre}</p>
                  <p className="text-sm text-gray-600">Cliente: {cita.cliente_nombre}</p>
                  <p className="text-sm text-gray-600">Groomer: {cita.groomer_nombre || 'Sin groomer'}</p>
                </div>
                <button
                  onClick={() => openModal(cita)}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-white"
                >
                  Asignar insumos
                </button>
              </div>

              <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                <p className="font-semibold">Fecha</p>
                <p>{new Date(cita.fecha_inicio).toLocaleString('es-ES')}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && modal.cita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-5xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Asignar insumos</h3>
                <p className="text-sm text-gray-600">
                  {modal.cita.mascota_nombre} - {modal.cita.servicio_nombre}
                </p>
              </div>
              <button onClick={closeModal} className="rounded bg-gray-300 px-4 py-2 text-gray-700">
                Cerrar
              </button>
            </div>

            <p className="mb-4 text-sm text-gray-600">
              Selecciona los insumos que se entregan antes de iniciar la cita. Luego desaparecerá de esta lista.
            </p>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={`${index}-${item.id_insumo || 'nuevo'}`}
                  className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 md:grid-cols-[minmax(0,1fr)_160px_120px]"
                >
                  <select
                    value={item.id_insumo}
                    onChange={(e) => updateItem(index, 'id_insumo', e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="">Seleccionar insumo...</option>
                    {inventarioItems.map((insumo) => (
                      <option key={insumo.id} value={insumo.id}>
                        {insumo.nombre} | Stock: {insumo.stock_actual}
                      </option>
                    ))}
                  </select>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">Cantidad entregada</label>
                    <input
                      type="number"
                      min="1"
                      value={item.cantidad_entregada}
                      onChange={(e) => updateItem(index, 'cantidad_entregada', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="rounded-lg bg-gray-200 px-3 py-2 text-gray-700"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={addRow} className="rounded-lg bg-slate-700 px-4 py-2 text-white">
                Agregar fila
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={saving}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:opacity-60"
              >
                Confirmar entrega
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
