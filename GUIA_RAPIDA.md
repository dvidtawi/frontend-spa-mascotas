# 🚀 Guía Rápida - Pet Spa Schedule Module

## ⚡ Inicio Rápido (5 minutos)

### 1. Inicializar Backend

```bash
# Terminal 1: Backend
cd pet-spa-backend
npm run init-db  # Crear tablas
npm run dev      # Iniciar servidor
```

✅ Backend corriendo en `http://localhost:3001`

### 2. Inicializar Frontend

```bash
# Terminal 2: Frontend
cd pet-spa-frontend/frontend
npm run dev      # Iniciar servidor
```

✅ Frontend corriendo en `http://localhost:5173`

---

## 👥 Crear Usuarios de Prueba

### Admin

```bash
# Abrir http://localhost:5173/register
Email: admin@test.com
Contraseña: Admin123!@
Nombre: Admin
Rol: Administrador
```

### Cliente

```bash
# Abrir http://localhost:5173/register
Email: cliente@test.com
Contraseña: Cliente123!@
Nombre: Juan
Rol: Cliente
```

### Groomer

```bash
Email: groomer@test.com
Contraseña: Groomer123!@
Nombre: Carlos
Rol: Groomer
```

### Recepción

```bash
Email: recepcion@test.com
Contraseña: Recepcion123!@
Nombre: María
Rol: Recepcionista
```

---

## 📱 Flujo Como Cliente

### Step 1: Login
```
1. Ir a http://localhost:5173
2. Click en "Login"
3. Ingresar credenciales de cliente@test.com
```

### Step 2: Ir a Dashboard
```
1. En navbar hacer click en "Mis Citas"
2. Te llevará a /cliente/schedule
```

### Step 3: Crear Mascota
```
1. En la sección "Mis Mascotas" click en "+ Agregar Mascota"
2. Llenar:
   - Nombre: "Max"
   - Especie: "Perro"
   - Raza: "Labrador"
   - Tamaño: "Grande"
   - Característica: "Grande (+15%)"
3. Click "Guardar"
```

### Step 4: Reservar Cita
```
1. Click en tab "Reservar Cita"
2. Seleccionar:
   - Mascota: Max
   - Servicio: Baño completo (60 min)
   - Fecha: Mañana
3. Click "Buscar Horarios"
4. Seleccionar horario disponible
5. Click "Reservar"
6. ✅ Cita confirmada!
```

### Step 5: Ver Mis Citas
```
1. Click en tab "Mis Citas"
2. Ver lista de citas confirmadas
3. Opción para cancelar si lo necesitas
```

---

## 👨‍💼 Flujo Como Admin

### Step 1: Login
```
1. Ir a http://localhost:5173
2. Click en "Login"
3. Ingresar credenciales de admin@test.com
```

### Step 2: Ir a Dashboard
```
1. En navbar hacer click en "Agenda"
2. Te llevará a /admin/schedule
```

### Step 3: Crear Servicio
```
1. Estar en tab "Servicios"
2. Click en "+ Nuevo Servicio"
3. Llenar:
   - Nombre: "Baño Premium"
   - Duración: 90 minutos
   - Precio: $65
   - Activo: ✓
4. Click "Guardar"
```

### Step 4: Ver Citas
```
1. Click en tab "Citas"
2. Ver todas las citas del sistema
3. Filtrar por:
   - Estado
   - Fecha
   - Groomer
4. Acciones: Cancelar o Eliminar
```

---

## 📊 Estructura de Datos

### Roles y Permisos

```
Admin (rol_id: 1)
├─ Ver/Crear/Editar/Eliminar Servicios
├─ Ver/Cancelar/Eliminar Citas
└─ Gestionar Disponibilidad

Groomer (rol_id: 2)
└─ Dashboard personal

Recepción (rol_id: 3)
├─ Ver/Crear Servicios
├─ Ver/Cancelar/Eliminar Citas
└─ Acceso a Agenda

Cliente (rol_id: 4)
├─ Ver/Crear/Editar/Eliminar Mascotas
├─ Buscar Slots Disponibles
├─ Crear Citas
├─ Ver Mis Citas
└─ Cancelar Citas
```

---

## 🔗 Rutas Principales

### Cliente
- `/cliente` - Dashboard principal
- `/cliente/schedule` - Mascotas y citas

### Admin
- `/admin` - Dashboard principal
- `/admin/schedule` - Gestión de agenda y servicios

### Recepción
- `/recepcion` - Dashboard principal
- `/admin/schedule` - Gestión de agenda y servicios

### Groomer
- `/groomer` - Dashboard principal

---

## 🎯 Casos de Uso Comunes

### Caso 1: Cliente quiere cambiar de mascota
```
1. Login como cliente
2. Ir a "Mis Citas"
3. Editar mascota deseada
4. Cambiar datos
5. Guardar
```

### Caso 2: Admin crea bloqueo para mantenimiento
```
1. Login como admin
2. Ir a "Agenda"
3. En sección de Bloqueos (futuro)
4. Crear bloqueo
5. Seleccionar groomer y fecha
```

### Caso 3: Cliente cancela cita última hora
```
1. Login como cliente
2. Ir a "Mis Citas"
3. Tab "Mis Citas"
4. Click "Cancelar Cita"
5. Confirmar
```

### Caso 4: Admin ve todas las citas del día
```
1. Login como admin
2. Ir a "Agenda"
3. Tab "Citas"
4. Filtrar por fecha de hoy
5. Ver todas las citas
```

---

## ✨ Cálculo de Duración Ajustada

La duración de servicios se ajusta según la mascota:

```
Mascota Pequeña:    duracion × 1.00  (0%)
Mascota Mediana:    duracion × 1.10  (+10%)
Mascota Grande:     duracion × 1.15  (+15%)
Mascota Gigante:    duracion × 1.30  (+30%)
Mascota Nerviosa:   duracion × 1.20  (+20%)
```

**Ejemplo:**
```
Servicio: Baño completo (60 min)
Mascota: Grande
Duración ajustada: 60 × 1.15 = 69 minutos
```

---

## 🔍 Troubleshooting

### Error: "No se puede conectar al servidor"
```
1. Verificar que backend esté corriendo en puerto 3001
2. Verificar que frontend esté en puerto 5173
3. Revisar firewall/antivirus
```

### Error: "No tienes acceso a esta página"
```
1. Verificar que estés autenticado
2. Verificar que tengas el rol correcto
3. Hacer logout y login nuevamente
```

### Error: "No hay slots disponibles"
```
1. Verificar que haya un groomer registrado
2. Verificar que el groomer tenga disponibilidad
3. Verificar que no haya bloqueos
4. Intentar otra fecha
```

### Cita no aparece en "Mis Citas"
```
1. Recargar página (F5)
2. Logout y login
3. Verificar que estés logueado como el cliente correcto
4. Revisar console (F12) por errores
```

---

## 📞 Comandos Útiles

### Backend

```bash
# Iniciar servidor
npm run dev

# Inicializar base de datos
npm run init-db

# Resetear base de datos (elimina todo)
npm run reset-db

# Ver logs
npm run logs
```

### Frontend

```bash
# Iniciar servidor
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linter
npm run lint

# Ver errores
npm run errors
```

---

## 📋 Checklist de Verificación

- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 5173
- [ ] Base de datos inicializada
- [ ] Usuarios de prueba creados
- [ ] Cliente puede ver mascotas
- [ ] Cliente puede reservar cita
- [ ] Admin puede ver servicios
- [ ] Admin puede ver citas
- [ ] Filtros funcionan
- [ ] Cancelaciones funcionan

---

## 🎓 Próximos Pasos

1. **Explorar el código**
   - Revisar `src/api/scheduleService.js`
   - Entender estructura de componentes

2. **Hacer cambios**
   - Modificar colores en Tailwind
   - Agregar campos a formularios
   - Cambiar validaciones

3. **Agregar funcionalidades**
   - Notificaciones
   - Reportes
   - Integraciones

4. **Desplegar**
   - Configurar variables de ambiente
   - Deployer a servidor

---

## 🆘 ¿Necesitas ayuda?

Revisa:
1. `DOCUMENTACION_SCHEDULE_FRONTEND.md` - Documentación completa
2. `RESUMEN_CAMBIOS.md` - Resumen de cambios
3. Consola del navegador (F12) - Errores
4. Logs del backend - Problemas del servidor

---

**¡Listo para comenzar! 🚀**

Abre dos terminales y ejecuta:
```bash
# Terminal 1
cd pet-spa-backend && npm run dev

# Terminal 2
cd pet-spa-frontend/frontend && npm run dev
```

Luego abre http://localhost:5173 en tu navegador.
