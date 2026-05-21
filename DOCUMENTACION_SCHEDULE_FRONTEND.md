# 📱 Módulo de Organización de Agenda y Slots - Pet Spa Frontend

## ✨ Implementación Completada

Se ha implementado exitosamente el módulo 2 de organización de agenda y slots en el frontend con todas las funcionalidades del backend.

---

## 🏗️ Estructura Implementada

### 1. **Servicios de API (src/api/scheduleService.js)**

Archivo centralizado con todas las funciones para comunicarse con el backend:

```javascript
// Servicios
scheduleServices.getServicios()
scheduleServices.createServicio(data)
scheduleServices.updateServicio(id, data)

// Mascotas
petServices.getMascotasCliente()
petServices.createMascota(data)
petServices.updateMascota(id, data)
petServices.deleteMascota(id)
petServices.getCaracteristicas()

// Disponibilidad Spa
spaAvailabilityServices.getDisponibilidad()
spaAvailabilityServices.createHorario(data)

// Disponibilidad Groomer
groomerAvailabilityServices.getDisponibilidadGroomer(groomerId)
groomerAvailabilityServices.createHorarioGroomer(data)

// Bloqueos
blockServices.createBloqueo(data)
blockServices.getBloqueos(groomerId)

// Citas
slotServices.getMisCitas()
slotServices.getSlotsDisponibles(params)
slotServices.createCita(data)
slotServices.cancelarCita(citaId, motivo)
slotServices.getCitas(params)
```

### 2. **Componentes React**

#### `PetManager.jsx` (src/components/PetManager.jsx)
Gestiona las mascotas del cliente:
- ✅ Listar mascotas
- ✅ Crear mascota
- ✅ Editar mascota
- ✅ Eliminar mascota
- Muestra información: nombre, especie, raza, tamaño, característica

**Props:** Ninguno (usa contexto de autenticación)

**Estado:**
- `mascotas`: Array de mascotas
- `características`: Array de características disponibles
- `loading`: Boolean
- `showModal`: Boolean para mostrar/ocultar modal

---

#### `ModalPetForm.jsx` (src/components/ModalPetForm.jsx)
Modal para crear/editar mascotas:
- ✅ Validación de formulario
- ✅ Campos: nombre, especie, raza, tamaño, característica, edad, peso, observaciones
- Manejo de errores por campo

**Props:**
- `isOpen`: Boolean
- `onClose`: Function
- `onSave`: Function
- `pet`: Object | null
- `características`: Array

---

#### `CitasCliente.jsx` (src/components/CitasCliente.jsx)
Componente principal del cliente para reservar y gestionar citas:

**Tabs:**
1. **Reservar Cita**
   - Seleccionar mascota
   - Seleccionar servicio
   - Seleccionar fecha
   - Ver slots disponibles
   - Calcular duración ajustada automáticamente
   - Reservar slot

2. **Mis Citas**
   - Ver todas las citas del cliente
   - Estados: confirmada, pendiente, cancelada
   - Cancelar cita (si está confirmada)

**Lógica:**
```javascript
// Cálculo de duración ajustada
duracionAjustada = scheduleUtils.calcularDuracionAjustada(
  servicio.duracion_minutos,
  mascota.ajuste_porcentaje
)
```

---

#### `ServiciosAdmin.jsx` (src/components/ServiciosAdmin.jsx)
Gestión de servicios para admin/recepción:
- ✅ Listar servicios
- ✅ Crear servicio
- ✅ Editar servicio
- ✅ Eliminar servicio
- Tabla con: nombre, duración, precio, estado

**Acciones:**
- Admin (rol 1): Crear, editar, eliminar
- Recepción (rol 3): Ver, crear

---

#### `CitasAdmin.jsx` (src/components/CitasAdmin.jsx)
Gestión de citas para admin/recepción:
- ✅ Listar todas las citas
- ✅ Filtrar por: estado, fecha, groomer
- ✅ Cancelar cita
- ✅ Eliminar cita
- Tabla detallada con cliente, mascota, servicio, hora, duración

---

### 3. **Páginas**

#### `DashboardClienteSchedule.jsx` (src/pages/cliente/ScheduleDashboard.jsx)
Dashboard del cliente con:
- Sección de Mascotas (PetManager)
- Sección de Citas (CitasCliente)

**Ruta:** `/cliente/schedule`
**Acceso:** Solo rol cliente (4)

---

#### `ScheduleAdminDashboard.jsx` (src/pages/admin/ScheduleManagement.jsx)
Dashboard de admin/recepción con tabs:
- Gestión de Servicios
- Gestión de Citas

**Ruta:** `/admin/schedule`
**Acceso:** Admin (1) y Recepción (3)

---

### 4. **Router Updates**

Nuevas rutas agregadas en `src/router/AppRouter.jsx`:

```javascript
// SCHEDULE - ADMIN
<Route path="/admin/schedule" element={
  <ProtectedRoute>
    <RoleRoute roles={[1, 3]}>
      <ScheduleAdminDashboard />
    </RoleRoute>
  </ProtectedRoute>
}/>

// SCHEDULE - CLIENTE
<Route path="/cliente/schedule" element={
  <ProtectedRoute>
    <RoleRoute roles={[4]}>
      <DashboardClienteSchedule />
    </RoleRoute>
  </ProtectedRoute>
}/>
```

---

### 5. **Navbar Updates**

Actualizado `src/components/Navbar.jsx` con enlaces contextuales:

**Admin (rol 1):**
- Dashboard → `/admin`
- Agenda → `/admin/schedule`

**Cliente (rol 4):**
- Dashboard → `/cliente`
- Mis Citas → `/cliente/schedule`

**Recepción (rol 3):**
- Dashboard → `/recepcion`
- Agenda → `/admin/schedule`

**Groomer (rol 2):**
- Dashboard → `/groomer`

---

## 📁 Estructura de Archivos

```
frontend/
├── src/
│   ├── api/
│   │   └── scheduleService.js ✨ (nuevo)
│   ├── components/
│   │   ├── PetManager.jsx ✨ (nuevo)
│   │   ├── ModalPetForm.jsx ✨ (nuevo)
│   │   ├── CitasCliente.jsx ✨ (nuevo)
│   │   ├── ServiciosAdmin.jsx ✨ (nuevo)
│   │   ├── CitasAdmin.jsx ✨ (nuevo)
│   │   └── Navbar.jsx ✏️ (modificado)
│   ├── pages/
│   │   ├── cliente/
│   │   │   └── ScheduleDashboard.jsx ✨ (nuevo)
│   │   └── admin/
│   │       └── ScheduleManagement.jsx ✨ (nuevo)
│   └── router/
│       └── AppRouter.jsx ✏️ (modificado)
```

---

## 🔌 Flujo de Datos

### Reservar Cita (Cliente)

```
1. Cliente selecciona mascota, servicio y fecha
   ↓
2. Frontend calcula duración ajustada
   duracionAjustada = duracionBase + (duracionBase * ajuste%)
   ↓
3. GET /api/schedule/slots-disponibles
   - Parámetros: fecha, duracion_minutos
   ↓
4. Backend retorna slots disponibles
   ↓
5. Cliente selecciona horario
   ↓
6. POST /api/schedule/citas
   {
     "mascota_id": "uuid",
     "servicio_id": "uuid",
     "groomer_id": "uuid",
     "fecha_inicio": "ISO",
     "fecha_fin": "ISO"
   }
   ↓
7. Cita confirmada ✅
```

---

## 🎨 Características de UI/UX

### Componentes
- ✅ Tablas con información clara
- ✅ Modales para crear/editar
- ✅ Validación en tiempo real
- ✅ Mensajes de error contextuales
- ✅ Estados visuales (confirmada, cancelada, etc.)
- ✅ Formateo de fechas y horas en español
- ✅ Indicadores de carga
- ✅ Confirmaciones de acciones destructivas

### Colores por Estado
- **Confirmada**: Verde (`bg-green-100 text-green-800`)
- **Cancelada**: Rojo (`bg-red-100 text-red-800`)
- **Pendiente**: Amarillo (`bg-yellow-100 text-yellow-800`)
- **Completada**: Azul (`bg-blue-100 text-blue-800`)

---

## 🚀 Guía de Uso

### Para Cliente

1. **Navegar a Mis Citas**
   - Clic en "Mis Citas" en el navbar
   - Acceso: `/cliente/schedule`

2. **Crear Mascota**
   - Sección "Mis Mascotas"
   - Clic en "+ Agregar Mascota"
   - Llenar formulario con datos

3. **Reservar Cita**
   - Tab "Reservar Cita"
   - Seleccionar mascota, servicio, fecha
   - Clic "Buscar Horarios"
   - Seleccionar horario disponible
   - Clic "Reservar"

4. **Ver Mis Citas**
   - Tab "Mis Citas"
   - Ver lista de citas con fechas y horarios
   - Opción para cancelar

### Para Admin/Recepción

1. **Navegar a Agenda**
   - Clic en "Agenda" en el navbar
   - Acceso: `/admin/schedule`

2. **Gestionar Servicios**
   - Tab "Servicios"
   - Crear: Clic "+ Nuevo Servicio"
   - Editar: Clic "Editar" en tabla
   - Eliminar: Clic "Eliminar" en tabla

3. **Gestionar Citas**
   - Tab "Citas"
   - Filtrar por: estado, fecha, groomer
   - Acciones: Cancelar, eliminar

---

## 🔐 Control de Acceso

| Funcionalidad | Admin | Recepción | Groomer | Cliente |
|---|---|---|---|---|
| Ver servicios | ✅ | ✅ | ❌ | ✅ |
| Crear/Editar servicios | ✅ | ✅ | ❌ | ❌ |
| Gestionar citas | ✅ | ✅ | ❌ | ❌ |
| Ver mis mascotas | ❌ | ❌ | ❌ | ✅ |
| Crear mascota | ❌ | ❌ | ❌ | ✅ |
| Editar mascota | ❌ | ❌ | ❌ | ✅ |
| Deletar mascota | ❌ | ❌ | ❌ | ✅ |
| Reservar cita | ❌ | ❌ | ❌ | ✅ |
| Ver mis citas | ❌ | ❌ | ❌ | ✅ |
| Cancelar mis citas | ❌ | ❌ | ❌ | ✅ |

---

## 🧪 Pruebas Recomendadas

### 1. Autenticación y Acceso
- ✅ Verificar que solo clientes pueden acceder a `/cliente/schedule`
- ✅ Verificar que solo admin/recepción pueden acceder a `/admin/schedule`
- ✅ Verificar protección de rutas

### 2. Gestión de Mascotas
- ✅ Crear mascota con todos los campos
- ✅ Crear mascota con campos opcionales vacíos
- ✅ Editar mascota existente
- ✅ Eliminar mascota
- ✅ Validar campos requeridos

### 3. Reserva de Citas
- ✅ Buscar slots disponibles
- ✅ Calcular duración ajustada correctamente
- ✅ Reservar cita con mascota pequeña
- ✅ Reservar cita con mascota grande
- ✅ Ver citas en "Mis Citas"
- ✅ Cancelar cita

### 4. Admin/Recepción
- ✅ Ver lista de servicios
- ✅ Crear nuevo servicio
- ✅ Editar servicio
- ✅ Eliminar servicio
- ✅ Ver todas las citas
- ✅ Filtrar citas por estado, fecha, groomer
- ✅ Cancelar cita
- ✅ Eliminar cita

---

## 📊 Variables de Estado Principales

### scheduleService.js
```javascript
// Objeto con métodos para servicios
scheduleServices { getServicios, createServicio, ... }

// Objeto con métodos para mascotas
petServices { getMascotasCliente, createMascota, ... }

// Objeto con utilidades
scheduleUtils {
  calcularDuracionAjustada(base, ajuste),
  formatearDuracion(minutos),
  minutosAHora(minutos),
  getDiasSemanaNombres()
}
```

### CitasCliente.jsx
```javascript
{
  tab: 'disponibles' | 'mis-citas',
  mascotas: Mascota[],
  servicios: Servicio[],
  citas: Cita[],
  slotsDisponibles: Slot[],
  filtros: {
    fecha: string,
    mascotaId: string,
    servicioId: string,
    duracionMinutos: string
  }
}
```

### PetManager.jsx
```javascript
{
  mascotas: Mascota[],
  características: Característica[],
  editingPet: Mascota | null,
  showModal: boolean
}
```

---

## ⚠️ Consideraciones Importantes

### Calcular Duración Ajustada
La duración se ajusta según la característica de la mascota:

```javascript
const mascota = { ajuste_porcentaje: 15 }; // Grande
const servicio = { duracion_minutos: 60 };
const duracionAjustada = 60 + (60 * 15 / 100) = 69 min → 69 min
```

### Formato de Fechas
- Entrada API: ISO format (`2025-03-15T10:00:00Z`)
- Pantalla: Localizado en español (`15 de marzo de 2025`)

### Validaciones Frontend
- Fecha no puede ser menor a hoy
- Todos los campos requeridos
- Edad y peso deben ser números
- Email válido

---

## 🔗 Integración con Backend

El frontend se conecta automáticamente al backend mediante el servicio `axios.js`:

```javascript
// src/api/axios.js
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Configurar según tu backend
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptores para JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 🛠️ Configuración Necesaria

### 1. Backend debe estar ejecutándose
```bash
npm run dev
# Backend en: http://localhost:3001
```

### 2. Base de datos inicializada
```bash
npm run init-db
```

### 3. Variables de ambiente (Frontend)
Verificar que el `axios` esté configurado correctamente en `src/api/axios.js`

---

## 📝 Notas Técnicas

- **Framework**: React 18+
- **Enrutamiento**: React Router v6
- **HTTP Client**: Axios
- **UI**: Tailwind CSS
- **Autenticación**: JWT con contexto de React
- **Estado**: State local en componentes

---

## ✅ Checklist de Implementación

- ✅ Servicio de API centralizado
- ✅ Componente PetManager
- ✅ Modal para crear/editar mascotas
- ✅ Componente CitasCliente
- ✅ Componente ServiciosAdmin
- ✅ Componente CitasAdmin
- ✅ Página cliente ScheduleDashboard
- ✅ Página admin ScheduleManagement
- ✅ Rutas integradas en AppRouter
- ✅ Navbar con enlaces contextuales
- ✅ Control de acceso por roles
- ✅ Validación de formularios
- ✅ Formateo de fechas
- ✅ Cálculo de duraciones ajustadas
- ✅ Documentación completa

---

## 🎉 ¡El módulo está listo para usar!

### Primeros Pasos:
1. Asegúrate que el backend esté corriendo
2. Abre http://localhost:5173 (o tu puerto de Vite)
3. Registra un cliente en `/register`
4. Navega a `/cliente/schedule`
5. ¡Empieza a reservar citas!

---

## 📞 Soporte Técnico

### Errores Comunes

**Error: "No se puede conectar al backend"**
- Verificar que el backend esté corriendo en puerto 3001
- Verificar la configuración de `axios.js`

**Error: "No tienes acceso a esta página"**
- Verificar que estés autenticado
- Verificar que tengas el rol correcto

**Error: "No hay slots disponibles"**
- Verificar que haya un groomer con disponibilidad
- Verificar que no haya bloqueos en la fecha
- Verificar la capacidad diaria del spa

---

**Documentación Generada:** 20 de mayo de 2026
**Versión:** 1.0.0
**Estado:** ✅ Completo y funcional
