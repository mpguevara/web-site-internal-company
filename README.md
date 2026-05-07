# web-site-internal-company

Repositorio para el sitio web profesional de Mario de Jesús Paz Guevara.

Sitio web estático para presentar servicios profesionales como Ingeniero de Software.

## Contenido

- Página principal con presentación profesional
- Servicios de desarrollo web, APIs, automatización y consultoría
- Secciones de experiencia, proceso y contacto
- Formulario que prepara un correo a `mario.paz.software@gmail.com`

## Cómo abrirlo

Abre `index.html` directamente en tu navegador.

## Configuración de correo

El formulario está preparado para enviar datos a `/api/contact`, definido en `mail-config.js`.
Mientras no exista un servidor mail conectado, el sitio usa `mailto:` como respaldo.

Para conectar SMTP, usa `server/mail-handler.example.js` como base y configura las variables de `server/.env.example`.

Pasos base:

```bash
npm install
npm start
```

## Próximos ajustes

- Afinar el objetivo comercial del sitio
- Agregar enlaces reales de LinkedIn y GitHub
- Ajustar servicios, experiencia y propuesta de valor
- Preparar publicación en GitHub Pages, Vercel o Netlify
