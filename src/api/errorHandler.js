/**
 * Manejo centralizado de errores de API
 */

export const getErrorMessage = (error) => {
  console.error('Error completo:', error);
  
  // Si es un error de red
  if (!error.response) {
    console.error('Error de red - sin respuesta del servidor');
    return 'Error de conexión. Verifica que el servidor esté funcionando.';
  }

  const status = error.response.status;
  const data = error.response.data;

  console.error(`Status: ${status}`, 'Data:', data);

  // Error 401 - No autorizado
  if (status === 401) {
    return 'Tu sesión expiró. Por favor inicia sesión nuevamente.';
  }

  // Error 403 - Prohibido
  if (status === 403) {
    return 'No tienes permiso para realizar esta acción.';
  }

  // Error 404 - No encontrado
  if (status === 404) {
    return 'El recurso no fue encontrado.';
  }

  // Error de validación o conflicto
  if (status === 400 || status === 409) {
    // Intentar obtener el mensaje del servidor
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (data?.msg) return data.msg;
    if (typeof data === 'string') return data;
    return 'Datos inválidos. Por favor verifica tu entrada.';
  }

  // Error del servidor
  if (status >= 500) {
    return 'Error del servidor. Por favor intenta más tarde.';
  }

  // Error genérico
  if (data?.error) return data.error;
  if (data?.message) return data.message;
  if (data?.msg) return data.msg;

  return 'Ocurrió un error inesperado. Por favor intenta de nuevo.';
};
