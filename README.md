# Línea Frontera — sitio

Sitio estático (HTML/CSS/JS puro, sin build). Archivos:
- `index.html` — página principal
- `auth.html` — iniciar sesión / crear cuenta
- `dashboard.html` — panel del cliente (requiere sesión de cliente)
- `admin.html` — panel de administrador (requiere sesión de admin)
- `styles.css` — estilos compartidos
- `script.js` — cuentas, menú móvil, pestañas y editor del sitio

## Acceso de administrador (demo)
- Correo: `admin@lineafrontera.mx`
- Contraseña: `frontera2026`

Cámbialos directamente en `script.js` (constantes `ADMIN_EMAIL` y `ADMIN_PASSWORD`) antes de publicar el sitio de verdad.

## Cómo funciona hoy (importante)
Las cuentas, la sesión y los textos que edites desde "Editor del sitio" en el panel de admin se guardan con `localStorage`, es decir, **solo en el navegador donde se crean o editan**. Esto sirve para probar el flujo completo (crear cuenta → ver panel de cliente; editar precios desde admin → verlos en la página principal), pero no sincroniza entre dispositivos ni es seguro para contraseñas reales.

Para que esto funcione de verdad con datos "en tiempo real" entre todos los visitantes, el siguiente paso es conectar una base de datos real, por ejemplo:
- **Cloudflare D1 o Workers KV** (recomendado, ya que hostearás en Cloudflare Pages) + Cloudflare Pages Functions para las rutas de login/registro.
- O un servicio como **Supabase** o **Firebase**, que traen autenticación y base de datos en tiempo real listos para usar.

Cuando quieras dar ese paso, dime y armamos la integración.

## Subir a GitHub
1. Crea un repositorio nuevo (puede ser público o privado).
2. Sube estos archivos a la raíz del repositorio (no dentro de una carpeta).

## Publicar en Cloudflare Pages
1. En Cloudflare, ve a **Workers & Pages → Create → Pages → Connect to Git**.
2. Selecciona el repositorio.
3. Framework preset: **None**. Build command: (vacío). Output directory: `/` (raíz).
4. Deploy.

## Conectar el dominio lineafrontera.stream
1. En el proyecto de Pages, ve a **Custom domains → Set up a custom domain**.
2. Escribe `lineafrontera.stream` (y opcionalmente `www.lineafrontera.stream`).
3. Si el dominio ya está en la misma cuenta de Cloudflare, el DNS se configura automáticamente. Si está en otro proveedor, Cloudflare te dará un registro CNAME para agregar ahí.

Cualquier cambio futuro: edita los archivos en GitHub (o sube de nuevo) y Cloudflare Pages vuelve a publicar solo.
