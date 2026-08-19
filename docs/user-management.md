# Alta de usuarios y trabajadores

## Flujo

- Desde **Trabajadores > Nuevo trabajador**, el administrador captura nombre
  completo, correo electrónico obligatorio, teléfono opcional, rol obligatorio y
  estado activo. Al guardar siempre se envía una invitación por correo.
- La invitación exige `APP_URL`, crea el usuario con Supabase Auth, asigna el rol
  en `app_metadata.role` y vincula el usuario confirmado a `workers.auth_user_id`.
- El enlace llega a `/auth/confirm`. La app acepta tanto el enlace personalizado
  con `token_hash` como el enlace predeterminado de Supabase con la sesión en el
  fragmento de URL. En el segundo caso, el navegador establece la sesión y la
  app crea una prueba HttpOnly de activación breve antes de redirigir a
  `/auth/set-password`.
- La persona invitada define y confirma su contraseña; después se cierra la sesión
  temporal y se muestra el inicio de sesión para que entre con ese correo y
  contraseña. El acceso posterior valida el vínculo Worker/Auth y redirige a la
  ruta correspondiente a su rol.
- El administrador puede elegir `admin`, `administrative` o `technician` desde
  `/admin/workers`. La interfaz muestra los nombres en español: Administrador,
  Administrativo y Técnico.
- Los perfiles `staff` existentes se muestran como Administrativo y se migran a
  `administrative` al guardarlos.

## Seguridad

- Las Server Actions de trabajadores exigen `requireRole(["admin"])`.
- El vínculo Auth nunca se recibe desde el navegador; lo determina el resultado
  del alta de Auth en el servidor.
- `SUPABASE_SERVICE_ROLE_KEY` solo se lee en el cliente Supabase administrativo
  server-side. Si falta, la operación falla con un error explícito.
- `APP_URL` también es server-only. Debe contener exclusivamente el origen público
  canónico, por ejemplo `https://app.example.com`, sin ruta, query ni fragmento.
  HTTP solo se acepta para `localhost` durante desarrollo.
- El acceso exige un trabajador activo vinculado y un `app_metadata.role` que
  coincida con `workers.role`. `user_metadata.role` no autoriza.
- Las políticas RLS resuelven el rol mediante
  `app_private.current_worker_role()`: el helper privado exige `auth.uid()` no
  nulo, Worker activo y coincidencia entre el rol normalizado del Worker y la
  claim `app_metadata.role`. Una claim JWT por sí sola no concede acceso.
- Si `inviteUserByEmail` devuelve error, solo se limpia el worker provisional:
  nunca se borra el ID Auth de una respuesta fallida porque puede pertenecer a
  una cuenta preexistente.
- Tras una invitación confirmada, los fallos posteriores limpian el worker y el
  usuario Auth creado. Si no se puede borrar Auth después de tocar metadata, se
  intenta restaurar la metadata previa. Todo fallo de compensación exige revisión
  manual explícita.
- El correo guardado en `workers.email` es un correo de contacto. Editarlo en un
  trabajador ya vinculado no modifica el correo de inicio de sesión de Supabase
  Auth.
- Los cambios de Worker usan `updated_at` como control optimista. La metadata Auth
  se vuelve a leer antes de cambiar solo `role`; los rollbacks también son
  condicionales y nunca reemplazan metadata concurrente completa.
- El botón **Eliminar** solo está disponible para administradores y elimina el
  registro de `public.workers` y, si existe, su usuario de Supabase Auth. Las
  referencias históricas de agenda/trabajos se conservan, pero sus columnas de
  asignación quedan en `null` mediante `ON DELETE SET NULL`.
- No se permite que un administrador elimine su propio acceso desde esta pantalla.

## Configuración externa obligatoria en Supabase

El código por sí solo no completa el flujo. Antes de usar invitaciones en cada
entorno, configura en **Authentication > URL Configuration**:

- **Site URL**: el mismo origen exacto de `APP_URL`, por ejemplo
  `https://app.example.com`.
- **Redirect URLs**: agrega exactamente `${APP_URL}/auth/confirm`. Para desarrollo,
  agrega por separado `http://localhost:3000/auth/confirm` si corresponde.
- Para restablecimiento de contraseña, agrega también
  `${APP_URL}/auth/reset-password/callback` y, en desarrollo,
  `http://localhost:3000/auth/reset-password/callback`.
- No uses comodines en producción para este flujo.

No necesitas configurar SMTP personalizado ni editar una plantilla para el flujo
predeterminado. La plantilla estándar de **Invite user**, con su enlace
`{{ .ConfirmationURL }}`, ya es compatible con la app.

Si más adelante habilitas edición de plantillas, también puedes usar el flujo
server-side con este contenido (puedes cambiar solo el texto visible, no el
`href`):

```html
<h2>Activa tu acceso a EcoTienda</h2>
<p>Has sido invitado a crear tu cuenta.</p>
<p>
  <a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=invite">
    Aceptar invitación
  </a>
</p>
```

La plantilla personalizada usa `TokenHash`; la estándar usa `ConfirmationURL` y
la app procesa su fragmento en el navegador. `inviteUserByEmail` no usa PKCE
porque normalmente la invitación se solicita y se acepta en navegadores
distintos. La verificación server-side con `verifyOtp({ token_hash, type:
"invite" })` continúa disponible para el enlace personalizado.

La página GET intermedia existe para evitar que Safe Links, antivirus o previews de
correo consuman el token. Solo el formulario POST ejecutado por la persona invitada
llama `verifyOtp`.

## Orden de migraciones para instalaciones existentes

1. Ejecuta `docs/sql/add-administrative-role-to-workers.sql`. Corrige primero los
   vínculos `auth_user_id` duplicados si el preflight los reporta.
2. Ejecuta `docs/sql/update-administrative-role-policies.sql` para recrear de forma
   idempotente las políticas de agenda, clientes, proyectos, cotizaciones/items,
   trabajos y todas las tablas de etapas relacionadas.
3. Haz que los usuarios con rol modificado renueven su sesión/JWT antes de probar
   RLS; las claims de `app_metadata` existentes no se refrescan automáticamente.

Aplicar **ambos SQL es obligatorio antes de habilitar invitaciones**. El flujo **no
está listo para enviar invitaciones reales** hasta completar esas migraciones y
hasta que `APP_URL`, Site URL y Redirect URLs estén configurados y probados en el
proyecto Supabase del entorno. El SMTP personalizado es opcional para este flujo.

En instalaciones nuevas, ejecuta primero `docs/sql/create-workers-table.sql`; los
demás scripts base usan `app_private.current_worker_role()` y fallarán de forma
intencional si el helper todavía no existe.

## Pendientes

- Recuperación de contraseña para cuentas ya activadas.
- Revocación de sesiones existentes al desactivar o cambiar un rol.
- Rotación manual de cualquier clave que haya aparecido en copias locales como
  `env.local(1).download`. El archivo fue eliminado e ignorado, pero el repositorio
  no puede invalidar credenciales ya expuestas.
- Auditoría completa de cambios de usuarios, roles e invitaciones.
