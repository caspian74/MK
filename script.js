/* =========================================================
   Línea Frontera — script compartido
   NOTA sobre cuentas y contenido: todo se guarda en
   localStorage como demostración funcional (cuentas, sesión,
   contenido del sitio, campañas de clientes). Antes de operar
   con clientes y pagos reales, esto debe conectarse a un
   backend real (Cloudflare D1/Workers o Supabase) con
   contraseñas protegidas correctamente — aquí se guardan en
   texto plano solo para efectos de prototipo, y no se
   sincroniza entre dispositivos distintos.
   ========================================================= */

const LF_USERS_KEY = 'lf_users';
const LF_SESSION_KEY = 'lf_session';
const LF_CONTENT_KEY = 'lf_site_content';

const ADMIN_EMAIL = 'admin@lineafrontera.mx';
const ADMIN_PASSWORD = 'frontera2026';

/* ---------- Contenido por defecto de todo el sitio ---------- */
const DEFAULT_CONTENT = {
  hero: {
    kicker: 'Publicidad · Contenido · SEO local en Tijuana',
    title: 'Hagamos que ||más gente compre|| en tu negocio.',
    subtitle: 'Contenido que se ve increíble, publicidad que convierte y SEO local que te encuentra — todo reportado en un panel simple, con números reales.'
  },
  strip: {
    title: 'Contenido con estilo. Resultados con números.',
    text: 'Nos gusta tanto el buen diseño como las hojas de cálculo. Cada campaña combina piezas que se ven increíbles con seguimiento real de ventas, para que no tengas que elegir entre bonito y rentable.'
  },
  services: [
    { title: 'Publicidad con enfoque en ventas', text: 'Campañas en Meta y Google optimizadas para citas y compras, no para alcance. Presupuesto claro y ajustes según lo que sí convierte.' },
    { title: 'Creación de contenido', text: 'Fotografía, video corto y piezas para redes que se ven increíbles y además generan confianza real — pensadas para mover a la gente a comprar.' },
    { title: 'SEO local para vender más', text: 'No solo posicionamos tu ficha de Google: la conectamos con ofertas, reseñas y llamados a la acción para que cada búsqueda se convierta en cliente.' }
  ],
  packages: [
    { name: 'Arranque', price: '$4,900', period: 'MXN / mes', features: ['SEO local y ficha de Google optimizada', 'Gestión de reseñas', '4 piezas de contenido al mes', 'Reporte mensual de resultados'], paymentLink: '', featured: false },
    { name: 'Crecimiento', price: '$9,900', period: 'MXN / mes', features: ['Todo lo de Arranque', 'Campañas de publicidad en Meta y Google', '8 piezas de contenido al mes', 'Panel de KPI con acceso en línea', 'Reporte quincenal + ajustes de campaña'], paymentLink: '', featured: true },
    { name: 'Dominancia', price: '$16,500', period: 'MXN / mes', features: ['Todo lo de Crecimiento', 'Contenido ilimitado dentro de calendario', 'Optimización semanal de campañas', 'Panel de KPI dedicado + reporte semanal', 'Estrategia de expansión a nuevas sucursales'], paymentLink: '', featured: false }
  ],
  testimonials: [
    { quote: 'Aquí va el testimonio de tu primer cliente feliz.', name: 'Tu próximo cliente', business: 'Nombre del negocio' },
    { quote: 'Edita este espacio desde el panel de admin cuando tengas una reseña real.', name: 'Pendiente', business: 'Pendiente' },
    { quote: 'Los testimonios reales generan más confianza que cualquier texto que escribamos nosotros.', name: 'Pendiente', business: 'Pendiente' }
  ],
  faqs: [
    { q: '¿Cuánto tarda en verse resultados?', a: 'La mayoría de nuestros clientes empieza a ver más visitas y contactos en las primeras 2 a 3 semanas de campaña. El SEO local suele tardar un poco más, entre 6 y 10 semanas.' },
    { q: '¿El presupuesto de anuncios está incluido en el precio del paquete?', a: 'No. El precio del paquete es por nuestro trabajo de estrategia, contenido y gestión. El presupuesto de anuncios se paga directo a Meta o Google, para que siempre sepas cuánto se gasta y en qué.' },
    { q: '¿Necesito firmar un contrato de un año?', a: 'No. Trabajamos mes a mes. Si en algún momento quieres pausar o cancelar, solo nos avisas.' },
    { q: '¿Puedo cambiar de paquete después?', a: 'Sí, en cualquier momento. Muchos clientes empiezan en Arranque y suben a Crecimiento cuando ven que el sistema funciona.' }
  ],
  kpi: { visitas: '3,240', clics: '412', citas: '96', roas: '4.1×' },
  contact: { whatsapp: '525632960874', email: 'rcabrerar17@gmail.com', phoneDisplay: '563 296 0874' }
};

function lfGetUsers() { try { return JSON.parse(localStorage.getItem(LF_USERS_KEY)) || []; } catch (e) { return []; } }
function lfSaveUsers(users) { localStorage.setItem(LF_USERS_KEY, JSON.stringify(users)); }
function lfGetSession() { try { return JSON.parse(localStorage.getItem(LF_SESSION_KEY)); } catch (e) { return null; } }
function lfSetSession(session) { localStorage.setItem(LF_SESSION_KEY, JSON.stringify(session)); }
function lfClearSession() { localStorage.removeItem(LF_SESSION_KEY); }
function lfGetContent() {
  try {
    const saved = JSON.parse(localStorage.getItem(LF_CONTENT_KEY));
    return saved || JSON.parse(JSON.stringify(DEFAULT_CONTENT));
  } catch (e) { return JSON.parse(JSON.stringify(DEFAULT_CONTENT)); }
}
function lfSaveContent(content) { localStorage.setItem(LF_CONTENT_KEY, JSON.stringify(content)); }
function lfWaLink(number, text) { return 'https://wa.me/' + number + (text ? ('?text=' + encodeURIComponent(text)) : ''); }
function lfHighlight(str) {
  return String(str).replace(/\|\|(.+?)\|\|/g, '<span class="hl">$1</span>');
}
function defaultCampaignFor(pkgName) {
  const base = { visitas: '0', clics: '0', citas: '0', roas: '0×', gasto: '$0', estatus: 'activo' };
  if (pkgName === 'Crecimiento') return { visitas: '1,800', clics: '210', citas: '48', roas: '3.2×', gasto: '$6,000', estatus: 'activo' };
  if (pkgName === 'Dominancia') return { visitas: '3,240', clics: '412', citas: '96', roas: '4.1×', gasto: '$12,000', estatus: 'activo' };
  return { visitas: '600', clics: '70', citas: '14', roas: '2.1×', gasto: '$2,500', estatus: 'activo' };
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

/* =========================================================
   AUTH.HTML — login / crear cuenta
   ========================================================= */
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
    users.push({
      name, business, email, password, package: pkg,
      status: 'pendiente de pago',
      campaign: defaultCampaignFor(pkg),
      createdAt: new Date().toISOString()
    });
    lfSaveUsers(users);
    lfSetSession({ email, role: 'client', name });
    window.location.href = 'dashboard.html';
  });
}

/* =========================================================
   DASHBOARD.HTML — panel del cliente
   ========================================================= */
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

  if (user && user.campaign) {
    const c = user.campaign;
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const cards = document.querySelectorAll('.dash-main .admin-kpi-cards .kpi-card .value');
    if (cards.length >= 4) {
      cards[0].textContent = c.visitas;
      cards[1].textContent = c.clics;
      cards[2].textContent = c.citas;
      cards[3].textContent = c.roas;
    }
  }
}

/* =========================================================
   ÍNDICE — construir la página desde el contenido
   ========================================================= */
const heroTitleEl = document.getElementById('heroTitle');
if (heroTitleEl) {
  const content = lfGetContent();

  document.getElementById('heroKicker').textContent = content.hero.kicker;
  heroTitleEl.innerHTML = lfHighlight(content.hero.title);
  document.getElementById('heroSubtitle').textContent = content.hero.subtitle;
  document.getElementById('stripTitle').textContent = content.strip.title;
  document.getElementById('stripText').textContent = content.strip.text;

  document.getElementById('kpiVisitas').textContent = content.kpi.visitas;
  document.getElementById('kpiClics').textContent = content.kpi.clics;
  document.getElementById('kpiCitas').textContent = content.kpi.citas;
  document.getElementById('kpiRoas').textContent = content.kpi.roas;

  const waHref = lfWaLink(content.contact.whatsapp, 'Hola, quiero información sobre Línea Frontera');
  ['heroWaBtn', 'finalWaBtn', 'stickyWaBtn'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = waHref;
  });
  const mailHref = 'mailto:' + content.contact.email + '?subject=' + encodeURIComponent('Quiero información sobre Línea Frontera') + '&body=' + encodeURIComponent('Hola, me interesa saber más sobre sus servicios.');
  const heroEmailBtn = document.getElementById('heroEmailBtn'); if (heroEmailBtn) heroEmailBtn.href = mailHref;
  const finalEmailBtn = document.getElementById('finalEmailBtn'); if (finalEmailBtn) finalEmailBtn.href = mailHref;
  const finalEmailLabel = document.getElementById('finalEmailLabel'); if (finalEmailLabel) finalEmailLabel.textContent = content.contact.email;
  const footerPhoneLink = document.getElementById('footerPhoneLink'); if (footerPhoneLink) footerPhoneLink.href = 'tel:+' + content.contact.whatsapp;
  const footerPhoneLabel = document.getElementById('footerPhoneLabel'); if (footerPhoneLabel) footerPhoneLabel.textContent = content.contact.phoneDisplay;

  // Servicios
  const servicesGrid = document.getElementById('servicesGrid');
  if (servicesGrid) {
    servicesGrid.innerHTML = content.services.map((s) => `
      <div class="service"><h3>${s.title}</h3><p>${s.text}</p></div>
    `).join('');
  }

  // Paquetes (con compra real vía link de pago, o WhatsApp como respaldo)
  const pkgGrid = document.getElementById('pkgGrid');
  if (pkgGrid) {
    pkgGrid.innerHTML = content.packages.map((p) => {
      const buyHref = p.paymentLink && p.paymentLink.trim()
        ? p.paymentLink.trim()
        : lfWaLink(content.contact.whatsapp, `Hola, quiero comprar el paquete ${p.name} (${p.price} ${p.period})`);
      return `
      <div class="pkg ${p.featured ? 'featured' : ''}">
        <h3>${p.name}</h3>
        <div class="price">${p.price} <small>${p.period}</small></div>
        <ul>${p.features.map((f) => `<li>${f}</li>`).join('')}</ul>
        <div class="pkg-actions">
          <a class="btn ${p.featured ? 'btn-primary' : 'btn-outline'}" href="${buyHref}" target="_blank" rel="noopener">Comprar ${p.name}</a>
          <a class="pkg-secondary" href="auth.html?modo=crear&paquete=${encodeURIComponent(p.name)}">o crear cuenta primero</a>
        </div>
      </div>`;
    }).join('');
  }

  // Testimonios
  const testiGrid = document.getElementById('testiGrid');
  if (testiGrid) {
    testiGrid.innerHTML = content.testimonials.map((t) => `
      <div class="testi">
        <p class="quote">"${t.quote}"</p>
        <p class="who"><strong>${t.name}</strong> — ${t.business}</p>
      </div>
    `).join('');
  }

  // FAQ
  const faqList = document.getElementById('faqList');
  if (faqList) {
    faqList.innerHTML = content.faqs.map((f, i) => `
      <div class="faq-item" id="faqItem${i}">
        <button type="button" class="faq-q" data-faq="${i}"><span>${f.q}</span><span class="plus">+</span></button>
        <div class="faq-a"><p>${f.a}</p></div>
      </div>
    `).join('');
    faqList.querySelectorAll('.faq-q').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.getElementById('faqItem' + btn.dataset.faq).classList.toggle('open');
      });
    });
  }
}

/* =========================================================
   ADMIN.HTML — tabla de clientes + edición de campañas
   ========================================================= */
const clientsTableBody = document.getElementById('clientsTableBody');
function renderClientsTable() {
  if (!clientsTableBody) return;
  const users = lfGetUsers();
  const countEl = document.getElementById('resumenClientCount');
  if (countEl) countEl.textContent = users.length;

  if (!users.length) {
    clientsTableBody.innerHTML = '<tr><td colspan="6" style="color:var(--muted);">Todavía no hay cuentas creadas.</td></tr>';
    return;
  }
  clientsTableBody.innerHTML = users.map((u, i) => `
    <tr>
      <td>${u.name}<br><span style="color:var(--muted); font-size:0.78rem;">${u.email}</span></td>
      <td>${u.business}</td>
      <td>${u.package}</td>
      <td><span class="status ${(u.campaign?.estatus || 'activo')}">${u.campaign?.estatus || 'activo'}</span></td>
      <td>${u.campaign?.roas || '—'}</td>
      <td><button type="button" class="btn-ghost" data-edit-client="${i}">Editar campaña</button></td>
    </tr>
    <tr class="edit-row" id="editRow${i}" style="display:none;">
      <td colspan="6">
        <div class="edit-grid">
          <div><label>Paquete</label>
            <select data-field="package" data-idx="${i}">
              <option ${u.package === 'Arranque' ? 'selected' : ''}>Arranque</option>
              <option ${u.package === 'Crecimiento' ? 'selected' : ''}>Crecimiento</option>
              <option ${u.package === 'Dominancia' ? 'selected' : ''}>Dominancia</option>
              <option ${u.package === 'Aún no sé' ? 'selected' : ''}>Aún no sé</option>
            </select>
          </div>
          <div><label>Estatus</label>
            <select data-field="estatus" data-idx="${i}">
              <option value="activo" ${u.campaign?.estatus === 'activo' ? 'selected' : ''}>Activo</option>
              <option value="pausado" ${u.campaign?.estatus === 'pausado' ? 'selected' : ''}>Pausado</option>
              <option value="nueva" ${u.campaign?.estatus === 'nueva' ? 'selected' : ''}>Nueva / sin iniciar</option>
            </select>
          </div>
          <div><label>Visitas a ficha</label><input type="text" data-field="visitas" data-idx="${i}" value="${u.campaign?.visitas || ''}"></div>
          <div><label>Clics a WhatsApp</label><input type="text" data-field="clics" data-idx="${i}" value="${u.campaign?.clics || ''}"></div>
          <div><label>Citas agendadas</label><input type="text" data-field="citas" data-idx="${i}" value="${u.campaign?.citas || ''}"></div>
          <div><label>Retorno (ROAS)</label><input type="text" data-field="roas" data-idx="${i}" value="${u.campaign?.roas || ''}"></div>
          <div><label>Gasto en anuncios</label><input type="text" data-field="gasto" data-idx="${i}" value="${u.campaign?.gasto || ''}"></div>
        </div>
        <button type="button" class="btn btn-primary btn-sm" data-save-client="${i}">Guardar campaña</button>
        <button type="button" class="btn-danger" data-delete-client="${i}" style="margin-left:14px;">Eliminar cuenta</button>
      </td>
    </tr>
  `).join('');

  clientsTableBody.querySelectorAll('[data-edit-client]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const row = document.getElementById('editRow' + btn.dataset.editClient);
      row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
    });
  });
  clientsTableBody.querySelectorAll('[data-save-client]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.saveClient);
      const users = lfGetUsers();
      const row = document.getElementById('editRow' + idx);
      const fields = row.querySelectorAll('[data-field]');
      const updated = { ...users[idx].campaign };
      fields.forEach((f) => {
        if (f.dataset.field === 'package') { users[idx].package = f.value; }
        else { updated[f.dataset.field] = f.value; }
      });
      users[idx].campaign = updated;
      lfSaveUsers(users);
      renderClientsTable();
    });
  });
  clientsTableBody.querySelectorAll('[data-delete-client]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.deleteClient);
      const users = lfGetUsers();
      if (confirm(`¿Eliminar la cuenta de ${users[idx].name}? Esta acción no se puede deshacer.`)) {
        users.splice(idx, 1);
        lfSaveUsers(users);
        renderClientsTable();
      }
    });
  });
}
renderClientsTable();

/* =========================================================
   ADMIN.HTML — editor monstruoso del sitio
   ========================================================= */
const editorSections = document.getElementById('editorSections');
if (editorSections) {
  let editorState = lfGetContent();

  function buildEditor() {
    editorSections.innerHTML = `
      <div class="editor-section open">
        <button type="button" class="editor-section-head" data-toggle-self>
          <h3>Encabezado principal (hero)</h3><span class="plus">+</span>
        </button>
        <div class="editor-section-body">
          <label>Texto pequeño arriba del título</label>
          <input data-path="hero.kicker" value="${editorState.hero.kicker}">
          <label>Título grande (usa ||texto|| para resaltar en rosa)</label>
          <input data-path="hero.title" value="${editorState.hero.title}">
          <label>Subtítulo</label>
          <textarea data-path="hero.subtitle" rows="3">${editorState.hero.subtitle}</textarea>
        </div>
      </div>

      <div class="editor-section">
        <button type="button" class="editor-section-head" data-toggle-self>
          <h3>Franja de mensaje ("Contenido con estilo…")</h3><span class="plus">+</span>
        </button>
        <div class="editor-section-body">
          <label>Título</label>
          <input data-path="strip.title" value="${editorState.strip.title}">
          <label>Texto</label>
          <textarea data-path="strip.text" rows="3">${editorState.strip.text}</textarea>
        </div>
      </div>

      <div class="editor-section">
        <button type="button" class="editor-section-head" data-toggle-self>
          <h3>Contacto</h3><span class="plus">+</span>
        </button>
        <div class="editor-section-body">
          <label>Número de WhatsApp (solo dígitos, con código de país 52)</label>
          <input data-path="contact.whatsapp" value="${editorState.contact.whatsapp}">
          <label>Correo</label>
          <input data-path="contact.email" value="${editorState.contact.email}">
          <label>Teléfono para mostrar</label>
          <input data-path="contact.phoneDisplay" value="${editorState.contact.phoneDisplay}">
        </div>
      </div>

      <div class="editor-section">
        <button type="button" class="editor-section-head" data-toggle-self>
          <h3>Servicios (3 tarjetas)</h3><span class="plus">+</span>
        </button>
        <div class="editor-section-body">
          ${editorState.services.map((s, i) => `
            <div class="editor-subcard">
              <div class="editor-subcard-title">Servicio ${i + 1}</div>
              <label>Título</label><input data-path="services.${i}.title" value="${s.title}">
              <label>Texto</label><textarea data-path="services.${i}.text" rows="2">${s.text}</textarea>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="editor-section">
        <button type="button" class="editor-section-head" data-toggle-self>
          <h3>Paquetes y precios (con compra real)</h3><span class="plus">+</span>
        </button>
        <div class="editor-section-body">
          ${editorState.packages.map((p, i) => `
            <div class="editor-subcard">
              <div class="editor-subcard-title">Paquete ${i + 1}</div>
              <label>Nombre</label><input data-path="packages.${i}.name" value="${p.name}">
              <label>Precio</label><input data-path="packages.${i}.price" value="${p.price}">
              <label>Periodo (ej. "MXN / mes")</label><input data-path="packages.${i}.period" value="${p.period}">
              <label>Beneficios (uno por línea)</label>
              <textarea data-path-list="packages.${i}.features" rows="5">${p.features.join('\n')}</textarea>
              <label>Link de pago (Stripe Payment Link o Mercado Pago) — déjalo vacío para usar WhatsApp</label>
              <input data-path="packages.${i}.paymentLink" value="${p.paymentLink || ''}" placeholder="https://buy.stripe.com/...">
              <label style="display:flex; align-items:center; gap:8px; margin-top:12px;">
                <input type="checkbox" data-path-bool="packages.${i}.featured" style="width:auto;" ${p.featured ? 'checked' : ''}> Marcar como "más elegido"
              </label>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="editor-section">
        <button type="button" class="editor-section-head" data-toggle-self>
          <h3>Testimonios</h3><span class="plus">+</span>
        </button>
        <div class="editor-section-body">
          ${editorState.testimonials.map((t, i) => `
            <div class="editor-subcard">
              <div class="editor-subcard-title">Testimonio ${i + 1} <button type="button" class="btn-danger" data-remove="testimonials.${i}" style="float:right;">Quitar</button></div>
              <label>Cita</label><textarea data-path="testimonials.${i}.quote" rows="2">${t.quote}</textarea>
              <label>Nombre</label><input data-path="testimonials.${i}.name" value="${t.name}">
              <label>Negocio</label><input data-path="testimonials.${i}.business" value="${t.business}">
            </div>
          `).join('')}
          <button type="button" class="btn btn-outline btn-sm" data-add="testimonials" style="margin-top:14px;">+ Agregar testimonio</button>
        </div>
      </div>

      <div class="editor-section">
        <button type="button" class="editor-section-head" data-toggle-self>
          <h3>Preguntas frecuentes</h3><span class="plus">+</span>
        </button>
        <div class="editor-section-body">
          ${editorState.faqs.map((f, i) => `
            <div class="editor-subcard">
              <div class="editor-subcard-title">Pregunta ${i + 1} <button type="button" class="btn-danger" data-remove="faqs.${i}" style="float:right;">Quitar</button></div>
              <label>Pregunta</label><input data-path="faqs.${i}.q" value="${f.q}">
              <label>Respuesta</label><textarea data-path="faqs.${i}.a" rows="2">${f.a}</textarea>
            </div>
          `).join('')}
          <button type="button" class="btn btn-outline btn-sm" data-add="faqs" style="margin-top:14px;">+ Agregar pregunta</button>
        </div>
      </div>

      <div class="editor-section">
        <button type="button" class="editor-section-head" data-toggle-self>
          <h3>Panel de KPI de ejemplo (vista pública)</h3><span class="plus">+</span>
        </button>
        <div class="editor-section-body">
          <label>Visitas a la ficha</label><input data-path="kpi.visitas" value="${editorState.kpi.visitas}">
          <label>Clics a WhatsApp</label><input data-path="kpi.clics" value="${editorState.kpi.clics}">
          <label>Citas agendadas</label><input data-path="kpi.citas" value="${editorState.kpi.citas}">
          <label>Retorno por peso invertido</label><input data-path="kpi.roas" value="${editorState.kpi.roas}">
        </div>
      </div>
    `;

    // Toggle de secciones
    editorSections.querySelectorAll('[data-toggle-self]').forEach((btn) => {
      btn.addEventListener('click', () => btn.closest('.editor-section').classList.toggle('open'));
    });

    // Inputs de texto simples (data-path)
    editorSections.querySelectorAll('[data-path]').forEach((el) => {
      el.addEventListener('input', () => {
        setByPath(editorState, el.dataset.path, el.value);
      });
    });
    // Listas (una por línea)
    editorSections.querySelectorAll('[data-path-list]').forEach((el) => {
      el.addEventListener('input', () => {
        setByPath(editorState, el.dataset.pathList, el.value.split('\n').map((v) => v.trim()).filter(Boolean));
      });
    });
    // Checkboxes
    editorSections.querySelectorAll('[data-path-bool]').forEach((el) => {
      el.addEventListener('change', () => {
        setByPath(editorState, el.dataset.pathBool, el.checked);
      });
    });
    // Agregar item a un arreglo
    editorSections.querySelectorAll('[data-add]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.add;
        if (key === 'testimonials') editorState.testimonials.push({ quote: 'Nuevo testimonio…', name: 'Nombre', business: 'Negocio' });
        if (key === 'faqs') editorState.faqs.push({ q: 'Nueva pregunta', a: 'Respuesta…' });
        buildEditor();
      });
    });
    // Quitar item de un arreglo
    editorSections.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const [key, idx] = btn.dataset.remove.split('.');
        editorState[key].splice(Number(idx), 1);
        buildEditor();
      });
    });
  }

  function setByPath(obj, path, value) {
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      cur = cur[isNaN(parts[i]) ? parts[i] : Number(parts[i])];
    }
    cur[isNaN(parts[parts.length - 1]) ? parts[parts.length - 1] : Number(parts[parts.length - 1])] = value;
  }

  buildEditor();

  document.getElementById('siteEditorForm').addEventListener('submit', (e) => {
    e.preventDefault();
    lfSaveContent(editorState);
    document.getElementById('editorSaved').textContent = 'Cambios guardados. Ábrelos en la página principal para verlos.';
    document.getElementById('jsonAdvancedBox').value = JSON.stringify(editorState, null, 2);
  });

  document.getElementById('resetContentBtn').addEventListener('click', () => {
    if (confirm('¿Restablecer todos los textos, precios y paquetes a los valores originales?')) {
      editorState = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
      buildEditor();
    }
  });

  // Modo avanzado JSON
  const jsonBox = document.getElementById('jsonAdvancedBox');
  jsonBox.value = JSON.stringify(editorState, null, 2);
  document.getElementById('applyJsonBtn').addEventListener('click', () => {
    try {
      const parsed = JSON.parse(jsonBox.value);
      editorState = parsed;
      lfSaveContent(editorState);
      buildEditor();
      document.getElementById('jsonSaved').textContent = 'JSON aplicado y guardado.';
    } catch (err) {
      document.getElementById('jsonSaved').textContent = 'Ese JSON no es válido: revisa comas y llaves.';
    }
  });
  document.querySelectorAll('[data-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => document.getElementById(btn.dataset.toggle).classList.toggle('open'));
  });
}
