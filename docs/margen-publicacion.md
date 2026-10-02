# Margen: propuesta de privacidad y eliminación (interna, no final)

La presentación está preparada en `/margen`, sobre el sitio estático existente.
No se publicaron páginas de privacidad ni eliminación, ni se añadieron enlaces
a rutas inexistentes. Este documento no es una política legal ni un procedimiento
operativo aprobado. No está incluido entre los archivos de la vista previa.

## Confirmaciones de Mario antes de preparar enlaces públicos

1. **Responsable real:** confirmar si es Mario de Jesús Paz Guevara u otra
   identidad legal, su relación con Novacore Labs y la cuenta de desarrollador.
   No atribuir responsabilidad a Novacore Systems S.A. de C.V. sin confirmación.
2. **Contacto operativo:** confirmar que `mario.paz.software@gmail.com` recibirá
   y atenderá solicitudes de privacidad y eliminación, o proporcionar el correo
   definitivo y los datos de contacto que correspondan.
3. **Titularidad:** acordar cómo verificar el correo de la cuenta sin solicitar
   contraseñas. Propuesta: solicitud desde el correo registrado y confirmación
   de control del correo mediante un mecanismo aprobado antes de borrar.
4. **Operación y plazos:** quién tramita solicitudes, plazo real de respuesta y
   ejecución, cómo se registra el seguimiento y cómo se comunica su conclusión.
   Los plazos siguen pendientes; no se prometen valores predeterminados.
5. **Alcance y retención:** confirmar eliminación de identidad en Firebase,
   categorías conservadas si existen, motivos y duración. Definir también
   retención de correos y solicitudes, y separar los datos locales del dispositivo.
6. **Servicios y datos:** comprobar la configuración efectiva de Authentication,
   hosting, analítica y formularios del sitio y cualquier otro tercero antes de
   redactar afirmaciones sobre tratamiento, conservación o transferencias.
7. **Canal dentro de la app:** definir e implementar por separado el acceso a
   la solicitud de eliminación. La app actual solo tiene cierre de sesión.

## Propuesta concreta de páginas

### `/margen/privacidad`

Preparar una página fechada y versionada una vez confirmadas las respuestas,
con: identidad del responsable y contacto; nombre, correo y autenticación;
registros y preferencias locales; notificaciones locales y permisos de Android;
servicios externos; finalidad y retención verificadas; solicitudes y eliminación.
Revisar el texto final con el responsable antes de enlazarlo públicamente.

Base técnica: los movimientos se guardan en SQLite local en Android; Firebase
Authentication administra la identidad, no un respaldo financiero. No hay
sincronización de movimientos, respaldo remoto ni SDK de anuncios integrado.
No afirmar cifrado adicional, recuperación tras desinstalar ni ausencia total
de tratamiento por terceros sin evidencia.

### `/margen/eliminar-cuenta`

Propuesta inicial sin formulario: página que identifica Margen, explica qué se
elimina y ofrece un correo real con asunto «Solicitud de eliminación de cuenta
Margen». Solo habilitar el enlace cuando haya un responsable y procedimiento
aprobados que atiendan las solicitudes. Pedir el correo registrado, nunca la
contraseña ni movimientos financieros para verificar identidad.

La solicitud no equivale a eliminación automática: comprobar titularidad,
ejecutar la eliminación de la identidad y los datos remotos que existan y
comunicar el resultado. Explicar por separado cómo eliminar los registros
locales mediante pasos comprobados en la app; no afirmar que eliminar Firebase
borra a distancia la base SQLite. Aclarar cualquier conservación confirmada.

## Alcance de esta implementación web

- Se copiaron el icono actual y las cuatro pantallas originales del paquete.
- Las pantallas son prototipos Horizonte, con datos de ejemplo, no capturas del APK 0.5.0.
- Página de presentación en español LATAM; el selector multiidioma corporativo
  permanece en la portada. No se prometen traducciones de Margen no preparadas.
- Canonical y Open Graph preparados para `https://novacoresystemssv.vercel.app/margen`.
- `/margen` funciona con `cleanUrls` de Vercel; no se incorporó un router SPA.
- No se modificaron la app móvil, Firebase, Search Console ni Play Console.
- La preparación inicial fue local. La publicación posterior requiere la
  autorización de Mario y sigue el flujo `dev → qa → master`.

## Revisión local

`npm run preview` sirve solo archivos públicos y permite recargar `/margen`.
No ejecuta las funciones de contacto ni del asistente. El correo de Margen usa
un enlace `mailto:` real, con asunto «Consulta sobre Margen»; no se envían correos
durante la verificación. La publicación y los requisitos de tienda se revisan
por separado cuando se autoricen.

Revisión realizada: escritorio de 1440 px y móvil de 360 px, sin desbordamiento
horizontal; imágenes cargadas con texto alternativo y proporción original;
entrada directa y recarga de `/margen`; navegación a las secciones corporativas;
menú y FAQ con teclado; enlaces `mailto:` con destinatario y asunto correctos;
sin errores de consola ni de ejecución en estas vistas. Colores principales de
texto, estado y botones comprobados con contraste superior a 4.5:1.
Se revisaron capturas visuales de la portada, la sección y la galería.
El contacto se verificó como enlace, no como envío de correo; no se ejercitaron
las APIs ni la configuración remota de Vercel. `npm run check` y los chequeos
de sintaxis de los archivos nuevos pasaron.

`scripts/verify-margen.cjs` permite repetir la comprobación con Playwright
disponible en Node. Acepta `PREVIEW_URL` y, opcionalmente, `CHROMIUM_PATH`.
Las capturas se guardan en la carpeta temporal `novacore-margen-review`.
`docs/`, `scripts/` y `server/` se excluyen de Vercel mediante `.vercelignore`.
