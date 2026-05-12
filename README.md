# web-site-internal-company

Repositorio para el sitio web corporativo de Novacore Labs.

Novacore Labs es el nombre comercial de Novacore Systems S.A. de C.V.
El sitio presenta servicios de software empresarial, automatización, integraciones y consultoría técnica.

## Contenido

- Página principal con identidad de Novacore Labs
- Servicios de desarrollo web, APIs, automatización y consultoría
- Secciones de experiencia, proceso y contacto
- Selector multiidioma con español LATAM como idioma predeterminado
- Formulario que prepara un correo a `mario.paz.software@gmail.com`
- Asistente virtual alimentado por `knowledge/novacore.md`

## Desarrollo local

El sitio está preparado para publicarse en Vercel.

Para desarrollo local con la función `/api/contact`:

```bash
npm install
npm run dev
```

## Configuración de correo

El formulario está preparado para enviar datos a `/api/contact`, definido en `mail-config.js`.
Mientras no exista un servidor mail conectado, el sitio usa `mailto:` como respaldo.

En Vercel, configura estas variables de entorno para enviar correos:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`
- `MAIL_TO`

Puedes usar `.env.example` como referencia para nombres de variables.

## Supabase

Si queremos guardar cada contacto como lead, la función `/api/contact` también puede insertar en Supabase.
Solo hace falta configurar:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_CONTACT_TABLE`

## Próximos ajustes

- Afinar el objetivo comercial del sitio
- Agregar enlaces reales de LinkedIn y GitHub
- Ajustar servicios, experiencia y propuesta de valor
- Ajustar dominio, correo corporativo y publicación en Vercel
