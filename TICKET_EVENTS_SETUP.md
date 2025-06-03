# Sistema de Eventos de Tickets Múltiples

## Descripción

Este sistema permite configurar múltiples eventos con sus respectivas URLs de entradas desde el panel de administración. Cuando hay múltiples eventos activos, se muestra un modal elegante para que el usuario seleccione a cuál evento desea ir.

## Características Implementadas

### 🎯 Funcionalidades Principales

1. **Gestión de Múltiples Eventos**: Crear, editar y eliminar eventos de tickets
2. **Modal de Selección**: Interfaz elegante para elegir entre múltiples eventos
3. **Compatibilidad con URLs Externas e Internas**: Soporte para enlaces externos (Eventbrite, etc.) y rutas internas
4. **Sistema de Fallback**: Si no hay eventos configurados, usa la URL de tickets tradicional
5. **Orden Personalizable**: Control del orden de visualización de eventos
6. **Estados Activo/Inactivo**: Activar/desactivar eventos sin eliminarlos

### 🎨 Diseño UI/UX

El modal cumple con las 12 leyes de UX:

1. **Ley de Fitts**: Botones grandes y fáciles de hacer clic
2. **Ley de Hick**: Opciones claras y limitadas
3. **Ley de Miller**: Información agrupada y organizada
4. **Ley de la Proximidad**: Elementos relacionados agrupados visualmente
5. **Ley del Cierre**: Diseño cohesivo y completo
6. **Ley de la Región Común**: Elementos agrupados en contenedores claros
7. **Ley de la Similitud**: Elementos similares con diseño consistente
8. **Ley de la Conectividad**: Relaciones visuales claras
9. **Ley de la Continuidad**: Flujo visual natural
10. **Ley de la Simetría**: Balance visual equilibrado
11. **Ley de la Figura-Fondo**: Contraste claro entre elementos
12. **Ley de la Experiencia Pasada**: Patrones familiares de UI

### 📱 Responsive Design

- **Mobile First**: Optimizado para dispositivos móviles
- **Breakpoints Adaptativos**: Se adapta a diferentes tamaños de pantalla
- **Touch Friendly**: Botones y áreas de toque optimizadas
- **Accesibilidad**: Soporte para navegación por teclado y lectores de pantalla

## Instalación y Configuración

### 1. Aplicar Migraciones

```bash
# Asegúrate de que Docker Desktop esté ejecutándose
npx supabase start

# Aplica las migraciones
npx supabase db reset
```

### 2. Verificar la Tabla

La migración creará la tabla `ticket_events` con la siguiente estructura:

```sql
CREATE TABLE ticket_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  image_url text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 3. Configurar Eventos

1. Ve al panel de administración
2. Navega a "Configuración del Sitio"
3. Selecciona la pestaña "Eventos de Entradas"
4. Crea tus eventos con:
   - **Nombre**: Nombre descriptivo del evento (requerido)
   - **URL**: URL externa o ruta interna (requerido)
   - **Orden**: Se asigna automáticamente (último + 1)
   - **Estado**: Se activa automáticamente, se puede cambiar con el icono del ojo

## Uso del Sistema

### Comportamiento del Botón de Entradas

1. **Sin eventos configurados**: Usa la URL de tickets tradicional (fallback)
2. **Un evento activo**: Redirige directamente al evento
3. **Múltiples eventos activos**: Muestra el modal de selección

### Gestión de Eventos

- **Crear Evento**: Solo requiere nombre y URL
- **Orden Automático**: Se asigna automáticamente el siguiente número disponible
- **Estado**: Los eventos se crean activos por defecto
- **Activar/Desactivar**: Usar el icono del ojo en la lista de eventos
- **Editar**: Solo se puede modificar nombre y URL
- **Eliminar**: Botón de papelera para eliminar completamente

### Modal de Selección

- **Diseño Elegante**: Gradientes y efectos visuales atractivos
- **Animaciones Suaves**: Transiciones fluidas y naturales
- **Información Clara**: Nombre del evento
- **Indicadores Visuales**: Iconos para URLs externas vs internas
- **Navegación Intuitiva**: ESC para cerrar, clic fuera para cerrar
- **Responsive**: Se adapta a todos los tamaños de pantalla

## Archivos Modificados/Creados

### Nuevos Archivos

- `src/types/tickets.ts` - Tipos TypeScript para eventos de tickets
- `src/hooks/useTicketEvents.ts` - Hook para gestionar eventos de tickets
- `src/components/tickets/TicketEventModal.tsx` - Modal de selección de eventos
- `src/components/admin/TicketEventsManager.tsx` - Gestor de eventos en admin
- `supabase/migrations/20250201220000_create_ticket_events_table.sql` - Migración de BD

### Archivos Modificados

- `src/types/database.types.ts` - Agregada tabla ticket_events
- `src/components/layout/FloatingTicketButton.tsx` - Integración con nuevo sistema
- `src/components/admin/SiteConfigManager.tsx` - Agregada pestaña de eventos
- `tailwind.config.js` - Agregadas animaciones para el modal

## Personalización

### Estilos del Modal

El modal usa las variables de color de Mantra:

```css
--mantra-gold: #C85627
--mantra-darkGold: #8B3613
--mantra-orange: #E67E22
--mantra-warmBlack: #2C1810
--mantra-light: #F4A460
```

### Animaciones

Las animaciones están configuradas en `tailwind.config.js`:

- `fade-in`: Aparición suave
- `zoom-in-95`: Zoom de entrada
- `slide-in-from-bottom-4`: Deslizamiento desde abajo

## Consideraciones de Rendimiento

- **Lazy Loading**: El modal se carga solo cuando es necesario
- **Optimización de Consultas**: Índices en campos frecuentemente consultados
- **Cache de Eventos**: Los eventos se cargan una vez y se cachean
- **Animaciones Optimizadas**: Uso de `transform` y `opacity` para mejor rendimiento

## Seguridad

- **RLS Habilitado**: Row Level Security en la tabla ticket_events
- **Validación de URLs**: Validación de formato de URLs
- **Sanitización**: Limpieza de inputs del usuario
- **Políticas de Acceso**: Solo usuarios autenticados pueden gestionar eventos

## Soporte y Mantenimiento

### Logs y Debugging

Los errores se muestran en la consola del navegador y en la interfaz de usuario.

### Backup de Datos

Los eventos se almacenan en la base de datos de Supabase con respaldo automático.

### Actualizaciones

Para actualizar el sistema, simplemente aplica las nuevas migraciones:

```bash
npx supabase db push
```

## Próximas Mejoras

- [ ] Integración con calendario de eventos
- [ ] Notificaciones push para nuevos eventos
- [ ] Analytics de clics en eventos
- [ ] Integración con sistemas de tickets externos
- [ ] Previsualización de eventos en tiempo real
- [ ] Importación masiva de eventos desde CSV/JSON
