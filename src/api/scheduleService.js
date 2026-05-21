import api from './axios';

// ============ TRANSFORMADORES DE DATOS ============
const transformServicio = (servicio) => ({
  ...servicio,
  duracion_minutos: servicio.duracion_base || servicio.duracion_minutos,
  activo: servicio.estado_activo !== undefined ? servicio.estado_activo : servicio.activo,
  precio: typeof servicio.precio === 'string' ? parseFloat(servicio.precio) : servicio.precio
});

const transformMascota = (mascota) => ({
  ...mascota,
  ajuste_porcentaje: mascota.ajuste_porcentaje || 0
});

const transformCita = (cita) => ({
  ...cita,
  mascota_nombre: cita.mascota_nombre || cita.mascota?.nombre || '',
  servicio_nombre: cita.servicio_nombre || cita.servicio?.nombre || '',
  estado: cita.estado || 'pendiente'
});

// ============ SERVICIOS ============
export const scheduleServices = {
  // Obtener todos los servicios
  getServicios: async () => {
    const res = await api.get('/schedule/servicios');
    const serviciosData = res.data.data || res.data;
    return {
      ...res,
      data: Array.isArray(serviciosData) ? serviciosData.map(transformServicio) : serviciosData
    };
  },
  
  // Crear servicio (admin, recepcion)
  createServicio: async (data) => {
    const res = await api.post('/schedule/servicios', data);
    const servicioData = res.data.data || res.data;
    return {
      ...res,
      data: transformServicio(servicioData)
    };
  },
  
  // Actualizar servicio (admin)
  updateServicio: async (id, data) => {
    const res = await api.put(`/schedule/servicios/${id}`, data);
    const servicioData = res.data.data || res.data;
    return {
      ...res,
      data: transformServicio(servicioData)
    };
  },
  
  // Eliminar servicio (admin)
  deleteServicio: (id) => api.delete(`/schedule/servicios/${id}`),
};

// ============ MASCOTAS ============
export const petServices = {
  // Obtener mascotas del cliente actual
  getMascotasCliente: async () => {
    const res = await api.get('/schedule/mascotas');
    const mascotasData = res.data.data || res.data;
    return {
      ...res,
      data: Array.isArray(mascotasData) ? mascotasData.map(transformMascota) : mascotasData
    };
  },
  
  // Crear mascota (cliente)
  createMascota: async (data) => {
    const res = await api.post('/schedule/mascotas', data);
    const mascotaData = res.data.data || res.data;
    return {
      ...res,
      data: transformMascota(mascotaData)
    };
  },
  
  // Actualizar mascota (cliente)
  updateMascota: async (id, data) => {
    const res = await api.put(`/schedule/mascotas/${id}`, data);
    const mascotaData = res.data.data || res.data;
    return {
      ...res,
      data: transformMascota(mascotaData)
    };
  },
  
  // Eliminar mascota (cliente)
  deleteMascota: (id) => api.delete(`/schedule/mascotas/${id}`),
  
  // Obtener características de mascotas
  getCaracteristicas: async () => {
    const res = await api.get('/schedule/caracteristicas-mascotas');
    const caracteristicasData = res.data.data || res.data?.caracteristicas || res.data;
    return {
      ...res,
      data: caracteristicasData
    };
  },
};

// ============ DISPONIBILIDAD SPA ============
export const spaAvailabilityServices = {
  // Obtener disponibilidad del spa
  getDisponibilidad: async () => {
    const res = await api.get('/schedule/disponibilidad-spa');
    const disponibilidadData = res.data.data || res.data;
    return {
      ...res,
      data: disponibilidadData
    };
  },
  
  // Crear horario (admin)
  createHorario: async (data) => {
    const res = await api.post('/schedule/disponibilidad-spa', data);
    const horarioData = res.data.data || res.data;
    return {
      ...res,
      data: horarioData
    };
  },
  
  // Actualizar horario (admin)
  updateHorario: async (id, data) => {
    const res = await api.put(`/schedule/disponibilidad-spa/${id}`, data);
    const horarioData = res.data.data || res.data;
    return {
      ...res,
      data: horarioData
    };
  },
  
  // Eliminar horario (admin)
  deleteHorario: async (id) => {
    const res = await api.delete(`/schedule/disponibilidad-spa/${id}`);
    return {
      ...res,
      data: res.data
    };
  },
};

// ============ DISPONIBILIDAD GROOMER ============
export const groomerAvailabilityServices = {
  // Obtener disponibilidad de un groomer específico
  getDisponibilidadGroomer: async (groomerId) => {
    const res = await api.get(`/schedule/disponibilidad-groomer/${groomerId}`);
    const disponibilidadData = res.data.data || res.data;
    return {
      ...res,
      data: disponibilidadData
    };
  },
  
  // Crear horario de groomer (admin)
  createHorarioGroomer: (data) => api.post('/schedule/disponibilidad-groomer', data),
  
  // Actualizar horario de groomer (admin)
  updateHorarioGroomer: (id, data) => api.put(`/schedule/disponibilidad-groomer/${id}`, data),
  
  // Eliminar horario de groomer (admin)
  deleteHorarioGroomer: (id) => api.delete(`/schedule/disponibilidad-groomer/${id}`),
  
  // Obtener todos los groomers
  getGroomers: async () => {
    const res = await api.get('/schedule/groomers');
    const groomersData = res.data.data || res.data;
    return {
      ...res,
      data: Array.isArray(groomersData) ? groomersData : groomersData
    };
  },
};

// ============ BLOQUEOS ============
export const blockServices = {
  // Crear bloqueo (admin, recepcion)
  createBloqueo: (data) => api.post('/schedule/bloqueos', data),
  
  // Obtener bloqueos de un groomer
  getBloqueos: async (groomerId) => {
    const res = await api.get(`/schedule/bloqueos/${groomerId}`);
    const bloqueosData = res.data.data || res.data;
    return {
      ...res,
      data: Array.isArray(bloqueosData) ? bloqueosData : bloqueosData
    };
  },
  
  // Actualizar bloqueo (admin, recepcion)
  updateBloqueo: (id, data) => api.put(`/schedule/bloqueos/${id}`, data),
  
  // Eliminar bloqueo (admin, recepcion)
  deleteBloqueo: (id) => api.delete(`/schedule/bloqueos/${id}`),
};

// ============ CITAS (SLOTS) ============
export const slotServices = {
  // Obtener mis citas (cliente)
  getMisCitas: async () => {
    const res = await api.get('/schedule/mis-citas');
    const citasData = res.data.data || res.data;
    return {
      ...res,
      data: Array.isArray(citasData) ? citasData.map(transformCita) : citasData
    };
  },
  
  // Obtener slots disponibles
  getSlotsDisponibles: async (params) => {
    const res = await api.get('/schedule/slots-disponibles', { params });
    const slotsData = res.data.data || res.data;
    
    // El backend retorna { disponibles: [], total_slots: n }
    const slots = Array.isArray(slotsData) ? slotsData : (slotsData?.disponibles || []);
    
    return {
      ...res,
      data: slots
    };
  },
  
  // Crear cita (cliente)
  createCita: async (data) => {
    const res = await api.post('/schedule/citas', data);
    const citaData = res.data.data || res.data;
    return {
      ...res,
      data: transformCita(citaData)
    };
  },
  
  // Obtener detalles de una cita
  getCita: async (citaId) => {
    const res = await api.get(`/schedule/citas/${citaId}`);
    const citaData = res.data.data || res.data;
    return {
      ...res,
      data: transformCita(citaData)
    };
  },
  
  // Cancelar cita (cliente)
  cancelarCita: (citaId, motivo) => 
    api.put(`/schedule/citas/${citaId}/cancelar`, { motivo }),
  
  // Obtener todas las citas (admin, recepcion)
  getCitas: async (params) => {
    const res = await api.get('/schedule/citas', { params });
    const citasData = res.data.data || res.data;
    return {
      ...res,
      data: Array.isArray(citasData) ? citasData.map(transformCita) : citasData
    };
  },
  
  // Actualizar cita (admin, recepcion)
  updateCita: async (id, data) => {
    const res = await api.put(`/schedule/citas/${id}`, data);
    const citaData = res.data.data || res.data;
    return {
      ...res,
      data: transformCita(citaData)
    };
  },
  
  // Eliminar cita (admin, recepcion)
  deleteCita: (id) => api.delete(`/schedule/citas/${id}`),
};

// ============ UTILIDADES ============
export const scheduleUtils = {
  // Calcular duración ajustada
  calcularDuracionAjustada: (duracionBase, ajuste) => {
    return Math.ceil(duracionBase + (duracionBase * ajuste / 100));
  },
  
  // Formatear duración en horas y minutos
  formatearDuracion: (minutos) => {
    if (!minutos) return '0 min';
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    
    if (horas === 0) return `${mins} min`;
    if (mins === 0) return `${horas}h`;
    return `${horas}h ${mins}min`;
  },
  
  // Convertir minutos a formato HH:MM
  minutosAHora: (minutos) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  },
  
  // Obtener días de la semana
  getDiasSemanaNombres: () => [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo'
  ],
};

