/* =========================================================
   Línea Frontera — script compartido
   NOTA: las cuentas y la sesión se guardan en localStorage
   como demostración funcional. Antes de operar con clientes
   reales, esto debe conectarse a un backend real (por ejemplo
   Cloudflare D1 / Workers o Supabase) con contraseñas
   protegidas correctamente — aquí se guardan en texto plano
   solo para efectos de prototipo.
   ========================================================= */

const LF_USERS_KEY = 'lf_users';
const LF_SESSION_KEY = 'lf_session';
const LF_CONTENT_KEY = 'lf_site_content';

const ADMIN_EMAIL = 'admin@lineafrontera.mx';
const ADMIN_PASSWORD = 'frontera2026';

function lfGetUsers() {
  try { return JSON.parse(localStorage.getItem(LF_USERS_KEY)) || []; }
  catch (e) { return []; }
}
function lfSaveUsers(users) {
  localStorage.setItem(LF_USERS_KEY, JSON.stringify(users));
}
function lfGetSession() {
  try { return JSON.parse(localStorage.getItem(LF_SESSION_KEY)); }
  catch (e) { return null; }
}
function lfSetSession(session) {
  localStorage.setItem(LF_SESSION_KEY, JSON.stringify(session));
}
function lfClearSession() {
  localStorage.removeItem(LF_SESSION_KEY);
}

/* ---------- Menú móvil (index.html) ---------- */
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
}

/* ---------- Tabs del panel de administración (admin.html) ---------- */
const tabButtons = document.querySelectorAll('.tab-btn');
const panelViews = document.querySelectorAll('.admin-panel-view');
tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabButtons.forEach((b) => b.classList.remove('active'));
    panelViews.forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.target).classList.add('active');
  });
});

/* ---------- Guard de sesión para dashboard.html y admin.html ---------- */
const requiredRole = document.body.dataset.require;
if (requiredRole) {
  const session = lfGetSession();
  if (!session || session.role !== requiredRole) {
    window.location.href = 'auth.html';
  }
}

/* ---------- Botones de cerrar sesión ---------- */
document.querySelectorAll('#logoutBtn').forEach((btn) => {
  btn.addEventListener('click', () => {
    lfClearSession();
    window.location.href = 'index.html';
  });
});

/* ---------- auth.html: login / crear cuenta ---------- */
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');
authTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    authTabs.forEach((t) => t.classList.remove('active'));
    authForms.forEach((f) => f.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab + 'Form').classList.add('active');
  });
});

// Si llegan con ?modo=crear o ?paquete=X, abrir directo la pestaña de crear cuenta
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('modo') === 'crear') {
  const signupTab = document.querySelector('.auth-tab[data-tab="signup"]');
  if (signupTab) signupTab.click();
}
if (urlParams.get('paquete')) {
  const pkgSelect = document.getElementById('signupPackage');
  if (pkgSelect) pkgSelect.value = urlParams.get('paquete');
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      lfSetSession({ email, role: 'admin', name: 'Administrador' });
      window.location.href = 'admin.html';
      return;
    }

    const users = lfGetUsers();
    const user = users.find((u) => u.email === email && u.password === password);
    if (user) {
      lfSetSession({ email: user.email, role: 'client', name: user.name });
      window.location.href = 'dashboard.html';
    } else {
      errorEl.textContent = 'Correo o contraseña incorrectos.';
    }
  });
}

const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const business = document.getElementById('signupBusiness').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const password = document.getElementById('signupPassword').value;
    const pkg = document.getElementById('signupPackage').value;
    const errorEl = document.getElementById('signupError');

    const users = lfGetUsers();
    if (users.some((u) => u.email === email)) {
      errorEl.textContent = 'Ya existe una cuenta con ese correo. Inicia sesión.';
      return;
    }

    users.push({ name, business, email, password, package: pkg, createdAt: new Date().toISOString() });
    lfSaveUsers(users);
    lfSetSession({ email, role: 'client', name });
    window.location.href = 'dashboard.html';
  });
}

/* ---------- dashboard.html: datos del cliente ---------- */
const clientNameEl = document.getElementById('clientName');
if (clientNameEl) {
  const session = lfGetSession();
  const users = lfGetUsers();
  const user = users.find((u) => u.email === session?.email);
  clientNameEl.textContent = (user && user.name) || session?.name || 'cliente';
  const pkgEl = document.getElementById('clientPackage');
  const bizEl = document.getElementById('clientBusiness');
  if (pkgEl) pkgEl.textContent = (user && user.package) || 'Sin paquete asignado';
  if (bizEl) bizEl.textContent = (user && user.business) || '—';
}

/* ---------- admin.html: tabla de clientes registrados ---------- */
const clientsTableBody = document.getElementById('clientsTableBody');
if (clientsTableBody) {
  const users = lfGetUsers();
  if (users.length) {
    clientsTableBody.innerHTML = users.map((u) => `
      <tr>
        <td>${u.name}</td>
        <td>${u.business}</td>
        <td>${u.email}</td>
        <td>${u.package}</td>
        <td>${new Date(u.createdAt).toLocaleDateString('es-MX')}</td>
      </tr>
    `).join('');
  }
}

/* ---------- admin.html: editor del sitio ---------- */
const siteEditorForm = document.getElementById('siteEditorForm');
function lfGetSiteContent() {
  try { return JSON.parse(localStorage.getItem(LF_CONTENT_KEY)) || {}; }
  catch (e) { return {}; }
}
if (siteEditorForm) {
  const current = lfGetSiteContent();
  const fields = {
    editHeroTitle: 'heroTitle',
    editHeroSubtitle: 'heroSubtitle',
    editPriceArranque: 'priceArranque',
    editPriceCrecimiento: 'priceCrecimiento',
    editPriceDominancia: 'priceDominancia',
    editKpiVisitas: 'kpiVisitas',
    editKpiClics: 'kpiClics',
    editKpiCitas: 'kpiCitas',
    editKpiRoas: 'kpiRoas',
  };
  const defaults = {
    heroTitle: 'No vendemos posts. Vendemos más ventas.',
    heroSubtitle: 'Línea Frontera diseña y opera campañas de publicidad, contenido y SEO local para clínicas y negocios en Tijuana — todo medido en un panel de KPI claro, no en likes.',
    priceArranque: '$4,900', priceCrecimiento: '$9,900', priceDominancia: '$16,500',
    kpiVisitas: '3,240', kpiClics: '412', kpiCitas: '96', kpiRoas: '4.1×',
  };
  Object.entries(fields).forEach(([inputId, key]) => {
    const el = document.getElementById(inputId);
    if (el) el.value = current[key] !== undefined ? current[key] : defaults[key];
  });

  siteEditorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const content = {};
    Object.entries(fields).forEach(([inputId, key]) => {
      content[key] = document.getElementById(inputId).value;
    });
    localStorage.setItem(LF_CONTENT_KEY, JSON.stringify(content));
    document.getElementById('editorSaved').textContent = 'Cambios guardados. Ábrelos en la página principal para verlos.';
  });
}

/* ---------- index.html: aplicar contenido guardado por el admin ---------- */
const heroTitleEl = document.getElementById('heroTitle');
if (heroTitleEl) {
  const content = lfGetSiteContent();
  if (content.heroTitle) heroTitleEl.textContent = content.heroTitle;
  if (content.heroSubtitle) document.getElementById('heroSubtitle').textContent = content.heroSubtitle;
  if (content.priceArranque) document.getElementById('priceArranque').textContent = content.priceArranque;
  if (content.priceCrecimiento) document.getElementById('priceCrecimiento').textContent = content.priceCrecimiento;
  if (content.priceDominancia) document.getElementById('priceDominancia').textContent = content.priceDominancia;
  if (content.kpiVisitas) document.getElementById('kpiVisitas').textContent = content.kpiVisitas;
  if (content.kpiClics) document.getElementById('kpiClics').textContent = content.kpiClics;
  if (content.kpiCitas) document.getElementById('kpiCitas').textContent = content.kpiCitas;
  if (content.kpiRoas) document.getElementById('kpiRoas').textContent = content.kpiRoas;
}
