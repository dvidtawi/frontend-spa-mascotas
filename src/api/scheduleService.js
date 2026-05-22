import api from './axios';

const transformServicio = (servicio) => ({
  ...servicio,
  duracion_minutos: servicio.duracion_base || servicio.duracion_minutos,
  activo: servicio.estado_activo !== undefined ? servicio.estado_activo : servicio.activo,
  precio: typeof servicio.precio === 'string' ? parseFloat(servicio.precio) : servicio.precio,
});

const transformMascota = (mascota) => ({
  ...mascota,
  tamano: mascota.tamano || mascota['tamaño'] || '',
  minutos_adicionales_temperamento:
    Number(mascota.minutos_adicionales_temperamento) || 0,
});

const buildPetFormData = (data) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (key === 'carnet') {
      formData.append('carnet', value);
      return;
    }
    formData.append(key, value);
  });

  return formData;
};

const transformCita = (cita) => ({
  ...cita,
  mascota_nombre: cita.mascota_nombre || cita.mascota?.nombre || '',
  servicio_nombre: cita.servicio_nombre || cita.servicio?.nombre || '',
  estado: cita.estado || 'en_revision',
});

export const scheduleServices = {
  getServicios: async (options = {}) => {
    const params = {};
    if (options.includeInactive) {
      params.include_inactive = true;
    }

    const res = await api.get('/schedule/servicios', { params });
    const serviciosData = res.data.data || res.data;
    return {
      ...res,
      data: Array.isArray(serviciosData)
        ? serviciosData.map(transformServicio)
        : serviciosData,
    };
  },

  createServicio: async (data) => {
    const res = await api.post('/schedule/servicios', data);
    const servicioData = res.data.data || res.data;
    return {
      ...res,
      data: transformServicio(servicioData),
    };
  },

  updateServicio: async (id, data) => {
    const res = await api.put(`/schedule/servicios/${id}`, data);
    const servicioData = res.data.data || res.data;
    return {
      ...res,
      data: transformServicio(servicioData),
    };
  },

  deleteServicio: (id) => api.delete(`/schedule/servicios/${id}`),
};

export const petServices = {
  getMascotasCliente: async () => {
    const res = await api.get('/schedule/mascotas');
    const mascotasData = res.data.data || res.data;
    return {
      ...res,
      data: Array.isArray(mascotasData)
        ? mascotasData.map(transformMascota)
        : mascotasData,
    };
  },

  createMascota: async (data) => {
    const res = await api.post('/schedule/mascotas', buildPetFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const mascotaData = res.data.data || res.data;
    return {
      ...res,
      data: transformMascota(mascotaData),
    };
  },

  updateMascota: async (id, data) => {
    const res = await api.put(`/schedule/mascotas/${id}`, buildPetFormData(data), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const mascotaData = res.data.data || res.data;
    return {
      ...res,
      data: transformMascota(mascotaData),
    };
  },

  deleteMascota: (id) => api.delete(`/schedule/mascotas/${id}`),

  getCaracteristicas: async () => {
    const res = await api.get('/schedule/caracteristicas-mascotas');
    return {
      ...res,
      data: res.data.data || res.data,
    };
  },

  getMascotasByCliente: async (clienteId) => {
    const res = await api.get(`/schedule/clientes/${clienteId}/mascotas`);
    const mascotasData = res.data.data || res.data;
    return {
      ...res,
      data: Array.isArray(mascotasData)
        ? mascotasData.map(transformMascota)
        : mascotasData,
    };
  },
};

export const spaAvailabilityServices = {
  getDisponibilidad: async (fechaBase) => {
    const res = await api.get('/schedule/disponibilidad-spa', {
      params: fechaBase ? { fecha_base: fechaBase } : {},
    });
    return { ...res, data: res.data.data || res.data };
  },

  createHorario: async (data) => {
    const res = await api.post('/schedule/disponibilidad-spa', data);
    return { ...res, data: res.data.data || res.data };
  },

  updateHorario: async (id, data) => {
    const res = await api.put(`/schedule/disponibilidad-spa/${id}`, data);
    return { ...res, data: res.data.data || res.data };
  },

  deleteHorario: async (id) => {
    const res = await api.delete(`/schedule/disponibilidad-spa/${id}`);
    return { ...res, data: res.data };
  },
};

export const groomerAvailabilityServices = {
  getDisponibilidadGroomer: async (groomerId) => {
    const res = await api.get(`/schedule/disponibilidad-groomer/${groomerId}`);
    return { ...res, data: res.data.data || res.data };
  },

  createHorarioGroomer: (data) => api.post('/schedule/disponibilidad-groomer', data),
  updateHorarioGroomer: (id, data) => api.put(`/schedule/disponibilidad-groomer/${id}`, data),
  deleteHorarioGroomer: (id) => api.delete(`/schedule/disponibilidad-groomer/${id}`),

  getGroomers: async () => {
    const res = await api.get('/schedule/groomers');
    return { ...res, data: res.data.data || res.data };
  },

  getClientes: async () => {
    const res = await api.get('/schedule/clientes');
    return { ...res, data: res.data.data || res.data };
  },
};

export const blockServices = {
  createBloqueo: (data) => api.post('/schedule/bloqueos', data),

  getBloqueos: async (groomerId) => {
    const res = await api.get(`/schedule/bloqueos/${groomerId}`, {
      params: { include_inactive: true },
    });
    return { ...res, data: res.data.data || res.data };
  },

  getAllBloqueos: async (scope) => {
    const res = await api.get('/schedule/bloqueos', {
      params: { ...(scope ? { scope } : {}), include_inactive: true },
    });
    return { ...res, data: res.data.data || res.data };
  },

  updateBloqueo: (id, data) => api.put(`/schedule/bloqueos/${id}`, data),
  deleteBloqueo: (id) => api.delete(`/schedule/bloqueos/${id}`),
};

export const slotServices = {
  getMisCitas: async () => {
    const res = await api.get('/schedule/mis-citas');
    const citasData = res.data.data || res.data;
    return {
      ...res,
      data: Array.isArray(citasData) ? citasData.map(transformCita) : citasData,
    };
  },

  getSlotsDisponibles: async (params) => {
    const res = await api.get('/schedule/slots-disponibles', { params });
    const slotsData = res.data.data || res.data;
    return {
      ...res,
      data: Array.isArray(slotsData)
        ? slotsData
        : slotsData?.disponibles || [],
    };
  },

  createCita: async (data) => {
    const res = await api.post('/schedule/citas', data);
    const citaData = res.data.data || res.data;
    return {
      ...res,
      data: transformCita(citaData),
    };
  },

  createCitaAdmin: async (data) => {
    const res = await api.post('/schedule/citas/admin', data);
    const citaData = res.data.data || res.data;
    return {
      ...res,
      data: transformCita(citaData),
    };
  },

  getCita: async (citaId) => {
    const res = await api.get(`/schedule/citas/${citaId}`);
    const citaData = res.data.data || res.data;
    return {
      ...res,
      data: transformCita(citaData),
    };
  },

  cancelarCita: (citaId, motivo) =>
    api.put(`/schedule/citas/${citaId}/cancelar`, { razon: motivo }),

  getCitas: async (params) => {
    const finalParams = { ...(params || {}) };
    if (finalParams.estado === 'en_revision' && finalParams.include_diagnostico === undefined) {
      finalParams.include_diagnostico = true;
    }

    const res = await api.get('/schedule/citas', { params: finalParams });
    const citasData = res.data.data || res.data;
    return {
      ...res,
      data: Array.isArray(citasData) ? citasData.map(transformCita) : citasData,
    };
  },

  updateCita: async (id, data) => {
    const res = await api.put(`/schedule/citas/${id}`, data);
    const citaData = res.data.data || res.data;
    return {
      ...res,
      data: transformCita(citaData),
    };
  },

  aprobarCita: async (id, data = {}) => {
    const res = await api.put(`/schedule/citas/${id}/aprobar`, data);
    const citaData = res.data.data || res.data;
    return { ...res, data: transformCita(citaData) };
  },

  rechazarCita: async (id, data = {}) => {
    const res = await api.put(`/schedule/citas/${id}/rechazar`, data);
    const citaData = res.data.data || res.data;
    return { ...res, data: transformCita(citaData) };
  },

  getAgenda: async (params) => {
    const res = await api.get('/schedule/agenda', { params });
    return { ...res, data: res.data.data || res.data };
  },
};

export const paymentServices = {
  registrarPago: async (data) => {
    const res = await api.post('/schedule/pagos', data);
    return { ...res, data: res.data.data || res.data };
  },

  getPagos: async (params) => {
    const res = await api.get('/schedule/pagos', { params });
    return { ...res, data: res.data.data || res.data };
  },

  getCierreCaja: async (fecha) => {
    const res = await api.get('/schedule/cierre-caja', { params: { fecha } });
    return { ...res, data: res.data.data || res.data };
  },
};

export const groomingServices = {
  getAgendaHoy: async (fecha) => {
    const res = await api.get('/schedule/groomer/agenda', { params: fecha ? { fecha } : {} });
    return { ...res, data: res.data.data || res.data };
  },

  getFicha: async (citaId) => {
    const res = await api.get(`/schedule/groomer/citas/${citaId}/ficha`);
    return { ...res, data: res.data.data || res.data };
  },

  guardarFicha: async (citaId, data) => {
    const res = await api.put(`/schedule/groomer/citas/${citaId}/ficha`, data);
    return { ...res, data: res.data.data || res.data };
  },

  subirFoto: async (citaId, tipo, file) => {
    const formData = new FormData();
    formData.append('foto', file);
    const res = await api.post(`/schedule/groomer/citas/${citaId}/fotos/${tipo}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { ...res, data: res.data.data || res.data };
  },

  iniciarServicio: async (citaId) => {
    const res = await api.put(`/schedule/groomer/citas/${citaId}/iniciar`);
    return { ...res, data: res.data.data || res.data };
  },

  finalizarServicio: async (citaId, data = {}) => {
    const res = await api.put(`/schedule/groomer/citas/${citaId}/finalizar`, data);
    return { ...res, data: res.data.data || res.data };
  },
};

export const scheduleUtils = {
  calcularDuracionAjustada: (duracionBase, porcentajeAjuste = 0, minutosExtra = 0) =>
    Math.ceil(duracionBase + (duracionBase * porcentajeAjuste / 100)) + minutosExtra,

  formatearDuracion: (minutos) => {
    if (!minutos) return '0 min';
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;

    if (horas === 0) return `${mins} min`;
    if (mins === 0) return `${horas}h`;
    return `${horas}h ${mins}min`;
  },

  getDiasSemanaNombres: () => [
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Sabado',
    'Domingo',
  ],

  calcularEdad: (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const diferenciaMes = hoy.getMonth() - nacimiento.getMonth();

    if (
      diferenciaMes < 0 ||
      (diferenciaMes === 0 && hoy.getDate() < nacimiento.getDate())
    ) {
      edad -= 1;
    }

    return edad >= 0 ? edad : null;
  },
};
