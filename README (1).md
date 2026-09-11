# Línea Frontera — sitio

Sitio estático (HTML/CSS/JS puro, sin build). Archivos:
- `index.html` — página principal
- `admin.html` — demo del panel de resultados para clientes
- `styles.css` — estilos compartidos
- `script.js` — menú móvil y pestañas del panel

## Subir a GitHub
1. Crea un repositorio nuevo (puede ser público o privado).
2. Sube estos 5 archivos a la raíz del repositorio (no dentro de una carpeta).

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
