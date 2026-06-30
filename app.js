/* ============================================
   HERITAGE PULSE — app logic
   Single-file vanilla JS. No build step. Works on GitHub Pages.
   ============================================ */

/* ---------- STATUS BAR (time + signal/wifi/battery icons) ---------- */
const STATUS_ICONS = `
  <div class="sb-icons">
    <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
      <rect x="0" y="7" width="3" height="5" rx="0.5" fill="currentColor"/>
      <rect x="4.5" y="5" width="3" height="7" rx="0.5" fill="currentColor"/>
      <rect x="9" y="3" width="3" height="9" rx="0.5" fill="currentColor"/>
      <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="currentColor"/>
    </svg>
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
      <path d="M8 9.8a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6Z" fill="currentColor"/>
      <path d="M4.6 7.3a4.8 4.8 0 0 1 6.8 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M2 4.6a8.6 8.6 0 0 1 12 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    </svg>
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
      <rect x="0.75" y="0.75" width="20.5" height="10.5" rx="2.5" stroke="currentColor" stroke-width="1.1" opacity="0.4"/>
      <rect x="2.2" y="2.2" width="17.6" height="7.6" rx="1.4" fill="currentColor"/>
      <rect x="22" y="4" width="1.6" height="4" rx="0.8" fill="currentColor" opacity="0.4"/>
    </svg>
  </div>`;

function buildStatusBars(){
  // Phone 2 (authority dashboard) — single static screen, not an .app-view
  document.querySelectorAll('.iphone .screen').forEach(screen => {
    if (screen.id === 'app-screen') return; // handled per-view below
    if (screen.querySelector(':scope > .statusbar')) return;
    const island = screen.querySelector(':scope > .dynamic-island');
    const bar = document.createElement('div');
    bar.className = 'statusbar';
    bar.innerHTML = `<span class="sb-time">9:41</span>${STATUS_ICONS}`;
    if (island) island.insertAdjacentElement('afterend', bar);
    else screen.insertBefore(bar, screen.firstChild);
  });
  // Phone 1 — each .app-view needs its own status bar since views are toggled independently
  document.querySelectorAll('.app-view').forEach(view => {
    if (view.querySelector(':scope > .statusbar')) return;
    const darkViews = ['login', 'scan'];
    const onDark = darkViews.includes(view.dataset.view);
    const bar = document.createElement('div');
    bar.className = 'statusbar' + (onDark ? ' on-dark' : '');
    bar.innerHTML = `<span class="sb-time">9:41</span>${STATUS_ICONS}`;
    view.insertBefore(bar, view.firstChild);
  });
}

function tickClock(){
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2,'0');
  const time = `${h % 12 === 0 ? 12 : h % 12}:${m}`;
  document.querySelectorAll('.sb-time').forEach(el => el.textContent = time);
}

/* ---------- ROUTER ---------- */
let currentView = 'login';

function go(view){
  // stop camera if leaving scan view
  if (currentView === 'scan' && view !== 'scan') stopCamera();

  const views = document.querySelectorAll('.app-view');
  views.forEach(v => v.style.display = 'none');

  const target = document.querySelector(`.app-view[data-view="${view}"]`);
  if (target) target.style.display = 'flex';
  currentView = view;

  // reset scroll position on the entering view
  const body = target ? target.querySelector('.screen-body') : null;
  if (body) body.scrollTop = 0;

  // lazy actions per view
  if (view === 'home') setTimeout(() => homeMap && homeMap.invalidateSize(), 50);
  if (view === 'scan') setTimeout(startScanSequence, 80);

  window.location.hash = view;
}

// restore from hash on load (so links/back work)
window.addEventListener('DOMContentLoaded', () => {
  buildStatusBars();
  tickClock();
  setInterval(tickClock, 15000);

  const initial = (window.location.hash || '').replace('#','');
  const valid = initial && document.querySelector(`.app-view[data-view="${initial}"]`);
  go(valid ? initial : 'login');
  buildWeekChart('week-chart');
  buildWeekChart('week-chart-2');
  initHomeMap();
  initAuthorityMap();
  initReconSlider();
});

/* ---------- TOAST ---------- */
let toastTimer;
function showToast(msg){
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ---------- PERMISSIONS TOGGLES ---------- */
function togglePerm(btn){
  btn.classList.toggle('on');
}

/* ---------- REPORT FORM INTERACTIONS ---------- */
function selectChip(el){
  const group = el.parentElement;
  group.querySelectorAll('.dtype-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}
function selectSeverity(el){
  const group = el.parentElement;
  group.querySelectorAll('.sev-btn').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}
function updateCharCount(el, suffix){
  const id = suffix ? `char-count-${suffix}` : 'char-count-carmo';
  const span = document.getElementById(id);
  if (span) span.textContent = el.value.length;
}

/* ---------- MONUMENT HERO CAROUSEL ---------- */
const heroState = { carmo: 0 };
function heroNav(key, dir){
  const track = document.getElementById(`hero-track-${key}`);
  const dots = document.getElementById(`hero-dots-${key}`)?.children;
  if (!track || !dots) return;
  const max = track.children.length - 1;
  let idx = heroState[key] + dir;
  if (idx < 0) idx = max;
  if (idx > max) idx = 0;
  heroState[key] = idx;
  track.style.transform = `translateX(-${idx * 100}%)`;
  Array.from(dots).forEach((d,i) => d.classList.toggle('active', i === idx));
}
function toggleVideo(badge){
  // no-op: video carousel slide was removed; kept as stub in case
  // any markup still calls onclick from cached browser views.
}

/* ---------- MISSIONS BOTTOM SHEET ---------- */
function openMissions(){
  document.getElementById('missions-overlay').classList.add('show');
}
function closeMissions(){
  document.getElementById('missions-overlay').classList.remove('show');
}

/* ---------- WEEKLY BAR CHART (real-ish randomized but seeded data) ---------- */
function buildWeekChart(elId){
  const el = document.getElementById(elId);
  if (!el) return;
  const days = ['M','T','W','T','F','S','S'];
  // seeded "real" looking data — critical / warning / monitored stacked
  const data = [
    [2,1,2],[3,2,1],[2,3,2],[4,3,2],[3,3,3],[4,4,3],[3,2,2]
  ];
  el.innerHTML = '';
  data.forEach((stack, i) => {
    const total = stack.reduce((a,b)=>a+b,0);
    const maxTotal = 11;
    const col = document.createElement('div');
    col.className = 'week-col';

    const bar = document.createElement('div');
    bar.className = 'week-stack';
    bar.style.height = `${(total/maxTotal)*100}%`;

    const colors = ['var(--critical)', 'var(--warning)', 'var(--primary-light)'];
    stack.forEach((v, si) => {
      const seg = document.createElement('div');
      seg.style.height = `${(v/total)*100}%`;
      seg.style.background = colors[si];
      bar.appendChild(seg);
    });

    const label = document.createElement('div');
    label.className = 'week-day';
    label.textContent = days[i];

    col.appendChild(bar);
    col.appendChild(label);
    el.appendChild(col);
  });
}

/* ============================================
   LEAFLET MAPS — real Porto coordinates
   ============================================ */
const PORTO_SITES = [
  { name: 'Torre dos Clérigos', lat: 41.1456, lng: -8.6147, status: 'warning', view: 'monument-carmo' },
  { name: 'Igreja do Carmo', lat: 41.1478, lng: -8.6125, status: 'monitored', view: 'monument-igreja' },
  { name: 'Casa da Rua das Flores', lat: 41.1423, lng: -8.6138, status: 'critical', view: 'monument-carmo' },
  { name: 'Sé do Porto', lat: 41.1430, lng: -8.6109, status: 'monitored', view: null },
  { name: 'Palácio da Bolsa', lat: 41.1409, lng: -8.6157, status: 'warning', view: null },
  { name: 'Ribeira waterfront', lat: 41.1401, lng: -8.6118, status: 'monitored', view: null },
  { name: 'Capela das Almas', lat: 41.1472, lng: -8.6066, status: 'monitored', view: null },
];

function statusColor(status){
  if (status === 'critical') return '#D64545';
  if (status === 'warning') return '#E0A030';
  return '#5B6EF5';
}

function makePin(status){
  const color = statusColor(status);
  const isAlert = status !== 'monitored';
  const html = `
    <div style="position:relative; width:30px; height:38px;">
      <svg width="30" height="38" viewBox="0 0 30 38" fill="none">
        <path d="M15 37C15 37 28 22.8 28 14.5C28 6.49 22.18 1 15 1C7.82 1 2 6.49 2 14.5C2 22.8 15 37 15 37Z"
          fill="${color}" stroke="#fff" stroke-width="2"/>
      </svg>
      <div style="position:absolute; top:7px; left:0; right:0; text-align:center; color:#fff; font-size:13px; font-weight:800;">
        ${isAlert ? '!' : '✓'}
      </div>
    </div>`;
  return L.divIcon({ html, className:'', iconSize:[30,38], iconAnchor:[15,37], popupAnchor:[0,-34] });
}

let homeMap, authorityMap;

function buildMap(containerId, { interactive }){
  const map = L.map(containerId, {
    zoomControl: false,
    attributionControl: false,
    dragging: interactive,
    scrollWheelZoom: false,
    doubleClickZoom: interactive,
    boxZoom: false,
    keyboard: false,
    tap: interactive,
  }).setView([41.1435, -8.6125], 15.4);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
  }).addTo(map);

  PORTO_SITES.forEach(site => {
    const marker = L.marker([site.lat, site.lng], { icon: makePin(site.status) }).addTo(map);
    marker.bindPopup(`<strong>${site.name}</strong>`, { closeButton:false, offset:[0,-4] });
    marker.on('click', () => {
      if (site.view) {
        go(site.view);
      } else {
        marker.openPopup();
      }
    });
  });

  return map;
}

function initHomeMap(){
  if (!document.getElementById('home-map')) return;
  homeMap = buildMap('home-map', { interactive: true });
  setTimeout(() => homeMap.invalidateSize(), 200);
}
function initAuthorityMap(){
  if (!document.getElementById('authority-map')) return;
  authorityMap = buildMap('authority-map', { interactive: true });
  setTimeout(() => authorityMap.invalidateSize(), 200);
}

/* ============================================
   RECONSTRUCTION SLIDER (before/after drag)
   ============================================ */
function initReconSlider(){
  const wrap = document.getElementById('recon-compare');
  const handle = document.getElementById('recon-handle');
  const before = document.getElementById('recon-before');
  if (!wrap || !handle || !before) return;

  let dragging = false;

  function setSplit(clientX){
    const rect = wrap.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(4, Math.min(96, pct));
    wrap.style.setProperty('--split', pct + '%');
  }

  handle.addEventListener('pointerdown', (e) => { dragging = true; handle.setPointerCapture(e.pointerId); });
  window.addEventListener('pointermove', (e) => { if (dragging) setSplit(e.clientX); });
  window.addEventListener('pointerup', () => dragging = false);

  wrap.addEventListener('click', (e) => {
    if (e.target === handle) return;
    setSplit(e.clientX);
  });
}

/* ============================================
   CAMERA / SCAN — real getUserMedia feed
   ============================================ */
let camStream = null;
let scanTimer = null;

async function startCamera(){
  const video = document.getElementById('cam-video');
  const fallback = document.getElementById('cam-fallback');
  if (!video) return;
  try {
    camStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false
    });
    video.srcObject = camStream;
    video.style.display = 'block';
    fallback.style.display = 'none';
  } catch (err) {
    console.warn('Camera unavailable:', err);
    video.style.display = 'none';
    fallback.style.display = 'flex';
  }
}

function stopCamera(){
  if (camStream){
    camStream.getTracks().forEach(t => t.stop());
    camStream = null;
  }
  clearTimeout(scanTimer);
  const scanline = document.getElementById('cam-scanline');
  const result = document.getElementById('cam-result');
  if (scanline) scanline.classList.remove('active');
  if (result) result.classList.remove('show');
}

function stopCameraAndGo(view){
  stopCamera();
  go(view);
}

function startScanSequence(){
  const scanline = document.getElementById('cam-scanline');
  const result = document.getElementById('cam-result');
  const statusText = document.getElementById('cam-status-text');
  if (!scanline) return;

  result.classList.remove('show');
  scanline.classList.add('active');
  statusText.innerHTML = '<i class="dot-live"></i> Scanning…';

  startCamera();

  clearTimeout(scanTimer);
  scanTimer = setTimeout(() => {
    scanline.classList.remove('active');
    statusText.innerHTML = '<i class="dot-ready"></i> Match found';
    result.classList.add('show');
  }, 2800);
}

function capturePhoto(){
  if (currentView !== 'scan') return;
  showToast('Captured — opening report…');
  setTimeout(() => go('report-carmo'), 500);
}
