# Plan de calidad y mejora de EcoTienda

Este documento convierte la auditoría de la aplicación en un plan de trabajo priorizado. El objetivo es dejar EcoTienda como una aplicación interna sencilla, profesional, confiable y fácil de usar, sin agregar complejidad ni funciones innecesarias.

## Ruta rápida

1. Corregir seguridad, integridad de datos y acceso del técnico.
2. Añadir barreras contra errores y regresiones.
3. Mejorar la confiabilidad operativa.
4. Simplificar y unificar la experiencia visual.

## Estado de partida

La base actual es funcional:

- El build de producción termina correctamente.
- Las 47 pruebas existentes pasan.
- ESLint no reporta errores.
- El flujo principal ya existe: Agenda → Visita → Cotización → Venta → Descargables.
- Hay diseño adaptable, estados vacíos y esqueletos de carga en las áreas principales.

La prioridad no es agregar más módulos. Primero deben cerrarse huecos de autorización, navegación, integridad de datos y recuperación ante errores.

## Entrega 1 — Seguridad, datos y flujo técnico

**Prioridad: P0**

Esta entrega debe completarse antes de continuar ampliando Configuración u otros módulos.

### 1. Proteger todas las operaciones sensibles

#### Trabajo

- [ ] Agregar validación explícita de administrador en `src/features/workers/actions.ts`.
- [ ] Agregar validación explícita de administrador en `markSaleAsLostAction`.
- [ ] Proteger `src/app/api/quotations/[id]/pdf/route.ts` con usuario y rol.
- [ ] Revisar todas las Server Actions para asegurar que no dependan únicamente de la interfaz o de RLS.
- [ ] Evitar devolver detalles internos de Supabase, Storage o stacks al usuario.
- [ ] Retirar logs de depuración de los flujos de cotización y PDF.

#### Criterio de finalización

- Un técnico no puede modificar trabajadores, configuración, cotizaciones administrativas ni ventas.
- Un usuario sin sesión no puede descargar PDFs privados.
- Cada operación sensible valida permisos en la aplicación y en la base de datos.

### 2. Endurecer las políticas RLS

#### Trabajo

- [ ] Auditar las políticas de `company_settings`, `quotations`, `quotation_items`, `suppliers` y Storage.
- [ ] Sustituir políticas generales para `authenticated` por políticas según rol y asignación.
- [ ] Mantener RLS como segunda barrera, aunque la Server Action ya valide el rol.
- [ ] Incorporar las políticas vigentes a migraciones reproducibles.

#### Criterio de finalización

- Las políticas reflejan exactamente los permisos de administrador y técnico.
- Ningún usuario autenticado obtiene permisos administrativos solo por tener una sesión válida.

### 3. Corregir el recorrido del técnico

#### Trabajo

- [ ] Quitar Agenda de la navegación del técnico o crear una vista de agenda realmente autorizada para ese rol.
- [ ] Migrar todas las asignaciones antiguas por nombre hacia `assignee_worker_id`.
- [ ] Unificar el filtro del listado técnico y la autorización del detalle de visita.
- [ ] Corregir la compatibilidad legacy del hub de visitas para que no quede después de un `notFound()` inalcanzable.
- [ ] Asegurar que los enlaces de regreso lleven al técnico a `/technician`, no a rutas exclusivas de administrador.
- [ ] Reemplazar el texto técnico de `/unauthorized` por una explicación neutral para el usuario.

#### Criterio de finalización

- Todo trabajo visible para un técnico puede abrirse.
- Ningún técnico puede abrir un trabajo que no tenga asignado.
- No existen enlaces visibles que terminen en “Acceso denegado”.

### 4. Hacer atómicas las cotizaciones

#### Trabajo

- [ ] Reutilizar la RPC transaccional de cotizaciones para crear, editar y autoguardar.
- [ ] Guardar cotización y productos en una sola transacción.
- [ ] Definir claramente qué ocurre si falla la generación del PDF.
- [ ] Evitar estados donde se actualice la cotización pero se pierdan sus productos.
- [ ] Mantener una sola cotización canónica por trabajo.

#### Criterio de finalización

- Un error en productos, cotización o validación revierte toda la operación.
- La interfaz nunca informa éxito si quedó una operación parcial.

### 5. Actualizar dependencias

#### Trabajo

- [ ] Actualizar Next.js de `16.2.11` a una versión corregida compatible, comenzando por `16.3.0`.
- [ ] Actualizar Wrangler y dependencias transitivas vulnerables.
- [ ] Regenerar el lockfile.
- [ ] Ejecutar build, pruebas y `npm audit` después de actualizar.

#### Criterio de finalización

- No quedan vulnerabilidades altas con corrección disponible.
- Cloudflare y el build de producción continúan funcionando.

## Entrega 2 — Recuperación ante errores y pruebas críticas

**Prioridad: P1**

### 6. Manejar errores de datos de forma consistente

#### Trabajo

- [ ] Revisar los errores de las consultas en `src/features/sales/data.ts`.
- [ ] Evitar que Descargables convierta un error de Supabase en una lista vacía.
- [ ] Aplicar el mismo patrón a Trabajos, Agenda, Visitas, Cotizaciones, Ventas y Trabajadores.
- [ ] Diferenciar entre estado vacío, carga parcial y error.
- [ ] Incluir una acción clara para volver a intentar.

#### Criterio de finalización

- Una caída de Supabase nunca se presenta como “No hay registros”.
- El usuario sabe qué falló y cómo volver a intentarlo.

### 7. Agregar límites de error

#### Trabajo

- [ ] Crear `src/app/error.tsx`.
- [ ] Crear `src/app/admin/error.tsx`.
- [ ] Evaluar límites específicos para Trabajos y Cotizaciones.
- [ ] Mostrar un identificador técnico sin revelar información sensible.
- [ ] Incluir botones para reintentar y volver a una ruta segura.

#### Criterio de finalización

- Un error inesperado no deja una pantalla blanca ni una respuesta técnica sin contexto.

### 8. Añadir integración continua

La integración continua debe ejecutar:

```text
npm run lint
npm test
npm run build
```

#### Trabajo

- [ ] Crear un workflow de CI para pushes y pull requests.
- [ ] Hacer obligatorio que lint, pruebas y build terminen correctamente.
- [ ] Evitar desplegar una revisión que falle estas validaciones.

### 9. Añadir pruebas E2E mínimas

#### Recorridos obligatorios

- [ ] Un administrador crea un trabajo, lo agenda y asigna un técnico.
- [ ] El técnico abre solamente su trabajo y guarda una visita.
- [ ] El administrador crea y confirma una cotización.
- [ ] El trabajo avanza correctamente a Venta y Descargables.
- [ ] El técnico no puede ejecutar acciones administrativas.

#### Criterio de finalización

- Los permisos y el flujo completo se verifican automáticamente antes de desplegar.

## Entrega 3 — Confiabilidad operativa

**Prioridad: P2**

### 10. Consolidar Supabase

#### Trabajo

- [ ] Convertir los scripts vigentes de `docs/sql/` en migraciones ordenadas.
- [ ] Usar `supabase/migrations/` como fuente única de verdad.
- [ ] Documentar cómo levantar una base nueva desde cero.
- [ ] Verificar restricciones singleton y relaciones canónicas.
- [ ] Separar scripts históricos o de reparación de las migraciones normales.

#### Criterio de finalización

- Una base nueva puede reproducirse sin ejecutar SQL manual en un orden desconocido.

### 11. Añadir observabilidad mínima

#### Trabajo

- [ ] Centralizar errores del servidor en un logger pequeño.
- [ ] Registrar módulo, operación e identificador del trabajo sin datos sensibles.
- [ ] Añadir seguimiento de errores de producción.
- [ ] Definir una forma simple de revisar fallos de PDF, Storage y Supabase.
- [ ] Eliminar `console.log` de depuración.

#### Criterio de finalización

- Un fallo reportado por un usuario puede localizarse sin pedirle que reproduzca todo el flujo.

### 12. Normalizar fechas y zona horaria

#### Trabajo

- [ ] Definir una zona horaria operativa única.
- [ ] Centralizar los formatos de fecha y hora.
- [ ] Revisar la agrupación “Hoy”, “Próximos” y “Más adelante” del técnico.
- [ ] Probar citas cercanas a medianoche.

## Entrega 4 — Simplicidad y pulido

**Prioridad: P3**

### 13. Simplificar la experiencia

| Situación actual | Mejora propuesta | Resultado |
| --- | --- | --- |
| El técnico puede ver una ruta que no puede abrir | Mostrar únicamente rutas autorizadas | Sin callejones sin salida |
| La búsqueda de trabajos consulta en cada tecla | Aplicar debounce de 300–400 ms o buscar al enviar | Menos recargas |
| Trabajadores pide un UUID de Auth | Vincular usuarios mediante correo o selector | Menos conocimiento técnico requerido |
| El hub presenta cinco formularios con la misma jerarquía | Recomendar uno según el tipo de trabajo | Menos decisiones |
| El detalle muestra todas las etapas abiertas | Priorizar la etapa actual y contraer las anteriores | Siguiente acción más visible |
| Se mezclan variantes regionales del español | Unificar en español de México | Comunicación consistente |
| Confirmaciones destructivas usan patrones distintos | Reutilizar un diálogo accesible | Menos errores y mejor teclado |

### 14. Unificar componentes y navegación

#### Trabajo

- [ ] Definir la navegación de escritorio y móvil desde una sola configuración por rol.
- [ ] Reutilizar una barra de búsqueda común.
- [ ] Reutilizar campos, alertas, botones y diálogos.
- [ ] Marcar campos obligatorios de forma consistente.
- [ ] Añadir `aria-label` a búsquedas y controles solo con icono.
- [ ] Mantener estados de guardado y error con el mismo patrón visual.

### 15. Refactorizar solamente los hotspots

No se debe reescribir toda la aplicación. El refactor debe limitarse a zonas con riesgo real:

1. Dividir `src/app/admin/trabajos/[id]/page.tsx` por etapas.
2. Separar estado, autoguardado y presentación de `quotation-form.tsx`.
3. Extraer validación y persistencia común de formularios de visita.
4. Dividir `agenda-item-form.tsx` en datos personales, agenda y ubicación.
5. Eliminar implementaciones legacy solamente después de migrar los datos.

#### Criterio de finalización

- Los archivos críticos son más fáciles de probar y modificar.
- No se crean abstracciones genéricas que la aplicación no necesita.

## Orden recomendado de ejecución

### Primera entrega

1. Autorización en Server Actions y PDF.
2. Políticas RLS.
3. Flujo técnico y asignaciones legacy.
4. Atomicidad de cotizaciones.
5. Actualización de dependencias.

### Segunda entrega

1. Manejo consistente de errores.
2. Límites `error.tsx`.
3. CI.
4. Pruebas E2E críticas.

### Tercera entrega

1. Migraciones reproducibles de Supabase.
2. Observabilidad mínima.
3. Zona horaria y fechas.

### Cuarta entrega

1. Simplificación de navegación y formularios.
2. Unificación visual y de idioma.
3. Refactor de hotspots principales.

## Definición de terminado

EcoTienda estará lista para considerarse una aplicación interna profesional cuando:

- [ ] Ningún usuario pueda ejecutar operaciones fuera de su rol.
- [ ] Ningún enlace visible lleve a una ruta prohibida para ese usuario.
- [ ] Las mutaciones críticas sean transaccionales.
- [ ] Los errores se diferencien de los estados vacíos.
- [ ] Existan límites de error y recuperación.
- [ ] CI valide lint, pruebas y build.
- [ ] Los recorridos críticos estén cubiertos por E2E.
- [ ] La base pueda reproducirse mediante migraciones.
- [ ] No existan vulnerabilidades altas con solución disponible.
- [ ] La interfaz utilice un lenguaje y patrones consistentes.

### Fuera de alcance

Este plan no propone:

- agregar módulos sin una necesidad operativa;
- incorporar microservicios;
- crear un sistema complejo de permisos configurables;
- añadir animaciones decorativas;
- reescribir toda la aplicación;
- sustituir tecnologías que ya cumplen su función.

La meta es reducir fallos y decisiones innecesarias, no aumentar el tamaño del sistema.
