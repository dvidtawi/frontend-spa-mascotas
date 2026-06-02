import { useEffect, useState } from 'react';
import { inventoryServices } from '../api/scheduleService';
import placeholderProduct from '../assets/product-placeholder.svg';

const EMPTY_FORM = {
  nombre: '',
  descripcion: '',
  tipo: 'insumo_tecnico',
  categoria: 'higiene',
  variante: '',
  marca: '',
  presentacion: '',
  stock_actual: 0,
  stock_minimo: 5,
  precio_venta: 0,
};

export default function InventarioAdmin() {
  const [items, setItems] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [imagenActual, setImagenActual] = useState('');
  const [previewImagen, setPreviewImagen] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsRes, alertasRes] = await Promise.all([
        inventoryServices.getInventario({ include_inactive: true }),
        inventoryServices.getAlertas(),
      ]);
      setItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);
      setAlertas(Array.isArray(alertasRes.data) ? alertasRes.data : []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setArchivoImagen(null);
    setImagenActual('');
    setPreviewImagen('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      let rutaImagen = imagenActual || '';
      if (archivoImagen) {
        const subida = await inventoryServices.uploadInventarioImagen(archivoImagen);
        rutaImagen = subida.data.ruta_imagen_local;
      }

      const payload = {
        ...form,
        ruta_imagen_local: rutaImagen,
      };

      if (editingId) {
        await inventoryServices.updateInventario(editingId, payload);
      } else {
        await inventoryServices.createInventario(payload);
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar el insumo');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      nombre: item.nombre || '',
      descripcion: item.descripcion || '',
      tipo: item.tipo || 'insumo_tecnico',
      categoria: item.categoria || 'higiene',
      variante: item.variante || '',
      marca: item.marca || '',
      presentacion: item.presentacion || '',
      stock_actual: item.stock_actual ?? 0,
      stock_minimo: item.stock_minimo ?? 5,
      precio_venta: item.precio_venta ?? 0,
    });
    setImagenActual(item.ruta_imagen_local || '');
    setPreviewImagen(item.ruta_imagen_local ? `http://localhost:3000${item.ruta_imagen_local}` : '');
    setArchivoImagen(null);
  };

  const handleFileChange = async (file) => {
    setArchivoImagen(file || null);
    if (!file) {
      setPreviewImagen(imagenActual ? `http://localhost:3000${imagenActual}` : '');
      return;
    }

    setPreviewImagen(URL.createObjectURL(file));
  };

  const getItemImage = (item) => (item.ruta_imagen_local ? `http://localhost:3000${item.ruta_imagen_local}` : placeholderProduct);

  const toggleActivo = async (item) => {
    try {
      setSaving(true);
      await inventoryServices.toggleInventario(item.id, !item.estado_activo);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cambiar el estado del insumo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Inventario</h2>
        <p className="text-sm text-gray-500">Control interno de insumos y productos.</p>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSave} className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Editar insumo' : 'Nuevo insumo'}</h3>
            {editingId && (
              <button type="button" onClick={resetForm} className="rounded bg-gray-200 px-3 py-2 text-sm text-gray-700">
                Cancelar edición
              </button>
            )}
          </div>

          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
            Completa el stock actual disponible, el stock minimo para alertas y el precio de venta solo si el item se vende en tienda.
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-1">
              <label className="mb-1 block text-sm font-semibold text-gray-700">Nombre del item</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                placeholder="Shampoo neutro"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div className="md:col-span-1">
              <label className="mb-1 block text-sm font-semibold text-gray-700">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm((prev) => ({ ...prev, tipo: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="insumo_tecnico">Insumo tecnico</option>
                <option value="producto_tienda">Producto tienda</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">Descripcion</label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripcion del producto o insumo"
                rows="3"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Categoria</label>
              <select
                value={form.categoria}
                onChange={(e) => setForm((prev) => ({ ...prev, categoria: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="higiene">Higiene</option>
                <option value="accesorios">Accesorios</option>
                <option value="alimentos">Alimentos</option>
                <option value="juguetes">Juguetes</option>
                <option value="salud">Salud</option>
                <option value="otros">Otros</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Variante</label>
              <input
                type="text"
                value={form.variante}
                onChange={(e) => setForm((prev) => ({ ...prev, variante: e.target.value }))}
                placeholder="Ej: 500 ml, talla M, sabor pollo"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-500">Tamaño, peso, presentación o marca comercial.</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Marca</label>
              <input
                type="text"
                value={form.marca}
                onChange={(e) => setForm((prev) => ({ ...prev, marca: e.target.value }))}
                placeholder="Marca del producto"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Presentacion</label>
              <input
                type="text"
                value={form.presentacion}
                onChange={(e) => setForm((prev) => ({ ...prev, presentacion: e.target.value }))}
                placeholder="Ej: bolsa 2kg, frasco 500 ml"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Stock actual</label>
              <input
                type="number"
                min="0"
                value={form.stock_actual}
                onChange={(e) => setForm((prev) => ({ ...prev, stock_actual: Number(e.target.value) }))}
                placeholder="Cantidad disponible"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-500">Cantidad real disponible en almacén o tienda.</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Stock minimo</label>
              <input
                type="number"
                min="0"
                value={form.stock_minimo}
                onChange={(e) => setForm((prev) => ({ ...prev, stock_minimo: Number(e.target.value) }))}
                placeholder="Umbral de alerta"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-500">Cuando el stock baje de este valor aparecerá en alertas.</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Precio de venta</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.precio_venta}
                onChange={(e) => setForm((prev) => ({ ...prev, precio_venta: Number(e.target.value) }))}
                placeholder="Precio unitario"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-500">Se usa tanto para tienda como para items que también puedes vender al cliente.</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Imagen del item</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-500">
                Opcional. Si subes una imagen, se guardara en el servidor local y se mostrara en el catalogo.
              </p>
            </div>
          </div>

          {previewImagen && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-gray-700">Vista previa</p>
              <img src={previewImagen} alt="Vista previa" className="h-40 w-full rounded-lg object-cover" />
            </div>
          )}

          <div className="mt-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
            >
              {editingId ? 'Guardar cambios' : 'Crear insumo'}
            </button>
          </div>
        </form>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Alertas de stock</h3>
          {alertas.length === 0 ? (
            <p className="text-sm text-gray-500">No hay alertas de stock bajo.</p>
          ) : (
            <div className="space-y-2">
              {alertas.map((item) => (
                <div key={item.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <p className="font-semibold">{item.nombre}</p>
                  <p>Stock actual: {item.stock_actual} | Minimo: {item.stock_minimo}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Catalogo de inventario</h3>
        {loading ? (
          <p className="py-6 text-center text-gray-500">Cargando inventario...</p>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-gray-500">No hay insumos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-3 pr-4">Imagen</th>
                  <th className="py-3 pr-4">Nombre</th>
                  <th className="py-3 pr-4">Tipo</th>
                  <th className="py-3 pr-4">Categoria</th>
                  <th className="py-3 pr-4">Variante</th>
                  <th className="py-3 pr-4">Stock</th>
                  <th className="py-3 pr-4">Minimo</th>
                  <th className="py-3 pr-4">Precio</th>
                  <th className="py-3 pr-4">Estado</th>
                  <th className="py-3 pr-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3 pr-4">
                      <img
                        src={getItemImage(item)}
                        alt={item.nombre}
                        className="h-14 w-14 rounded-lg border border-gray-200 object-cover"
                      />
                    </td>
                    <td className="py-3 pr-4 font-semibold text-gray-900">{item.nombre}</td>
                    <td className="py-3 pr-4">{item.tipo}</td>
                    <td className="py-3 pr-4">{item.categoria || '-'}</td>
                    <td className="py-3 pr-4">{item.variante || '-'}</td>
                    <td className="py-3 pr-4">{item.stock_actual}</td>
                    <td className="py-3 pr-4">{item.stock_minimo}</td>
                    <td className="py-3 pr-4">{Number(item.precio_venta || 0).toFixed(2)}</td>
                    <td className="py-3 pr-4">{item.estado_activo ? 'Activo' : 'Inactivo'}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="rounded bg-amber-500 px-3 py-1 text-white"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleActivo(item)}
                          className={`rounded px-3 py-1 text-white ${item.estado_activo ? 'bg-red-500' : 'bg-green-600'}`}
                        >
                          {item.estado_activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
