import { useState, useEffect } from 'react';
import { slotServices, scheduleServices, petServices, scheduleUtils } from '../api/scheduleService';

export default function CitasCliente() {
  const [tab, setTab] = useState('disponibles'); // 'disponibles' | 'mis-citas'
  const [mascotas, setMascotas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [citas, setCitas] = useState([]);
  const [características, setCaracterísticas] = useState([]);
  const [slotsDisponibles, setSlotsDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filtros para disponibles
  const [filtros, setFiltros] = useState({
    fecha: '',
    mascotaId: '',
    servicioId: '',
    duracionMinutos: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (tab === 'mis-citas') {
      loadMisCitas();
    }
  }, [tab]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [mascotasRes, serviciosRes, caracteristicasRes] = await Promise.all([
        petServices.getMascotasCliente(),
        scheduleServices.getServicios(),
        petServices.getCaracteristicas()
      ]);

      setMascotas(mascotasRes.data || []);
      setServicios(Array.isArray(serviciosRes.data) ? serviciosRes.data : []);
      
      // Manejar características que pueden venir de diferentes formas
      const caracteristicas = Array.isArray(caracteristicasRes.data) 
        ? caracteristicasRes.data 
        : (caracteristicasRes.data?.caracteristicas || []);
      setCaracterísticas(caracteristicas);
    } catch (err) {
      setError('Error al cargar datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMisCitas = async () => {
    try {
      setLoading(true);
      const res = await slotServices.getMisCitas();
      setCitas(Array.isArray(res.data) ? res.data : (res.data?.citas || []));
    } catch (err) {
      setError('Error al cargar citas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getAjustePorcentaje = (mascotaId) => {
    const mascota = mascotas.find(m => m.id === mascotaId);
    if (!mascota) return 0;
    
    const caracteristica = características.find(c => c.id === mascota.caracteristica_id);
    return caracteristica?.ajuste_porcentaje || 0;
  };

  const buscarSlotsDisponibles = async (e) => {
    e.preventDefault();

    if (!filtros.fecha || !filtros.mascotaId || !filtros.servicioId) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const servicio = servicios.find(s => s.id === filtros.servicioId);
      const ajuste = getAjustePorcentaje(filtros.mascotaId);

      // Calcular duración ajustada
      const duracionAjustada = scheduleUtils.calcularDuracionAjustada(
        servicio.duracion_minutos,
        ajuste
      );

      const params = {
        fecha: filtros.fecha,
        duracion_minutos: duracionAjustada,
      };

      const res = await slotServices.getSlotsDisponibles(params);
      const slots = Array.isArray(res.data) ? res.data : (res.data?.slots || []);
      setSlotsDisponibles(slots);

      if (slots.length === 0) {
        setError('No hay slots disponibles para la fecha seleccionada');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al buscar slots');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReservar = async (slot) => {
    const servicio = servicios.find(s => s.id === filtros.servicioId);
    const ajuste = getAjustePorcentaje(filtros.mascotaId);
    const duracionAjustada = scheduleUtils.calcularDuracionAjustada(
      servicio.duracion_minutos,
      ajuste
    );

    const fechaInicio = new Date(filtros.fecha + 'T' + slot.hora_inicio);
    const fechaFin = new Date(fechaInicio.getTime() + duracionAjustada * 60000);

    try {
      setLoading(true);
      const res = await slotServices.createCita({
        mascota_id: filtros.mascotaId,
        servicio_id: filtros.servicioId,
        groomer_id: slot.groomer_id,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString()
      });

      const citaCreada = res.data;
      setCitas([...citas, citaCreada]);
      setSlotsDisponibles([]);
      setFiltros({
        fecha: '',
        mascotaId: '',
        servicioId: '',
        duracionMinutos: ''
      });
      setError(null);
      alert('¡Cita reservada exitosamente!');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al reservar cita');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarCita = async (citaId) => {
    if (!window.confirm('¿Deseas cancelar esta cita?')) return;

    try {
      setLoading(true);
      await slotServices.cancelarCita(citaId, 'Cancelada por cliente');
      setCitas(citas.map(c => c.id === citaId ? { ...c, estado: 'cancelada' } : c));
      alert('Cita cancelada exitosamente');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cancelar cita');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setTab('disponibles')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            tab === 'disponibles'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Reservar Cita
        </button>
        <button
          onClick={() => setTab('mis-citas')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            tab === 'mis-citas'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Mis Citas
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {tab === 'disponibles' ? (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Reservar Cita</h2>

          <form onSubmit={buscarSlotsDisponibles} className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Mascota */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mascota *
                </label>
                <select
                  name="mascotaId"
                  value={filtros.mascotaId}
                  onChange={handleFiltroChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar mascota...</option>
                  {mascotas.map(mascota => (
                    <option key={mascota.id} value={mascota.id}>
                      {mascota.nombre} ({mascota.tamaño})
                    </option>
                  ))}
                </select>
              </div>

              {/* Servicio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Servicio *
                </label>
                <select
                  name="servicioId"
                  value={filtros.servicioId}
                  onChange={handleFiltroChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar servicio...</option>
                  {servicios.map(servicio => (
                    <option key={servicio.id} value={servicio.id}>
                      {servicio.nombre} - {scheduleUtils.formatearDuracion(servicio.duracion_minutos)} - ${servicio.precio}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={filtros.fecha}
                  onChange={handleFiltroChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
            >
              {loading ? 'Buscando...' : 'Buscar Horarios'}
            </button>
          </form>

          {/* Slots Disponibles */}
          {slotsDisponibles.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Horarios Disponibles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slotsDisponibles.map((slot, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg p-4 hover:shadow-lg transition"
                  >
                    <p className="text-lg font-bold text-gray-900 mb-2">
                      {slot.hora_inicio}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      {new Date(filtros.fecha).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <button
                      onClick={() => handleReservar(slot)}
                      disabled={loading}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:bg-green-400"
                    >
                      Reservar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Mis Citas</h2>

          {loading ? (
            <div className="text-center py-8">Cargando citas...</div>
          ) : citas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No tienes citas reservadas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {citas.map(cita => {
                const mascotaNombre = cita.mascota_nombre || cita.mascota?.nombre || 'Mascota';
                const servicioNombre = cita.servicio_nombre || cita.servicio?.nombre || 'Servicio';
                const estado = cita.estado || 'pendiente';
                
                return (
                  <div
                    key={cita.id}
                    className="border rounded-lg p-4 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {mascotaNombre}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {servicioNombre}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          📅 {new Date(cita.fecha_inicio).toLocaleDateString('es-ES')}
                        </p>
                        <p className="text-sm text-gray-600">
                          🕐 {new Date(cita.fecha_inicio).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          estado === 'confirmada'
                            ? 'bg-green-100 text-green-800'
                            : estado === 'cancelada'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {estado}
                      </span>
                    </div>

                    {estado === 'confirmada' && (
                      <button
                        onClick={() => handleCancelarCita(cita.id)}
                        disabled={loading}
                        className="mt-4 w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition disabled:bg-red-400"
                      >
                        Cancelar Cita
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
