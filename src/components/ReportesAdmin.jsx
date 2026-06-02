import { useEffect, useState } from 'react';
import { groomerAvailabilityServices, reportServices } from '../api/scheduleService';

const money = (value) => `Bs ${Number(value || 0).toFixed(2)}`;

export default function ReportesAdmin() {
  const [tab, setTab] = useState('insumos');
  const [groomers, setGroomers] = useState([]);
  const [groomerId, setGroomerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [auditoria, setAuditoria] = useState([]);
  const [productividad, setProductividad] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [consumo, setConsumo] = useState([]);
  const [beneficios, setBeneficios] = useState(null);

  useEffect(() => {
    groomerAvailabilityServices.getGroomers()
      .then((res) => setGroomers(Array.isArray(res.data) ? res.data : []))
      .catch(() => setGroomers([]));
  }, []);

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, groomerId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      if (tab === 'insumos') {
        const res = await reportServices.getAuditoriaInsumos();
        setAuditoria(Array.isArray(res.data) ? res.data : []);
      } else if (tab === 'productividad') {
        const res = await reportServices.getProductividadGroomer({ groomer_id: groomerId || undefined });
        setProductividad(res.data || null);
      } else if (tab === 'historial') {
        const res = await reportServices.getHistorialGroomer({ groomer_id: groomerId || undefined });
        setHistorial(Array.isArray(res.data) ? res.data : []);
      } else if (tab === 'consumo') {
        const res = await reportServices.getConsumoGroomer({ groomer_id: groomerId || undefined });
        setConsumo(Array.isArray(res.data) ? res.data : []);
      } else if (tab === 'beneficios') {
        const res = await reportServices.getBeneficiosCliente();
        setBeneficios(res.data || null);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 rounded-lg bg-white p-6 shadow">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reportes</h2>
          <p className="text-sm text-gray-500">Auditoria de insumos, productividad y beneficios.</p>
        </div>

        <select
          value={groomerId}
          onChange={(e) => setGroomerId(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Todos los groomers</option>
          {groomers.map((groomer) => (
            <option key={groomer.id} value={groomer.id}>
              {groomer.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ['insumos', 'Auditoria insumos'],
          ['productividad', 'Productividad'],
          ['historial', 'Historial'],
          ['consumo', 'Consumo'],
          ['beneficios', 'Beneficios cliente'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              tab === value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
      {loading && <div className="text-sm text-gray-500">Cargando reporte...</div>}

      {tab === 'insumos' && (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Insumo</th>
                <th className="px-4 py-3 text-left">Entregado</th>
                <th className="px-4 py-3 text-left">Usado</th>
                <th className="px-4 py-3 text-left">Devuelto</th>
                <th className="px-4 py-3 text-left">Merma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {auditoria.map((row) => (
                <tr key={row.insumo_id || row.insumo_nombre}>
                  <td className="px-4 py-3 font-medium text-gray-900">{row.insumo_nombre}</td>
                  <td className="px-4 py-3">{row.entregado}</td>
                  <td className="px-4 py-3">{row.usado}</td>
                  <td className="px-4 py-3">{row.devuelto}</td>
                  <td className="px-4 py-3">{row.merma}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'productividad' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Servicios realizados</p>
            <p className="text-2xl font-bold text-gray-900">{productividad?.servicios_realizados || 0}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Promedio minutos</p>
            <p className="text-2xl font-bold text-gray-900">{Number(productividad?.promedio_minutos || 0).toFixed(1)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Minutos totales</p>
            <p className="text-2xl font-bold text-gray-900">{Number(productividad?.minutos_totales || 0).toFixed(1)}</p>
          </div>
        </div>
      )}

      {tab === 'historial' && (
        <div className="space-y-3">
          {historial.map((row) => (
            <div key={row.id} className="rounded-xl border border-gray-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">{row.mascota_nombre} - {row.servicio_nombre}</p>
                  <p className="text-sm text-gray-500">{row.cliente_nombre} | {new Date(row.fecha_inicio).toLocaleString('es-BO')}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Finalizada
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{row.recomendaciones || 'Sin recomendaciones'}</p>
              <p className="mt-1 text-xs text-gray-500">{row.insumos_texto || 'Sin insumos registrados'}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'consumo' && (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Insumo</th>
                <th className="px-4 py-3 text-left">Entregado</th>
                <th className="px-4 py-3 text-left">Usado</th>
                <th className="px-4 py-3 text-left">Devuelto</th>
                <th className="px-4 py-3 text-left">Merma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {consumo.map((row) => (
                <tr key={row.insumo_id || row.insumo_nombre}>
                  <td className="px-4 py-3 font-medium text-gray-900">{row.insumo_nombre}</td>
                  <td className="px-4 py-3">{row.entregado}</td>
                  <td className="px-4 py-3">{row.usado}</td>
                  <td className="px-4 py-3">{row.devuelto}</td>
                  <td className="px-4 py-3">{row.merma}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'beneficios' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Pedidos</p>
            <p className="text-2xl font-bold text-gray-900">{beneficios?.total_pedidos || 0}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Gastado</p>
            <p className="text-2xl font-bold text-gray-900">{money(beneficios?.total_gastado)}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Descuentos</p>
            <p className="text-2xl font-bold text-gray-900">{money((Number(beneficios?.descuento_lealtad || 0) + Number(beneficios?.descuento_cupon || 0)))}</p>
          </div>
        </div>
      )}
    </div>
  );
}
