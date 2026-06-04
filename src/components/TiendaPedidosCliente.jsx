import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiClipboard, FiShoppingCart } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import placeholderProduct from '../assets/product-placeholder.svg';
import { useAuth } from '../auth/AuthContext';
import { shopServices } from '../api/scheduleService';

const BACKEND_BASE_URL = 'http://localhost:3000';
const DELIVERY_FEE = 15;

const formatMoney = (value) => `Bs ${Number(value || 0).toFixed(2)}`;

const getProductImage = (item) =>
  item.ruta_imagen_local ? `${BACKEND_BASE_URL}${item.ruta_imagen_local}` : placeholderProduct;

const normalizePromotion = (promo) => ({
  ...promo,
  id: promo.id,
  nombre: promo.nombre || promo.titulo || 'Promocion',
  descripcion: promo.descripcion || '',
  descuento_porcentaje: Number(promo.descuento_porcentaje || promo.porcentaje_descuento || 0),
  precio_promocional: Number(promo.precio_promocional || 0),
  stock_limite: Number(promo.stock_limite || 0),
});

const parsePromoProducts = (promo) => {
  try {
    const parsed = typeof promo?.productos_json === 'string'
      ? JSON.parse(promo.productos_json)
      : promo?.productos_json;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const getPromoProduct = (promo, catalogo = []) => {
  const productos = parsePromoProducts(promo);
  const target = productos[0];
  if (!target) return null;
  return catalogo.find((item) => String(item.id) === String(target.producto_id || target.id));
};

const getPromoOriginalPrice = (promo, catalogo = []) => {
  const productos = parsePromoProducts(promo);
  return productos.reduce((sum, item) => {
    const producto = catalogo.find((row) => String(row.id) === String(item.producto_id || item.id));
    return sum + (Number(producto?.precio_venta || 0) * Number(item.cantidad || 1));
  }, 0);
};

const mergeById = (items = []) => {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

const buildOrderPdf = (order) => {
  const doc = new jsPDF();
  const marginLeft = 14;
  let y = 18;

  const write = (text, size = 11, isBold = false, lineGap = 7) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(String(text || ''), 180);
    doc.text(lines, marginLeft, y);
    y += lines.length * lineGap;
  };

  write('Factura PetSpa Mascotas', 18, true, 10);
  write(`Cliente: ${order.cliente_nombre || 'Cliente'}`, 11, true);
  write(`Pedido: ${String(order.id).slice(0, 8)}`, 11, false);
  write(`Fecha: ${new Date(order.created_at).toLocaleString('es-BO')}`, 11, false, 8);
  write(`Entrega: ${order.tipo_entrega === 'delivery' ? 'Delivery' : 'Retiro en tienda'}`, 11, false);
  if (order.tipo_entrega === 'delivery' && order.direccion_entrega) {
    write(`Direccion: ${order.direccion_entrega}`, 11, false);
  }
  if (order.codigo_cupon) {
    write(`Cupon: ${order.codigo_cupon}`, 11, false);
  }
  write('Detalle de productos', 12, true, 8);

  (order.items || []).forEach((item, index) => {
    write(
      `${index + 1}. ${item.nombre_producto} x${item.cantidad} | ${formatMoney(item.precio_unitario_snapshot || item.precio_unitario)} c/u | ${formatMoney(item.subtotal_linea)}`,
      10,
      false,
      6
    );
  });

  y += 4;
  write(`Subtotal: ${formatMoney(order.subtotal)}`, 11, true, 7);
  write(`Delivery: ${formatMoney(order.tarifa_entrega || 0)}`, 11, false, 7);
  write(`Descuento promocion: ${formatMoney(order.descuento_promocion || 0)}`, 11, false, 7);
  write(`Descuento cupon: ${formatMoney(order.descuento_cupon || 0)}`, 11, false, 7);
  write(`Descuento cliente frecuente: ${formatMoney(order.descuento_cliente_frecuente || 0)}`, 11, false, 7);
  write(`Total: ${formatMoney(order.total)}`, 12, true, 8);
  write(`Metodo de pago: ${order.metodo_pago || order.pago_metodo || order.pago?.metodo_pago || 'pendiente'}`, 11, false);

  doc.save(`factura-petspa-${String(order.id).slice(0, 8)}.pdf`);
};

const buildOrderReceiptText = (order) => {
  const lines = [
    'Factura PetSpa Mascotas',
    `Cliente: ${order.cliente_nombre || 'Cliente'}`,
    `Pedido: ${String(order.id || '').slice(0, 8)}`,
    `Fecha: ${order.created_at ? new Date(order.created_at).toLocaleString('es-BO') : new Date().toLocaleString('es-BO')}`,
    `Entrega: ${order.tipo_entrega === 'delivery' ? 'Delivery' : 'Retiro en tienda'}`,
    '',
    'Detalle de productos',
  ];

  (order.items || []).forEach((item, index) => {
    lines.push(
      `${index + 1}. ${item.nombre_producto} x${item.cantidad} | ${formatMoney(item.precio_unitario_snapshot || item.precio_unitario)} c/u | ${formatMoney(item.subtotal_linea)}`
    );
  });

  lines.push('');
  lines.push(`Subtotal: ${formatMoney(order.subtotal)}`);
  lines.push(`Delivery: ${formatMoney(order.cargo_entrega || order.tarifa_entrega || 0)}`);
  lines.push(`Descuento promocion: ${formatMoney(order.descuento_promocion || 0)}`);
  lines.push(`Descuento cupon: ${formatMoney(order.descuento_cupon || 0)}`);
  lines.push(`Descuento cliente frecuente: ${formatMoney(order.descuento_cliente_frecuente || 0)}`);
  lines.push(`Total: ${formatMoney(order.total)}`);
  lines.push(`Metodo de pago: ${order.metodo_pago || order.pago_metodo || order.pago?.metodo_pago || 'pendiente'}`);

  return lines.join('\n');
};

export default function TiendaPedidosCliente() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [catalogo, setCatalogo] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [categoria, setCategoria] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [tab, setTab] = useState('catalogo');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [generado, setGenerado] = useState(null);
  const [metodoPago, setMetodoPago] = useState('qr');
  const [tipoEntrega, setTipoEntrega] = useState('retiro');
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [codigoCupon, setCodigoCupon] = useState('');
  const [promoSeleccionada, setPromoSeleccionada] = useState(null);
  const [couponPreview, setCouponPreview] = useState(null);
  const [couponChecking, setCouponChecking] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        shopServices.getCatalogo(),
        shopServices.getPedidos(),
        shopServices.getPromociones(),
      ]);

      const [catalogoRes, pedidosRes, promocionesRes] = results;

      if (catalogoRes.status === 'fulfilled') {
        const payload = catalogoRes.value.data || {};
        const productos = Array.isArray(payload.productos) ? payload.productos : [];
        const promocionesCatalogo = Array.isArray(payload.promociones) ? payload.promociones : [];
        setCatalogo(productos);
        setPromociones(
          mergeById([
            ...promocionesCatalogo.map(normalizePromotion),
            ...(promocionesRes.status === 'fulfilled'
              ? (Array.isArray(promocionesRes.value.data) ? promocionesRes.value.data : []).map(normalizePromotion)
              : []),
          ])
        );
      }

      if (pedidosRes.status === 'fulfilled') {
        setPedidos(Array.isArray(pedidosRes.value.data) ? pedidosRes.value.data : []);
      }

      const issues = [];
      if (catalogoRes.status === 'rejected') issues.push('catalogo');
      if (pedidosRes.status === 'rejected') issues.push('pedidos');
      if (promocionesRes.status === 'rejected') issues.push('promociones');
      setError(issues.length ? `Se cargaron datos incompletos: ${issues.join(', ')}` : null);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cargar la tienda');
    } finally {
      setLoading(false);
    }
  };

  const categoriasDisponibles = useMemo(
    () => [...new Set(catalogo.map((item) => item.categoria).filter(Boolean))],
    [catalogo]
  );

  const catalogoFiltrado = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return catalogo.filter((item) => {
      const coincideCategoria = !categoria || item.categoria === categoria;
      const coincideBusqueda = !q || [
        item.nombre,
        item.descripcion,
        item.marca,
        item.variante,
        item.presentacion,
      ].some((campo) => String(campo || '').toLowerCase().includes(q));
      return coincideCategoria && coincideBusqueda;
    });
  }, [catalogo, categoria, busqueda]);

  const subtotalCarrito = carrito.reduce(
    (sum, item) => sum + Number(item.precio_venta || 0) * Number(item.cantidad || 0),
    0
  );

  const loyaltyRate = useMemo(() => {
    const completed = pedidos.filter((pedido) => pedido.estado !== 'cancelado').length;
    if (completed >= 8) return 0.05;
    if (completed >= 4) return 0.03;
    if (completed >= 2) return 0.02;
    return 0;
  }, [pedidos]);

  const loyaltyDiscount = subtotalCarrito * loyaltyRate;

  const promoDiscount = useMemo(() => {
    if (!promoSeleccionada) return 0;
    const porcentaje = Number(promoSeleccionada.descuento_porcentaje || 0);
    const precioPromocional = Number(promoSeleccionada.precio_promocional || 0);
    if (precioPromocional > 0) {
      return Math.min(subtotalCarrito, Math.max(0, subtotalCarrito - precioPromocional));
    }
    if (porcentaje > 0) {
      return subtotalCarrito * (porcentaje / 100);
    }
    return 0;
  }, [promoSeleccionada, subtotalCarrito]);

  const deliveryFee = tipoEntrega === 'delivery' ? DELIVERY_FEE : 0;
  const couponDiscount = couponPreview?.valido ? Number(couponPreview.descuento || 0) : 0;
  const totalCarrito = Math.max(
    0,
    subtotalCarrito + deliveryFee - loyaltyDiscount - couponDiscount - promoDiscount
  );

  useEffect(() => {
    let active = true;
    const code = codigoCupon.trim();

    if (!code) {
      setCouponPreview(null);
      setCouponChecking(false);
      return () => {
        active = false;
      };
    }

    setCouponChecking(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await shopServices.validarCupon({
          codigo_cupon: code,
          items: carrito.map((item) => ({
            id: item.id,
            cantidad: item.cantidad,
            precio_venta: item.precio_venta,
          })),
        });
        if (active) {
          setCouponPreview(res.data || null);
        }
      } catch (err) {
        if (active) {
          setCouponPreview({
            valido: false,
            descuento: 0,
            mensaje: err.response?.data?.error || 'No se pudo validar el cupon',
          });
        }
      } finally {
        if (active) setCouponChecking(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [codigoCupon, carrito]);

  const addToCart = (item) => {
    setCarrito((prev) => {
      const existing = prev.find((row) => row.id === item.id);
      if (existing) {
        return prev.map((row) => (
          row.id === item.id
            ? { ...row, cantidad: Math.min((row.cantidad || 0) + 1, Number(item.stock_actual || 0)) }
            : row
        ));
      }
      return [...prev, { ...item, cantidad: 1 }];
    });
  };

  const updateQty = (id, cantidad) => {
    setCarrito((prev) => prev
      .map((item) => (
        item.id === id
          ? {
              ...item,
              cantidad: Math.max(1, Math.min(Number(cantidad) || 1, Number(item.stock_actual || 0))),
            }
          : item
      ))
      .filter((item) => item.cantidad > 0));
  };

  const removeFromCart = (id) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  const selectPromotion = (promo) => {
    if (!promo) return;
    
    // Si ya está seleccionada, deseleccionar
    if (promo.id && setPromoSeleccionada && promo.id === promoSeleccionada?.id) {
      // Si es combo, remover sus productos
      if (promo.tipo === 'combo') {
        const productsToRemove = parsePromoProducts(promo).map(p => String(p.producto_id || p.id));
        setCarrito(prev => prev.filter(item => !productsToRemove.includes(String(item.id))));
      }
      setPromoSeleccionada(null);
      return;
    }

    // Si es combo, agregar sus productos al carrito
    if (promo.tipo === 'combo') {
      const productsToAdd = parsePromoProducts(promo);
      setCarrito((prev) => {
        let updated = [...prev];
        for (const p of productsToAdd) {
          const productId = String(p.producto_id || p.id);
          const catalogProduct = catalogo.find(row => String(row.id) === productId);
          if (catalogProduct) {
            const existing = updated.find(item => String(item.id) === productId);
            if (existing) {
              existing.cantidad = Math.min(
                (existing.cantidad || 0) + Number(p.cantidad || 1),
                Number(catalogProduct.stock_actual || 0)
              );
            } else {
              updated.push({
                ...catalogProduct,
                cantidad: Number(p.cantidad || 1)
              });
            }
          }
        }
        return updated;
      });
    }

    setPromoSeleccionada(promo);
    setCartOpen(true);
  };

  const checkout = async () => {
    try {
      if (!user) {
        setAuthPromptOpen(true);
        return;
      }

      if (tipoEntrega === 'delivery' && !direccionEntrega.trim()) {
        setError('Debes indicar una direccion de entrega');
        return;
      }

      if (codigoCupon.trim() && !couponPreview?.valido) {
        setError(couponPreview?.mensaje || 'El cupon no es valido');
        return;
      }

      setSaving(true);
      const res = await shopServices.crearPedido({
        items: carrito.map((item) => ({ id: item.id, cantidad: item.cantidad })),
        metodo_pago: metodoPago,
        tipo_entrega: tipoEntrega,
        direccion_entrega: tipoEntrega === 'delivery' ? direccionEntrega.trim() : null,
        codigo_cupon: codigoCupon.trim() || null,
        promocion_id: promoSeleccionada?.id || null,
        descuento_cliente_frecuente: Number(loyaltyDiscount.toFixed(2)),
        tarifa_entrega: Number(deliveryFee.toFixed(2)),
      });

      const order = {
        ...res.data,
        subtotal: Number(subtotalCarrito.toFixed(2)),
        cargo_entrega: Number(deliveryFee.toFixed(2)),
        descuento_promocion: Number(promoDiscount.toFixed(2)),
        descuento_cupon: Number(couponDiscount.toFixed(2)),
        descuento_cliente_frecuente: Number(loyaltyDiscount.toFixed(2)),
        total: Number(totalCarrito.toFixed(2)),
        metodo_pago: metodoPago,
        pago_metodo: metodoPago,
        cliente_nombre: res.data?.cliente_nombre || user?.nombre || 'Cliente',
        items: Array.isArray(res.data?.items) && res.data.items.length > 0
          ? res.data.items
          : carrito.map((item) => ({
              id: item.id,
              nombre_producto: item.nombre,
              cantidad: item.cantidad,
              subtotal_linea: Number((Number(item.precio_venta || 0) * Number(item.cantidad || 0)).toFixed(2)),
              precio_unitario_snapshot: Number(item.precio_venta || 0),
            })),
      };
      order.factura = buildOrderReceiptText(order);
      setGenerado(order);
      setPedidos((prev) => [order, ...prev]);
      setCarrito([]);
      setCartOpen(false);
      setCheckoutOpen(false);
      setDireccionEntrega('');
      setCodigoCupon('');
      setPromoSeleccionada(null);
      setTab('pedidos');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo registrar el pedido');
    } finally {
      setSaving(false);
    }
  };

  const ordersToShow = [...pedidos].sort(
    (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-sky-700 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Tienda y pedidos</h2>
            <p className="mt-2 max-w-3xl text-sm text-sky-100">
              Catalogo, promociones, carrito y pedidos separados. Todo queda registrado como venta real en caja.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab('catalogo')}
              className={`rounded-xl px-4 py-2 font-semibold transition ${
                tab === 'catalogo' ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Catalogo
            </button>
            <button
              type="button"
              onClick={() => setTab('pedidos')}
              className={`rounded-xl px-4 py-2 font-semibold transition ${
                tab === 'pedidos' ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Mis pedidos
            </button>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-white"
            >
              <FiShoppingCart />
              Carrito
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{carrito.length}</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          {error}
        </div>
      )}

      {tab === 'catalogo' && (
        <div className="space-y-4">
          {promociones.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-amber-900">Promociones activas</h3>
                  <p className="text-sm text-amber-800">Selecciona una promocion para aplicarla al pedido actual.</p>
                </div>
                {promoSeleccionada && (
                  <button
                    type="button"
                    onClick={() => setPromoSeleccionada(null)}
                    className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-amber-900"
                  >
                    Quitar promocion
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
                {promociones.map((promo) => {
                  const activo = promo.activo === undefined ? true : Boolean(promo.activo);
                  const selected = promoSeleccionada?.id === promo.id;
                  return (
                    <button
                      key={promo.id}
                      type="button"
                      onClick={() => selectPromotion(promo)}
                      className={`rounded-xl border p-4 text-left transition ${
                        selected ? 'border-amber-500 bg-white shadow' : 'border-amber-200 bg-white/80 hover:bg-white'
                      } ${!activo ? 'opacity-70' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-gray-900">{promo.nombre}</p>
                          <p className="text-sm text-gray-600">{promo.descripcion || 'Oferta temporal de tienda.'}</p>
                        </div>
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                          {activo ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-700">
                        {promo.descuento_porcentaje > 0 && (
                          <span className="rounded-full bg-gray-100 px-2 py-1">
                            {promo.descuento_porcentaje}% descuento
                          </span>
                        )}
                        {promo.precio_promocional > 0 && (
                          <span className="rounded-full bg-gray-100 px-2 py-1">
                            Precio promo {formatMoney(promo.precio_promocional)}
                          </span>
                        )}
                        {promo.stock_limite > 0 && (
                          <span className="rounded-full bg-gray-100 px-2 py-1">
                            Stock limite {promo.stock_limite}
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-xs font-semibold text-amber-700">
                        {promo.tipo === 'combo'
                          ? 'Agregar combo al carrito'
                          : 'Aplicar descuento al producto objetivo'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Buscar producto</label>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Ej: shampoo, correa, neutro..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Categoria</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="">Todas</option>
                  {categoriasDisponibles.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Catalogo de productos</h3>
                <p className="text-sm text-gray-500">Alimentos, accesorios, higiene, juguetes y salud.</p>
              </div>
              {loading && <span className="text-sm text-gray-500">Cargando...</span>}
            </div>

            {(!loading && catalogoFiltrado.length === 0) ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                No hay productos para mostrar con esos filtros.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {catalogoFiltrado.map((item) => (
                  <article key={item.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                    <img src={getProductImage(item)} alt={item.nombre} className="h-40 w-full object-cover" />
                    <div className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-gray-900">{item.nombre}</h4>
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            {item.categoria || 'Sin categoria'}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                          Stock: {item.stock_actual}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600">{item.descripcion || 'Sin descripcion.'}</p>

                      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                        {item.variante && <span className="rounded-full bg-white px-2 py-1">{item.variante}</span>}
                        {item.marca && <span className="rounded-full bg-white px-2 py-1">{item.marca}</span>}
                        {item.presentacion && <span className="rounded-full bg-white px-2 py-1">{item.presentacion}</span>}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Precio</p>
                          <p className="text-lg font-bold text-gray-900">{formatMoney(item.precio_venta)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addToCart(item)}
                          disabled={Number(item.stock_actual || 0) <= 0}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'pedidos' && (
        <div className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Mis pedidos</h3>
              <p className="text-sm text-gray-500">Cada pedido queda con su factura y puede descargarse en PDF.</p>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
            >
              Actualizar
            </button>
          </div>

          {ordersToShow.length === 0 ? (
            <p className="text-sm text-gray-500">Todavia no tienes pedidos registrados.</p>
          ) : (
            <div className="space-y-3">
              {ordersToShow.map((pedido) => (
                <div key={pedido.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Pedido {String(pedido.id).slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(pedido.created_at).toLocaleString('es-BO')} - {pedido.estado}
                      </p>
                      <p className="text-xs text-gray-500">
                        Pago: {pedido.pago_metodo || pedido.pago?.metodo_pago || 'pendiente'}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      Total: {formatMoney(pedido.total)}
                    </p>
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-gray-700">
                    {(pedido.items || []).map((item, idx) => (
                      <div key={`${item.id}-${idx}`} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                        <span>{item.nombre_producto} x{item.cantidad}</span>
                        <span>{formatMoney(item.subtotal_linea)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPedido(pedido)}
                      className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white"
                    >
                      Ver factura
                    </button>
                    <button
                      type="button"
                      onClick={() => buildOrderPdf(pedido)}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
                    >
                      Descargar PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
          <div className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Carrito</h3>
                <p className="text-sm text-gray-500">Revisa cantidades antes de confirmar.</p>
              </div>
              <button onClick={() => setCartOpen(false)} className="rounded bg-gray-200 px-3 py-2 text-sm">
                Cerrar
              </button>
            </div>

            {carrito.length === 0 && !promoSeleccionada ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                Tu carrito esta vacio.
              </div>
            ) : (
              <div className="space-y-3">
                {promoSeleccionada && (
                  <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-amber-900">Promocion aplicada</p>
                        <p className="font-bold text-amber-950">{promoSeleccionada.nombre}</p>
                        <p className="text-xs text-amber-800">
                          {promoSeleccionada.tipo === 'combo'
                            ? 'Se agregara como un paquete con sus productos incluidos.'
                            : 'El descuento se aplicara al producto objetivo de la promocion.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPromoSeleccionada(null)}
                        className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-amber-900"
                      >
                        Quitar
                      </button>
                    </div>
                    <div className="mt-3 rounded-lg bg-white p-3 text-sm text-gray-700">
                      {promoSeleccionada.tipo === 'combo' ? (
                        <>
                          <p className="font-semibold text-gray-900">Incluye:</p>
                          <ul className="mt-2 space-y-1">
                            {parsePromoProducts(promoSeleccionada).map((item, index) => {
                              const producto = catalogo.find((row) => String(row.id) === String(item.producto_id || item.id));
                              return (
                                <li key={`${promoSeleccionada.id}-${index}`} className="flex items-center justify-between">
                                  <span>{producto?.nombre || 'Producto'} x{item.cantidad}</span>
                                  <span>{formatMoney(Number(producto?.precio_venta || 0) * Number(item.cantidad || 1))}</span>
                                </li>
                              );
                            })}
                          </ul>
                          <div className="mt-3 flex items-center justify-between border-t pt-2">
                            <span className="font-semibold">Precio promocional</span>
                            <span className="font-bold text-emerald-700">{formatMoney(Number(promoSeleccionada.precio_promocional || 0))}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          {(() => {
                            const target = getPromoProduct(promoSeleccionada, catalogo);
                            const original = Number(target?.precio_venta || 0);
                            const porcentaje = Number(promoSeleccionada.descuento_porcentaje || 0);
                            const promocional = porcentaje > 0 ? original * (1 - porcentaje / 100) : original;
                            return (
                              <>
                                <p className="font-semibold text-gray-900">
                                  {target?.nombre || 'Producto objetivo'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Precio original {formatMoney(original)} - descuento {porcentaje}%
                                </p>
                                <div className="mt-2 flex items-center justify-between border-t pt-2">
                                  <span className="font-semibold">Precio con promo</span>
                                  <span className="font-bold text-emerald-700">{formatMoney(promocional)}</span>
                                </div>
                              </>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {carrito.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="rounded-xl border border-gray-200 p-3">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{item.nombre}</p>
                        <p className="text-xs text-gray-500">{item.categoria || 'Sin categoria'}</p>
                      </div>
                      <button type="button" onClick={() => removeFromCart(item.id)} className="text-xs font-semibold text-red-600">
                        Quitar
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max={item.stock_actual || 1}
                        value={item.cantidad}
                        onChange={(e) => updateQty(item.id, e.target.value)}
                        className="w-24 rounded-lg border border-gray-300 px-3 py-2"
                      />
                      <div className="text-sm text-gray-700">
                        <p>{formatMoney(item.precio_venta)} c/u</p>
                        <p className="font-semibold">{formatMoney(Number(item.precio_venta) * Number(item.cantidad))}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 rounded-xl bg-gray-50 p-4">
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm font-semibold text-gray-700">Subtotal</span>
                <span className="text-lg font-bold text-gray-900">{formatMoney(subtotalCarrito)}</span>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutOpen(true)}
                disabled={carrito.length === 0 && !promoSeleccionada}
                className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Confirmar pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900">Confirmar pedido</h3>
            <p className="mt-1 text-sm text-gray-600">
              Elige pago, tipo de entrega y valida el total antes de registrar la compra.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Metodo de pago</label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="qr">QR</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Entrega</label>
                <select
                  value={tipoEntrega}
                  onChange={(e) => setTipoEntrega(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="retiro">Retiro en tienda</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>
            </div>

            {tipoEntrega === 'delivery' && (
              <div className="mt-4">
                <label className="mb-1 block text-sm font-semibold text-gray-700">Direccion de entrega</label>
                <input
                  type="text"
                  value={direccionEntrega}
                  onChange={(e) => setDireccionEntrega(e.target.value)}
                  placeholder="Calle, zona, referencia"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
            )}

            <div className="mt-4">
              <label className="mb-1 block text-sm font-semibold text-gray-700">Cupon</label>
              <input
                type="text"
                value={codigoCupon}
                onChange={(e) => setCodigoCupon(e.target.value)}
                placeholder="Ingresa un codigo de cupon"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-500">
                {couponChecking
                  ? 'Validando cupon...'
                  : codigoCupon.trim()
                    ? (couponPreview?.valido ? couponPreview.mensaje || 'Cupon valido' : couponPreview?.mensaje || 'Cupon pendiente de validacion')
                    : 'Opcional'}
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotalCarrito)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery</span>
                  <span>{formatMoney(deliveryFee)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Promocion seleccionada</span>
                  <span>- {formatMoney(promoDiscount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cupon</span>
                  <span>- {formatMoney(couponDiscount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cliente frecuente</span>
                  <span>- {formatMoney(loyaltyDiscount)}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2 text-base font-bold text-gray-900">
                  <span>Total estimado</span>
                  <span>{formatMoney(totalCarrito)}</span>
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Descuento cliente frecuente automatico: {(loyaltyRate * 100).toFixed(0)}%.
              </p>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setCheckoutOpen(false)}
                className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={checkout}
                disabled={saving || (carrito.length === 0 && !promoSeleccionada)}
                className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {saving ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {authPromptOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900">Necesitas iniciar sesión</h3>
            <p className="mt-2 text-sm text-gray-600">
              Para confirmar un pedido debes iniciar sesión o crear una cuenta.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setAuthPromptOpen(false);
                  navigate('/login');
                }}
                className="flex-1 rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white"
              >
                Iniciar sesión
              </button>
              <Link
                to="/register"
                onClick={() => setAuthPromptOpen(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700"
              >
                Registrarse
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setAuthPromptOpen(false)}
              className="mt-3 w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700"
            >
              Seguir explorando
            </button>
          </div>
        </div>
      )}

      {selectedPedido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Factura de pedido</h3>
                <p className="text-sm text-gray-600">
                  {selectedPedido.cliente_nombre || 'Cliente'} - Pedido {String(selectedPedido.id).slice(0, 8)}
                </p>
              </div>
              <button onClick={() => setSelectedPedido(null)} className="rounded bg-gray-200 px-3 py-2 text-sm">
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-700">Resumen</p>
                <p className="text-sm text-gray-600">Fecha: {new Date(selectedPedido.created_at).toLocaleString('es-BO')}</p>
                <p className="text-sm text-gray-600">Estado: {selectedPedido.estado}</p>
                <p className="text-sm text-gray-600">Metodo: {selectedPedido.pago_metodo || selectedPedido.pago?.metodo_pago || 'pendiente'}</p>
                <p className="text-sm text-gray-600">
                  Entrega: {selectedPedido.tipo_entrega === 'delivery' ? 'Delivery' : 'Retiro en tienda'}
                </p>
                {selectedPedido.direccion_entrega && (
                  <p className="text-sm text-gray-600">Direccion: {selectedPedido.direccion_entrega}</p>
                )}
                <p className="mt-3 text-lg font-bold text-gray-900">Total: {formatMoney(selectedPedido.total)}</p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-700">Acciones</p>
                <button
                  type="button"
                  onClick={() => buildOrderPdf(selectedPedido)}
                  className="mb-3 w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
                >
                  Descargar PDF
                </button>
                <button
                  type="button"
                  onClick={() => setTab('pedidos')}
                  className="w-full rounded-lg bg-gray-900 px-4 py-2 font-semibold text-white"
                >
                  Ir a mis pedidos
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 p-4">
              <p className="mb-3 text-sm font-semibold text-gray-700">Detalle</p>
              <div className="space-y-2">
                {(selectedPedido.items || []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                    <span>{item.nombre_producto} x{item.cantidad}</span>
                    <span>{formatMoney(item.subtotal_linea)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {generado && !selectedPedido && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900">Pedido registrado</h3>
            <p className="mt-2 text-sm text-gray-600">
              La factura ya fue generada y el pedido quedo registrado en caja.
            </p>
            <div className="mt-4 rounded-xl border border-gray-200 p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800">{buildOrderReceiptText(generado)}</pre>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => buildOrderPdf(generado)}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
              >
                Descargar PDF
              </button>
              <button
                type="button"
                onClick={() => setGenerado(null)}
                className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
