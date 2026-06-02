import { useEffect, useMemo, useState } from 'react';
import { inventoryServices, shopServices } from '../api/scheduleService';

const emptyPromoForm = {
  nombre: '',
  descripcion: '',
  tipo: 'porcentaje',
  porcentaje_descuento: 0,
  precio_promocional: 0,
  stock_limite: 0,
  fecha_inicio: '',
  fecha_fin: '',
};

const emptyCouponForm = {
  codigo: '',
  descripcion: '',
  tipo_descuento: 'porcentaje',
  valor_descuento: 0,
  producto_id: '',
  fecha_inicio: '',
  fecha_fin: '',
  usos_maximos: 0,
};

const emptyComboRow = () => ({ producto_id: '', cantidad: 1 });

const money = (value) => `Bs ${Number(value || 0).toFixed(2)}`;

const toDatetimeLocal = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const parsePromoProducts = (promo) => {
  try {
    const parsed = typeof promo.productos_json === 'string' ? JSON.parse(promo.productos_json) : promo.productos_json;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const formatPromoType = (tipo) => (tipo === 'combo' ? 'Combo' : 'Descuento');

export default function PromocionesAdmin() {
  const [promociones, setPromociones] = useState([]);
  const [cupones, setCupones] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ open: false, kind: null, mode: 'create', data: null });
  const [promoForm, setPromoForm] = useState(emptyPromoForm);
  const [promoRows, setPromoRows] = useState([emptyComboRow()]);
  const [couponForm, setCouponForm] = useState(emptyCouponForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [promosRes, cuponesRes, inventarioRes] = await Promise.allSettled([
        shopServices.getPromociones(),
        shopServices.getCupones(),
        inventoryServices.getInventario({ include_inactive: false }),
      ]);

      if (promosRes.status === 'fulfilled') {
        setPromociones(Array.isArray(promosRes.value.data) ? promosRes.value.data : []);
      }

      if (cuponesRes.status === 'fulfilled') {
        setCupones(Array.isArray(cuponesRes.value.data) ? cuponesRes.value.data : []);
      }

      if (inventarioRes.status === 'fulfilled') {
        setInventario(Array.isArray(inventarioRes.value.data) ? inventarioRes.value.data : []);
      }

      const issues = [];
      if (promosRes.status === 'rejected') issues.push('promociones');
      if (cuponesRes.status === 'rejected') issues.push('cupones');
      if (inventarioRes.status === 'rejected') issues.push('inventario');
      setError(issues.length ? `Datos incompletos: ${issues.join(', ')}` : null);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cargar promociones y cupones');
    } finally {
      setLoading(false);
    }
  };

  const getProducto = (id) => inventario.find((item) => String(item.id) === String(id));

  const comboOriginalPrice = useMemo(() => (
    promoRows.reduce((sum, row) => {
      const producto = getProducto(row.producto_id);
      const cantidad = Number(row.cantidad || 0);
      return sum + (Number(producto?.precio_venta || 0) * cantidad);
    }, 0)
  ), [promoRows, inventario]);

  const comboStockLimit = useMemo(() => {
    if (!promoRows.length) return 0;
    const limits = promoRows
      .map((row) => {
        const producto = getProducto(row.producto_id);
        const cantidad = Number(row.cantidad || 0);
        if (!producto || cantidad <= 0) return 0;
        return Math.floor(Number(producto.stock_actual || 0) / cantidad);
      })
      .filter((value) => value > 0);
    if (!limits.length) return 0;
    return Math.min(...limits);
  }, [promoRows, inventario]);

  const openPromoModal = (mode = 'create', promo = null) => {
    if (promo) {
      const productos = parsePromoProducts(promo);
      setPromoForm({
        nombre: promo.nombre || '',
        descripcion: promo.descripcion || '',
        tipo: promo.tipo || 'porcentaje',
        porcentaje_descuento: Number(promo.porcentaje_descuento || 0),
        precio_promocional: Number(promo.precio_promocional || 0),
        stock_limite: Number(promo.stock_limite || 0),
        fecha_inicio: toDatetimeLocal(promo.fecha_inicio),
        fecha_fin: toDatetimeLocal(promo.fecha_fin),
      });
      setPromoRows(
        productos.length
          ? productos.map((item) => ({ producto_id: item.producto_id || item.id || '', cantidad: Number(item.cantidad || 1) }))
          : [emptyComboRow()]
      );
    } else {
      setPromoForm(emptyPromoForm);
      setPromoRows([emptyComboRow()]);
    }
    setModal({ open: true, kind: 'promo', mode, data: promo });
  };

  const openCouponModal = (mode = 'create', cupon = null) => {
    if (cupon) {
      setCouponForm({
        codigo: cupon.codigo || '',
        descripcion: cupon.descripcion || '',
        tipo_descuento: cupon.tipo_descuento || 'porcentaje',
        valor_descuento: Number(cupon.valor_descuento || 0),
        producto_id: cupon.producto_id || '',
        fecha_inicio: toDatetimeLocal(cupon.fecha_inicio),
        fecha_fin: toDatetimeLocal(cupon.fecha_fin),
        usos_maximos: Number(cupon.usos_maximos || 0),
      });
    } else {
      setCouponForm(emptyCouponForm);
    }
    setModal({ open: true, kind: 'coupon', mode, data: cupon });
  };

  const closeModal = () => {
    setModal({ open: false, kind: null, mode: 'create', data: null });
    setPromoForm(emptyPromoForm);
    setPromoRows([emptyComboRow()]);
    setCouponForm(emptyCouponForm);
  };

  const updatePromoRow = (index, field, value) => {
    setPromoRows((prev) => prev.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
  };

  const addPromoRow = () => setPromoRows((prev) => [...prev, emptyComboRow()]);
  const removePromoRow = (index) => setPromoRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index));

  const handlePromoField = (e) => {
    const { name, value } = e.target;
    setPromoForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCouponField = (e) => {
    const { name, value } = e.target;
    setCouponForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitPromo = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      if (!promoForm.nombre.trim()) {
        setError('El nombre de la promocion es requerido');
        return;
      }

      const payload = {
        nombre: promoForm.nombre.trim(),
        descripcion: promoForm.descripcion.trim() || null,
        tipo: promoForm.tipo,
        porcentaje_descuento: promoForm.tipo === 'porcentaje' ? Number(promoForm.porcentaje_descuento || 0) : 0,
        precio_promocional: promoForm.tipo === 'combo' ? Number(promoForm.precio_promocional || 0) : 0,
        stock_limite: Number(promoForm.stock_limite || 0),
        fecha_inicio: promoForm.fecha_inicio ? new Date(promoForm.fecha_inicio).toISOString() : null,
        fecha_fin: promoForm.fecha_fin ? new Date(promoForm.fecha_fin).toISOString() : null,
        productos_json: JSON.stringify(
          promoForm.tipo === 'combo'
            ? promoRows
                .filter((row) => row.producto_id && Number(row.cantidad) > 0)
                .map((row) => ({
                  producto_id: row.producto_id,
                  cantidad: Number(row.cantidad || 1),
                }))
            : promoRows
                .filter((row) => row.producto_id)
                .slice(0, 1)
                .map((row) => ({ producto_id: row.producto_id, cantidad: 1 }))
        ),
      };

      if (promoForm.tipo === 'combo') {
        if (!payload.productos_json || JSON.parse(payload.productos_json).length < 2) {
          setError('Un combo debe tener al menos 2 productos');
          return;
        }

        if (comboStockLimit <= 0) {
          setError('No se puede guardar el combo por stock insuficiente');
          return;
        }

        if (Number(promoForm.precio_promocional || 0) <= 0) {
          setError('El precio del combo debe ser mayor a 0');
          return;
        }
      }

      if (modal.mode === 'edit' && modal.data?.id) {
        await shopServices.updatePromocion(modal.data.id, payload);
      } else {
        await shopServices.createPromocion(payload);
      }

      closeModal();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar la promocion');
    } finally {
      setSaving(false);
    }
  };

  const submitCoupon = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      if (!couponForm.codigo.trim()) {
        setError('El codigo del cupon es requerido');
        return;
      }

      const payload = {
        codigo: couponForm.codigo.trim(),
        descripcion: couponForm.descripcion.trim() || null,
        tipo_descuento: couponForm.tipo_descuento,
        valor_descuento: Number(couponForm.valor_descuento || 0),
        producto_id: couponForm.producto_id || null,
        fecha_inicio: couponForm.fecha_inicio ? new Date(couponForm.fecha_inicio).toISOString() : null,
        fecha_fin: couponForm.fecha_fin ? new Date(couponForm.fecha_fin).toISOString() : null,
        usos_maximos: Number(couponForm.usos_maximos || 0),
      };

      if (modal.mode === 'edit' && modal.data?.id) {
        await shopServices.updateCupon(modal.data.id, payload);
      } else {
        await shopServices.createCupon(payload);
      }

      closeModal();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar el cupon');
    } finally {
      setSaving(false);
    }
  };

  const togglePromo = async (promo) => {
    try {
      await shopServices.togglePromocion(promo.id, !promo.estado_activo);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cambiar el estado de la promocion');
    }
  };

  const toggleCoupon = async (cupon) => {
    try {
      await shopServices.toggleCupon(cupon.id, !cupon.estado_activo);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cambiar el estado del cupon');
    }
  };

  return (
    <div className="space-y-6 rounded-lg bg-white p-6 shadow">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Promociones y cupones</h2>
          <p className="text-sm text-gray-500">
            Edita ofertas, activa o desactiva registros y define combos con stock controlado.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openPromoModal('create')}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
          >
            + Nueva promocion
          </button>
          <button
            type="button"
            onClick={() => openCouponModal('create')}
            className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white"
          >
            + Nuevo cupon
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-gray-500">Cargando promociones...</div>
      ) : (
        <>
          <section className="rounded-xl border border-gray-200 p-5">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Promociones registradas</h3>
            {promociones.length === 0 ? (
              <p className="text-sm text-gray-500">No hay promociones cargadas.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {promociones.map((promo) => {
                  const productos = parsePromoProducts(promo);
                  return (
                    <div key={promo.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">{promo.nombre}</p>
                          <p className="text-sm text-gray-600">{promo.descripcion || 'Sin descripcion.'}</p>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${promo.estado_activo === false ? 'bg-gray-200 text-gray-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {promo.estado_activo === false ? 'Inactiva' : 'Activa'}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-700">
                        <span className="rounded-full bg-white px-2 py-1">{formatPromoType(promo.tipo)}</span>
                        {promo.tipo === 'combo' ? (
                          <>
                            <span className="rounded-full bg-white px-2 py-1">Combo {money(promo.precio_promocional)}</span>
                            <span className="rounded-full bg-white px-2 py-1">Stock limite {promo.stock_limite || 0}</span>
                            {promo.bloqueo_stock?.length > 0 && (
                              <span className="rounded-full bg-red-100 px-2 py-1 text-red-700">
                                Stock insuficiente
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="rounded-full bg-white px-2 py-1">{promo.porcentaje_descuento || 0}% descuento</span>
                            <span className="rounded-full bg-white px-2 py-1">Producto {productos[0]?.producto_id || 'general'}</span>
                          </>
                        )}
                      </div>

                      <div className="mt-3 text-xs text-gray-600">
                        <p>Inicio: {promo.fecha_inicio ? new Date(promo.fecha_inicio).toLocaleString('es-BO') : 'Sin fecha'}</p>
                        <p>Fin: {promo.fecha_fin ? new Date(promo.fecha_fin).toLocaleString('es-BO') : 'Sin fecha'}</p>
                        {promo.tipo === 'combo' && (
                          <p>Precio original del combo: {money(productos.reduce((sum, item) => {
                            const producto = getProducto(item.producto_id);
                            return sum + (Number(producto?.precio_venta || 0) * Number(item.cantidad || 0));
                          }, 0))}</p>
                        )}
                      </div>

                      {promo.tipo === 'combo' && productos.length > 0 && (
                        <div className="mt-3 rounded-lg bg-white p-3 text-xs text-gray-700">
                          <p className="mb-2 font-semibold">Productos del combo</p>
                          <div className="space-y-1">
                            {productos.map((item, index) => {
                              const producto = getProducto(item.producto_id);
                              return (
                                <div key={`${promo.id}-${index}`} className="flex justify-between">
                                  <span>{producto?.nombre || 'Producto'} x{item.cantidad}</span>
                                  <span>{money(Number(producto?.precio_venta || 0) * Number(item.cantidad || 0))}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openPromoModal('edit', promo)}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePromo(promo)}
                          className={`rounded-lg px-3 py-2 text-xs font-semibold text-white ${promo.estado_activo === false ? 'bg-emerald-600' : 'bg-gray-700'}`}
                        >
                          {promo.estado_activo === false ? 'Activar' : 'Desactivar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-gray-200 p-5">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Cupones registrados</h3>
            {cupones.length === 0 ? (
              <p className="text-sm text-gray-500">No hay cupones cargados.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {cupones.map((cupon) => (
                  <div key={cupon.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{cupon.codigo}</p>
                        <p className="text-sm text-gray-600">{cupon.descripcion || 'Sin descripcion.'}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${cupon.estado_activo === false ? 'bg-gray-200 text-gray-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {cupon.estado_activo === false ? 'Inactivo' : 'Activo'}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-700">
                      <span className="rounded-full bg-white px-2 py-1">{cupon.tipo_descuento === 'monto' ? 'Monto fijo' : 'Porcentaje'}</span>
                      <span className="rounded-full bg-white px-2 py-1">
                        {cupon.tipo_descuento === 'monto' ? money(cupon.valor_descuento) : `${Number(cupon.valor_descuento || 0)}%`}
                      </span>
                      <span className="rounded-full bg-white px-2 py-1">Usos {cupon.usos_actuales || 0}/{cupon.usos_maximos || 0}</span>
                    </div>

                    <div className="mt-3 text-xs text-gray-600">
                      <p>Inicio: {cupon.fecha_inicio ? new Date(cupon.fecha_inicio).toLocaleString('es-BO') : 'Sin fecha'}</p>
                      <p>Fin: {cupon.fecha_fin ? new Date(cupon.fecha_fin).toLocaleString('es-BO') : 'Sin fecha'}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openCouponModal('edit', cupon)}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCoupon(cupon)}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold text-white ${cupon.estado_activo === false ? 'bg-emerald-600' : 'bg-gray-700'}`}
                      >
                        {cupon.estado_activo === false ? 'Activar' : 'Desactivar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {modal.open && modal.kind === 'promo' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {modal.mode === 'edit' ? 'Editar promocion' : 'Nueva promocion'}
                </h3>
                <p className="text-sm text-gray-500">Define un descuento o un combo con stock controlado.</p>
              </div>
              <button type="button" onClick={closeModal} className="rounded-lg bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-700">
                Cerrar
              </button>
            </div>

            <form onSubmit={submitPromo} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Nombre</label>
                  <input
                    name="nombre"
                    value={promoForm.nombre}
                    onChange={handlePromoField}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Tipo</label>
                  <select
                    name="tipo"
                    value={promoForm.tipo}
                    onChange={handlePromoField}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="porcentaje">Descuento</option>
                    <option value="combo">Combo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Descripcion</label>
                <textarea
                  name="descripcion"
                  value={promoForm.descripcion}
                  onChange={handlePromoField}
                  rows="3"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              {promoForm.tipo === 'porcentaje' ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Producto en descuento</label>
                    <select
                      value={promoRows[0]?.producto_id || ''}
                      onChange={(e) => setPromoRows([{ producto_id: e.target.value, cantidad: 1 }])}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    >
                      <option value="">Selecciona un producto</option>
                      {inventario.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nombre} - {money(item.precio_venta)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700">Porcentaje de descuento</label>
                    <input
                      type="number"
                      name="porcentaje_descuento"
                      value={promoForm.porcentaje_descuento}
                      onChange={handlePromoField}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Productos del combo</h4>
                    <button type="button" onClick={addPromoRow} className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold text-white">
                      Agregar producto
                    </button>
                  </div>

                  {promoRows.map((row, index) => {
                    const producto = getProducto(row.producto_id);
                    return (
                      <div key={`combo-${index}`} className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_140px_160px_120px]">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-gray-700">Producto</label>
                          <select
                            value={row.producto_id}
                            onChange={(e) => updatePromoRow(index, 'producto_id', e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                          >
                            <option value="">Selecciona</option>
                            {inventario.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.nombre} | Stock: {item.stock_actual} | {money(item.precio_venta)}
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
                            onChange={(e) => updatePromoRow(index, 'cantidad', e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                          />
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
                          <p className="text-xs text-gray-500">Subtotal original</p>
                          <p className="font-semibold text-gray-900">{money(Number(producto?.precio_venta || 0) * Number(row.cantidad || 0))}</p>
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removePromoRow(index)}
                            className="w-full rounded-lg bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-700"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700">Precio del combo</label>
                      <input
                        type="number"
                        name="precio_promocional"
                        value={promoForm.precio_promocional}
                        onChange={handlePromoField}
                        min="0"
                        step="0.01"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                      <p className="text-xs text-gray-500">Precio original del combo</p>
                      <p className="text-lg font-bold text-gray-900">{money(comboOriginalPrice)}</p>
                      <p className="text-xs text-gray-500">Stock maximo viable: {comboStockLimit || 0}</p>
                    </div>
                  </div>

                  <p className={`text-xs ${comboStockLimit > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {comboStockLimit > 0
                      ? 'El combo es viable con el stock actual.'
                      : 'No hay stock suficiente para activar este combo.'}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Stock limite</label>
                  <input
                    type="number"
                    name="stock_limite"
                    value={promoForm.stock_limite}
                    onChange={handlePromoField}
                    min="0"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Inicio</label>
                  <input
                    type="datetime-local"
                    name="fecha_inicio"
                    value={promoForm.fecha_inicio}
                    onChange={handlePromoField}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Fin</label>
                  <input
                    type="datetime-local"
                    name="fecha_fin"
                    value={promoForm.fecha_fin}
                    onChange={handlePromoField}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
                >
                  {saving ? 'Guardando...' : 'Guardar promocion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal.open && modal.kind === 'coupon' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {modal.mode === 'edit' ? 'Editar cupon' : 'Nuevo cupon'}
                </h3>
                <p className="text-sm text-gray-500">Configura el descuento y su vigencia.</p>
              </div>
              <button type="button" onClick={closeModal} className="rounded-lg bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-700">
                Cerrar
              </button>
            </div>

            <form onSubmit={submitCoupon} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Codigo</label>
                  <input
                    name="codigo"
                    value={couponForm.codigo}
                    onChange={handleCouponField}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Tipo</label>
                  <select
                    name="tipo_descuento"
                    value={couponForm.tipo_descuento}
                    onChange={handleCouponField}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="porcentaje">Porcentaje</option>
                    <option value="monto">Monto fijo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Descripcion</label>
                <textarea
                  name="descripcion"
                  value={couponForm.descripcion}
                  onChange={handleCouponField}
                  rows="3"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Valor descuento</label>
                  <input
                    type="number"
                    name="valor_descuento"
                    value={couponForm.valor_descuento}
                    onChange={handleCouponField}
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Producto opcional</label>
                  <select
                    name="producto_id"
                    value={couponForm.producto_id}
                    onChange={handleCouponField}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="">Aplica al total</option>
                    {inventario.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Usos maximos</label>
                  <input
                    type="number"
                    name="usos_maximos"
                    value={couponForm.usos_maximos}
                    onChange={handleCouponField}
                    min="0"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Inicio</label>
                  <input
                    type="datetime-local"
                    name="fecha_inicio"
                    value={couponForm.fecha_inicio}
                    onChange={handleCouponField}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Fin</label>
                  <input
                    type="datetime-local"
                    name="fecha_fin"
                    value={couponForm.fecha_fin}
                    onChange={handleCouponField}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
                >
                  {saving ? 'Guardando...' : 'Guardar cupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
