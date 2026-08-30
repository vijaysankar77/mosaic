/* eslint-disable no-undef */
/**
 * PookalBot Dashboard — Autonomous Drawing Wizard & Free Roam Remote Control.
 */
'use strict';

// ── Mode Switcher (Wizard vs Free Roam) ─────────────────────────────────────
const tabWizardBtn       = document.getElementById('tabWizardBtn');
const tabFreeRoamBtn     = document.getElementById('tabFreeRoamBtn');
const modeWizard         = document.getElementById('modeWizard');
const modeFreeRoam       = document.getElementById('modeFreeRoam');

tabWizardBtn?.addEventListener('click', () => switchMode('wizard'));
tabFreeRoamBtn?.addEventListener('click', () => switchMode('freeroam'));

<<<<<<< HEAD
function switchMode(mode) {
  if (mode === 'wizard') {
    tabWizardBtn?.classList.add('active');
    tabFreeRoamBtn?.classList.remove('active');
    modeWizard?.classList.remove('hidden');
    modeFreeRoam?.classList.add('hidden');
  } else {
    tabFreeRoamBtn?.classList.add('active');
    tabWizardBtn?.classList.remove('active');
    modeFreeRoam?.classList.remove('hidden');
    modeWizard?.classList.add('hidden');
    // Refresh camera stream
    const cam = document.getElementById('freeroamCamStream');
    if (cam) cam.src = `/api/camera/stream?ts=${Date.now()}`;
  }
=======
// ── Sidebar toggle ────────────────────────────────────────────────────────────
sidebarToggle.addEventListener('click', (e) => { e.stopPropagation(); sidebar.classList.toggle('open'); });
document.addEventListener('click', (e) => {
  if (!sidebar.contains(e.target) && e.target !== sidebarToggle) sidebar.classList.remove('open');
});

// ── Section switching ─────────────────────────────────────────────────────────
// Sections that live inside col-left and can be shown/hidden
const CAMERA_SECTION   = document.getElementById('cameraSection');
const DASHBOARD_CARDS  = document.querySelectorAll(
  '.designer-card, .designs-card, .preview-info-card, .status-card, .workflow-card'
);

function showSection(section) {
  // Hide camera, show dashboard cards
  if (section === 'camera') {
    DASHBOARD_CARDS.forEach(c => c.classList.add('hidden'));
    CAMERA_SECTION.classList.remove('hidden');
  } else {
    // For all other sections restore dashboard view (camera off handled by camera module)
    CAMERA_SECTION.classList.add('hidden');
    DASHBOARD_CARDS.forEach(c => {
      // Restore visibility except cards that were explicitly hidden by user interaction
      if (!c.classList.contains('user-hidden')) c.classList.remove('hidden');
    });
    // Restore the sections that should stay hidden until generated
    if (!window._designsGenerated) {
      document.querySelector('.designs-card')?.classList.add('hidden');
      document.querySelector('.preview-info-card')?.classList.add('hidden');
    }
    if (section !== 'dashboard') {
      // Other sections (path, robot, history, settings) just show dashboard for now
    }
  }
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    const sec = item.dataset.section;
    showSection(sec);
    // Stop camera stream when navigating away
    if (sec !== 'camera') { if (typeof camStop === 'function') camStop(); }
  });
});

// ── Orbit dots ────────────────────────────────────────────────────────────────
for (let i = 0; i < 2; i++) {
  const dot = document.createElement('div');
  dot.className = 'orbit-dot';
  canvasDots.appendChild(dot);
>>>>>>> 688fbef8d852319436917ffdfbb0e7238771e880
}

// ── DOM Elements ────────────────────────────────────────────────────────────
const ringProgress     = document.getElementById('ringProgress');

const step1            = document.getElementById('step1');
const step2            = document.getElementById('step2');
const step3            = document.getElementById('step3');
const step4            = document.getElementById('step4');
const step5            = document.getElementById('step5');

const petalCount       = document.getElementById('petalCount');
const layerCount       = document.getElementById('layerCount');
const freeText         = document.getElementById('freeText');
const freeTextError    = document.getElementById('freeTextError');
const generateBtn      = document.getElementById('generateBtn');
const generateMsg      = document.getElementById('generateMsg');

const designsGrid      = document.getElementById('designsGrid');
const tryAgainBtn      = document.getElementById('tryAgainBtn');

const vectorizeStatus  = document.getElementById('vectorizeStatus');
const vectorizeStatusLabel = document.getElementById('vectorizeStatusLabel');
const vectorizeStatusSub   = document.getElementById('vectorizeStatusSub');
const vectorizeCompare = document.getElementById('vectorizeCompare');
const compareOriginal  = document.getElementById('compareOriginal');
const compareTraced    = document.getElementById('compareTraced');
const vectorizeStats   = document.getElementById('vectorizeStats');
const statWaypoints    = document.getElementById('statWaypoints');
const statDrawTime     = document.getElementById('statDrawTime');
const statRadius       = document.getElementById('statRadius');
const statStrokes      = document.getElementById('statStrokes');
const backToSelectBtn  = document.getElementById('backToSelectBtn');
const continueToLiveBtn= document.getElementById('continueToLiveBtn');

const cameraStream     = document.getElementById('cameraStream');
const liveOverlay      = document.getElementById('liveOverlay');

const statePos         = document.getElementById('statePos');
const stateHeading     = document.getElementById('stateHeading');
const stateMarker      = document.getElementById('stateMarker');
const statePen         = document.getElementById('statePen');
const stateDrawing     = document.getElementById('stateDrawing');
const stateProgressText= document.getElementById('stateProgressText');
const stateProgressFill= document.getElementById('stateProgressFill');
const stateProgressBar = document.getElementById('stateProgressBar');
const stateEta         = document.getElementById('stateEta');
const stateMsg         = document.getElementById('stateMsg');
const simulateStartBtn = document.getElementById('simulateStartBtn');
const simulateStopBtn  = document.getElementById('simulateStopBtn');
const backToVectorizeBtn=document.getElementById('backToVectorizeBtn');
const continueToSendBtn= document.getElementById('continueToSendBtn');

const sendWaypoints    = document.getElementById('sendWaypoints');
const sendTime         = document.getElementById('sendTime');
const sendRadius       = document.getElementById('sendRadius');
const sendPen          = document.getElementById('sendPen');
const sendToRobotBtn   = document.getElementById('sendToRobotBtn');
const sendMsg          = document.getElementById('sendMsg');

const statusDot        = document.getElementById('statusDot');
const statusLabel      = document.getElementById('statusLabel');
const statusSub        = document.getElementById('statusSub');

// ── State ───────────────────────────────────────────────────────────────────
let lastDesigns     = [];
let selectedDesignId = null;
let vectorizeResult  = null;
let currentStep      = 0;
let liveState        = null;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function setMessage(el, text, kind = '') {
  if (!el) return;
  el.textContent = text;
  el.className = 'step-msg' + (kind ? ' ' + kind : '');
}

function goToStep(n) {
  currentStep = n;
  const stepEls = { 1: step1, 2: step2, 3: step3, 4: step4, 5: step5 };
  for (const [i, el] of Object.entries(stepEls)) {
    if (el) el.classList.toggle('hidden', Number(i) !== n);
  }
  ringProgress?.classList.remove('has-1', 'has-2', 'has-3', 'has-4', 'has-5');
  for (let i = 1; i < n; i++) ringProgress?.classList.add('has-' + i);
  ringProgress?.setAttribute('aria-valuenow', String(Math.max(0, n - 1)));
  
  if (n >= 1 && n <= 5 && stepEls[n]) {
    stepEls[n].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (n === 4) startLiveView();
  if (n === 5) populateSendSummary();
}

function setButtonBusy(btn, busy, busyText) {
  if (!btn) return;
  btn.disabled = busy;
  btn.classList.toggle('loading', busy);
  if (busy && busyText) {
    const txt = btn.querySelector('.btn-text');
    if (txt) txt.textContent = busyText;
  }
}

// ── Step 1: Generate ────────────────────────────────────────────────────────
generateBtn?.addEventListener('click', async () => {
  const params = {
    petal_count: parseInt(petalCount.value, 10),
    layer_count: parseInt(layerCount.value, 10),
    color_count: 2,
    free_text:   freeText ? freeText.value.trim() : '',
  };
  if (params.free_text.length > 500) {
    if (freeTextError) freeTextError.textContent = 'Description is too long (max 500 chars).';
    return;
  }
  if (freeTextError) freeTextError.textContent = '';

  setButtonBusy(generateBtn, true, 'Generating designs…');
  setMessage(generateMsg, `Generating ${params.petal_count}-fold / ${params.layer_count} rings pookalam…`);

  try {
    const resp = await fetch('/api/designs/generate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(params),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ detail: `HTTP ${resp.status}` }));
      throw new Error(err.detail || `HTTP ${resp.status}`);
    }
    const data = await resp.json();
    lastDesigns = data.designs || [];
    if (lastDesigns.length === 0) {
      throw new Error('No usable designs returned. Please try again.');
    }
    setMessage(generateMsg, `✨ ${lastDesigns.length} designs ready — pick your favourite.`, 'ok');
    renderDesigns();
    goToStep(2);
  } catch (err) {
    setMessage(generateMsg, `⚠ ${err.message || err}`, 'error');
  } finally {
    setButtonBusy(generateBtn, false, 'Generate');
  }
<<<<<<< HEAD
});

tryAgainBtn?.addEventListener('click', () => goToStep(1));
freeText?.addEventListener('keydown', e => {
  if (e.key === 'Enter') generateBtn?.click();
});

// ── Step 2: Select ──────────────────────────────────────────────────────────
function renderDesigns() {
  if (!designsGrid) return;
  designsGrid.innerHTML = '';
  selectedDesignId = null;
  lastDesigns.forEach(design => {
=======
  const triR=62; let t1='',t2='';
  for(let i=0;i<3;i++){
    const a=(i/3)*2*Math.PI-Math.PI/2,b=a+(2*Math.PI)/3;
    t1+=`${cx+triR*Math.cos(a)},${cy+triR*Math.sin(a)} `;
    t2+=`${cx+triR*Math.cos(b+Math.PI/3)},${cy+triR*Math.sin(b+Math.PI/3)} `;
  }
  return `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${cx}" cy="${cy}" r="108" fill="none" stroke="#e8d9c0" stroke-width="1"/>
    ${a2}
    <polygon points="${t1.trim()}" fill="rgba(200,134,10,.08)" stroke="#c8860a" stroke-width="1.3"/>
    <polygon points="${t2.trim()}" fill="rgba(123,31,162,.06)" stroke="#7b1fa2" stroke-width="1.3"/>
    <circle cx="${cx}" cy="${cy}" r="18" fill="none" stroke="#2e7d32" stroke-width="1.2"/>
    <circle cx="${cx}" cy="${cy}" r="8"  fill="#c8860a" fill-opacity=".5"/>
    <circle cx="${cx}" cy="${cy}" r="3"  fill="#e65100"/>
  </svg>`;
}

// ── State ─────────────────────────────────────────────────────────────────────
let selectedDesignId = null, lastParams = {};
let currentDesigns   = [];   // filled by the real API — never hardcoded

// ── Generate — real API call ──────────────────────────────────────────────────
generateBtn.addEventListener('click', async () => {
  const theme      = themeInput.value.trim();
  const symmetry   = symmetrySelect.options[symmetrySelect.selectedIndex].text;
  const complexity = complexitySelect.value;
  const style      = styleSelect.value;

  if (!theme) {
    themeError.textContent = 'Please enter a theme before generating.';
    themeInput.focus();
    return;
  }
  themeError.textContent = '';
  lastParams = { theme, symmetry, complexity, style };

  generateBtn.disabled = true;
  generateBtn.classList.add('loading');
  generateMsg.textContent = `Asking Gemini AI to create designs for "${theme}"…`;
  // Hide any previous results while generating
  designsSection.classList.add('hidden');
  previewInfoSection.classList.add('hidden');

  try {
    // Always hit the AI server on port 5000 regardless of which port serves the page
    const apiBase = window.location.port === '5000'
      ? ''
      : 'http://localhost:5000';
    const resp = await fetch(`${apiBase}/api/generate-design`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ theme, symmetry, complexity, style }),
    });

    const data = await resp.json();

    if (!resp.ok || !data.ok) {
      const msg = data.error || `Server returned ${resp.status}`;
      throw new Error(msg);
    }

    if (!Array.isArray(data.designs) || data.designs.length === 0) {
      throw new Error('AI returned no designs. Try a different theme.');
    }

    currentDesigns = data.designs;
    generateMsg.textContent = `${currentDesigns.length} AI designs generated for "${theme}".`;
    window._designsGenerated = true;
    showDesigns(currentDesigns);

  } catch (err) {
    generateMsg.textContent = '';
    // Show a visible error — never silently fall back
    themeError.textContent  = `Generation failed: ${err.message}`;
    themeError.style.color  = '#c62828';
    console.error('Design generation error:', err);
  } finally {
    generateBtn.disabled = false;
    generateBtn.classList.remove('loading');
  }
});

function showDesigns(designs) {
  designsGrid.innerHTML = '';
  selectedDesignId = null;

  designs.forEach(design => {
>>>>>>> 688fbef8d852319436917ffdfbb0e7238771e880
    const card = document.createElement('article');
    card.className = 'design-card';
    card.setAttribute('role', 'listitem');
    card.dataset.id = design.id;

<<<<<<< HEAD
    const safeTitle       = escapeHtml(design.title       || 'Pookalam');
    const safeDescription = escapeHtml(design.description || '');

    card.innerHTML = `
      <div class="design-card-preview">
        <img src="${design.image_data_url}" alt="${safeTitle}" loading="lazy" />
      </div>
      <div class="design-card-name">${safeTitle}</div>
      <p class="design-card-desc">${safeDescription}</p>
      <button class="design-card-cta" type="button">Select</button>
    `;
    card.addEventListener('click', () => selectDesign(design.id));
    designsGrid.appendChild(card);
  });
=======
    // Build motif tags
    const motifTags = (design.motifs || [])
      .slice(0, 3)
      .map(m => `<span class="tag">${m}</span>`)
      .join('');

    card.innerHTML = `
      <div class="design-card-preview">${design.svg}</div>
      <div class="design-card-body">
        <div class="design-card-name">${design.name}</div>
        <div class="design-card-desc">${design.description}</div>
        <div class="design-card-meta">
          <span class="tag">${design.symmetry}</span>
          <span class="tag">${design.complexity}</span>
          ${motifTags}
        </div>
      </div>
      <button class="btn btn-outline" aria-label="Select ${design.name}">Select Design</button>`;

    card.querySelector('button').addEventListener('click', () => selectDesign(design.id));
    card.addEventListener('click', e => { if (e.target.tagName !== 'BUTTON') selectDesign(design.id); });
    designsGrid.appendChild(card);
  });

  designsSection.classList.remove('hidden');
  previewDefaultBox.classList.add('hidden');
  previewInfoBox.classList.remove('hidden');
  previewInfoText.textContent = 'Select a design below to preview it here.';
  designsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
>>>>>>> 688fbef8d852319436917ffdfbb0e7238771e880
}

async function selectDesign(id) {
  const design = lastDesigns.find(d => d.id === id);
  if (!design) return;
  selectedDesignId = id;
<<<<<<< HEAD

  designsGrid?.querySelectorAll('.design-card').forEach(card => {
    const cta = card.querySelector('.design-card-cta');
    const sel = card.dataset.id === id;
=======
  const design = currentDesigns.find(d => d.id === id);
  if (!design) return;

  designsGrid.querySelectorAll('.design-card').forEach(card => {
    const btn = card.querySelector('button'), sel = card.dataset.id === id;
>>>>>>> 688fbef8d852319436917ffdfbb0e7238771e880
    card.classList.toggle('selected', sel);
    if (cta) cta.textContent = sel ? 'Selected ✓' : 'Select';
  });

<<<<<<< HEAD
  try {
    await fetch('/api/designs/select', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ design_id: design.id }),
    });
  } catch (_) {}

  goToStep(3);
  runVectorize(design.id);
=======
  previewSvgWrap.innerHTML = design.svg;
  previewSvgWrap.classList.add('has-design');
  if (canvasPlaceholder) canvasPlaceholder.style.display = 'none';

  previewInfoBox.classList.remove('hidden');
  previewDefaultBox.classList.add('hidden');
  previewInfoText.textContent = `"${design.name}" — ${design.symmetry} symmetry, ${design.complexity}.`;
  continueBtn2.classList.remove('hidden');

  previewTheme.textContent      = lastParams.theme || '—';
  previewName.textContent       = design.name;
  previewSymmetry.textContent   = design.symmetry;
  previewComplexity.textContent = design.complexity;
  continueTodo.classList.add('hidden');
  previewInfoSection.classList.remove('hidden');
  previewInfoSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
>>>>>>> 688fbef8d852319436917ffdfbb0e7238771e880
}

// ── Step 3: Vectorize (auto) ────────────────────────────────────────────────
async function runVectorize(designId) {
  if (vectorizeStatus) {
    vectorizeStatus.dataset.state = 'loading';
    vectorizeStatusLabel.textContent = 'Tracing your design…';
    vectorizeStatusSub.textContent   = 'Decode → Otsu threshold → extract contours → Cartesian waypoints';
  }
  vectorizeCompare?.classList.add('hidden');
  vectorizeStats?.classList.add('hidden');
  continueToLiveBtn?.classList.add('hidden');

  try {
    const resp = await fetch('/api/designs/vectorize', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ design_id: designId, canvas_cm: 60 }),
    });
    const data = await resp.json();

    if (!resp.ok || data.status !== 'ok') {
      const msg = data?.error?.message || `HTTP ${resp.status}`;
      if (vectorizeStatus) {
        vectorizeStatus.dataset.state = 'failed';
        vectorizeStatusLabel.textContent = 'Couldn’t trace this design';
        vectorizeStatusSub.textContent   = msg;
      }
      return;
    }

    vectorizeResult = data;
    showVectorizeResult(data);
  } catch (err) {
    if (vectorizeStatus) {
      vectorizeStatus.dataset.state = 'failed';
      vectorizeStatusLabel.textContent = 'Couldn’t trace this design';
      vectorizeStatusSub.textContent   = err.message || String(err);
    }
  }
}

function showVectorizeResult(data) {
  if (vectorizeStatus) {
    vectorizeStatus.dataset.state = 'ok';
    vectorizeStatusLabel.textContent = 'Vectorization complete ✓';
    vectorizeStatusSub.textContent   =
      `${data.waypoints.length} waypoints · ~${formatDuration(data.estimated_drawing_time_sec)} draw time`;
  }

  if (data.original_png_data_url && compareOriginal) compareOriginal.src = data.original_png_data_url;
  if (data.traced_png_data_url && compareTraced)     compareTraced.src   = data.traced_png_data_url;
  vectorizeCompare?.classList.remove('hidden');

  if (statWaypoints) statWaypoints.textContent = data.waypoints.length.toLocaleString();
  if (statDrawTime)  statDrawTime.textContent  = `~${formatDuration(data.estimated_drawing_time_sec)}`;
  if (statRadius)    statRadius.textContent    = `${data.radius_cm.toFixed(1)} cm`;
  if (statStrokes)   statStrokes.textContent   = countStrokes(data.waypoints).toLocaleString();
  vectorizeStats?.classList.remove('hidden');

  continueToLiveBtn?.classList.remove('hidden');
}

backToSelectBtn?.addEventListener('click', () => goToStep(2));
continueToLiveBtn?.addEventListener('click', () => goToStep(4));

function countStrokes(waypoints) {
  let n = 0;
  for (let i = 0; i < waypoints.length; i++) {
    if (waypoints[i].pen === 1 && (i === 0 || waypoints[i - 1].pen === 0)) n++;
  }
  return n;
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

// ── Step 4: Live View (camera + ML overlays) ────────────────────────────────
const CANVAS_REF_W = 640;
const CANVAS_REF_H = 480;
const DEFAULT_PX_PER_CM = 7.5;

function worldToCanvas(wx, wy) {
  const cx = CANVAS_REF_W / 2;
  const cy = CANVAS_REF_H / 2;
  return {
    x: cx + wx * DEFAULT_PX_PER_CM,
    y: cy + wy * DEFAULT_PX_PER_CM,
  };
}

let _overlayTransformSet = false;
function setupOverlayCanvas() {
  if (!liveOverlay) return;
  liveOverlay.width  = CANVAS_REF_W;
  liveOverlay.height = CANVAS_REF_H;
  _overlayTransformSet = true;
}

let _liveStarted = false;
function startLiveView() {
  if (!_liveStarted) {
    setupOverlayCanvas();
    setInterval(refreshLiveState, 200);
    requestAnimationFrame(renderOverlays);
    _liveStarted = true;
  }
  setMessage(stateMsg, '');
}

function bindLiveViewEvents() {
  simulateStartBtn?.addEventListener('click', startSimulator);
  simulateStopBtn ?.addEventListener('click', stopSimulator);
  backToVectorizeBtn?.addEventListener('click', () => goToStep(3));
  continueToSendBtn?.addEventListener('click',  () => goToStep(5));
}

async function refreshLiveState() {
  try {
    const resp = await fetch('/api/live/state');
    if (!resp.ok) return;
    liveState = await resp.json();
    updateStatePanel();
  } catch (_) {}
}

function updateStatePanel() {
  if (!liveState) return;

  if (statePos) {
    if (liveState.robot.detected) {
      statePos.textContent = `(${liveState.robot.x.toFixed(1)}, ${liveState.robot.y.toFixed(1)}) cm`;
      statePos.className = 'mono detected';
    } else {
      statePos.textContent = '— (looking for tag)';
      statePos.className = 'mono muted';
    }
  }

  if (stateHeading) {
    if (liveState.robot.detected) {
      const deg = (liveState.robot.theta * 180 / Math.PI).toFixed(0);
      stateHeading.textContent = `${deg}°`;
    } else {
      stateHeading.textContent = '—';
    }
  }

  if (stateMarker) {
    if (liveState.robot.marker_id !== null && liveState.robot.marker_id !== undefined) {
      stateMarker.textContent = `Tag #${liveState.robot.marker_id}`;
      stateMarker.className = 'mono detected';
    } else {
      stateMarker.textContent = 'not detected';
      stateMarker.className = 'mono muted';
    }
  }

  if (statePen) {
    statePen.textContent = liveState.pen;
    statePen.className = 'mono ' + (liveState.pen === 'down' ? 'detected' : '');
  }

  if (stateDrawing) stateDrawing.textContent = liveState.progress.state;

  const cur = liveState.progress.current_waypoint;
  const tot = liveState.progress.total_waypoints;
  const pct = tot > 0 ? Math.round((cur / tot) * 100) : 0;
  if (stateProgressText) stateProgressText.textContent = `${cur.toLocaleString()} / ${tot.toLocaleString()}`;
  if (stateProgressFill) stateProgressFill.style.width = `${pct}%`;
  if (stateProgressBar)  stateProgressBar.setAttribute('aria-valuenow', String(pct));
  if (stateEta) stateEta.textContent = liveState.progress.eta_seconds > 0 ? `~${formatDuration(liveState.progress.eta_seconds)}` : '—';

  if (liveState.message) {
    setMessage(stateMsg, liveState.message, liveState.progress.state === 'error' ? 'error' : 'ok');
  }
}

function renderOverlays() {
  if (!_overlayTransformSet || !liveOverlay) {
    requestAnimationFrame(renderOverlays);
    return;
  }
  const ctx = liveOverlay.getContext('2d');
  ctx.clearRect(0, 0, CANVAS_REF_W, CANVAS_REF_H);

  // Planned path (gold)
  if (vectorizeResult && vectorizeResult.waypoints) {
    drawPath(ctx, vectorizeResult.waypoints, '#C89B3C', 2.5);
  }

  // Drawn path (green)
  if (liveState && liveState.progress.drawing && vectorizeResult && vectorizeResult.waypoints) {
    const upto = liveState.progress.current_waypoint;
    drawPath(ctx, vectorizeResult.waypoints.slice(0, upto), '#3F6B35', 3.5);
  }

  // Robot pose
  if (liveState && liveState.robot.detected) {
    drawRobot(ctx, liveState.robot);
  }

  requestAnimationFrame(renderOverlays);
}

function drawPath(ctx, waypoints, color, width) {
  if (!waypoints || waypoints.length < 2) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  let drawing = false;
  ctx.beginPath();
  for (const w of waypoints) {
    const p = worldToCanvas(w.x, w.y);
    if (w.pen === 1) {
      if (!drawing) { ctx.moveTo(p.x, p.y); drawing = true; }
      else          { ctx.lineTo(p.x, p.y); }
    } else {
      drawing = false;
    }
  }
  ctx.stroke();
}

function drawRobot(ctx, robot) {
  const p = worldToCanvas(robot.x, robot.y);
  const arrowLen = 24;
  const hx = p.x + Math.cos(robot.theta) * arrowLen;
  const hy = p.y + Math.sin(robot.theta) * arrowLen;

  ctx.strokeStyle = '#B7282E';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(hx, hy);
  ctx.stroke();

  ctx.fillStyle = '#B7282E';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
  ctx.fill();
}

async function startSimulator() {
  if (!vectorizeResult || !vectorizeResult.waypoints) {
    setMessage(stateMsg, 'Trace a design first (Step 3).', 'error');
    return;
  }
  setMessage(stateMsg, 'Starting demo simulation…');
  try {
    await fetch('/api/live/simulate/start', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ waypoints: vectorizeResult.waypoints, speed_wps: 60 }),
    });
  } catch (err) {
    setMessage(stateMsg, `⚠ ${err.message}`, 'error');
  }
}

async function stopSimulator() {
  try {
    await fetch('/api/live/simulate/stop', { method: 'POST' });
    setMessage(stateMsg, 'Simulation stopped.');
  } catch (_) {}
}

// ── Step 5: Send to robot ───────────────────────────────────────────────────
function populateSendSummary() {
  if (!vectorizeResult) return;
  if (sendWaypoints) sendWaypoints.textContent = vectorizeResult.waypoints.length.toLocaleString();
  if (sendTime)      sendTime.textContent      = `~${formatDuration(vectorizeResult.estimated_drawing_time_sec)}`;
  if (sendRadius)    sendRadius.textContent    = `${vectorizeResult.radius_cm.toFixed(1)} cm`;
  if (sendPen)       sendPen.textContent       = 'servo ready';
  if (sendToRobotBtn) sendToRobotBtn.disabled  = false;
}

sendToRobotBtn?.addEventListener('click', async () => {
  if (!vectorizeResult) return;
  setButtonBusy(sendToRobotBtn, true, 'Sending…');
  try {
    const resp = await fetch('/api/robot/send', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        design_id: vectorizeResult.design_id,
        waypoints: vectorizeResult.waypoints,
        canvas_cm: vectorizeResult.canvas_cm,
      }),
    });
    const data = await resp.json();
    setMessage(sendMsg, `✓ Path sent to robot — ${vectorizeResult.waypoints.length} waypoints. Drawing active!`, 'ok');
    ringProgress?.classList.add('has-5');
  } catch (err) {
    setMessage(sendMsg, `⚠ ${err.message}`, 'error');
  } finally {
    setButtonBusy(sendToRobotBtn, false, 'Send to Robot');
  }
});

// ── Free Roam Teleop Controls ───────────────────────────────────────────────
const freeroamIp          = document.getElementById('freeroamIp');
const freeroamConnectBtn   = document.getElementById('freeroamConnectBtn');
const freeroamStatusBadge = document.getElementById('freeroamStatusBadge');
const motorSpeedSlider    = document.getElementById('motorSpeedSlider');
const speedValText        = document.getElementById('speedValText');
const servoAngleSlider    = document.getElementById('servoAngleSlider');
const servoAngleText      = document.getElementById('servoAngleText');

const btnDpadUp           = document.getElementById('btnDpadUp');
const btnDpadDown         = document.getElementById('btnDpadDown');
const btnDpadLeft         = document.getElementById('btnDpadLeft');
const btnDpadRight        = document.getElementById('btnDpadRight');
const btnDpadStop         = document.getElementById('btnDpadStop');
const teleopPenBadge      = document.getElementById('teleopPenBadge');

const btnPenDown          = document.getElementById('btnPenDown');
const btnPenUp            = document.getElementById('btnPenUp');
const btnPenToggle        = document.getElementById('btnPenToggle');

const btnMacroForward     = document.getElementById('btnMacroForward');
const btnMacroSpin        = document.getElementById('btnMacroSpin');
const btnMacroStop        = document.getElementById('btnMacroStop');

let activeTeleopKey = null;

async function sendTeleop(action) {
  const spd = parseInt(motorSpeedSlider?.value || '220', 10);
  try {
    const res = await fetch('/api/robot/teleop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, speed: spd }),
    });
    const data = await res.json();
    if (data.pen_down !== undefined && teleopPenBadge) {
      teleopPenBadge.textContent = `Pen: ${data.pen_down ? 'DOWN' : 'UP'}`;
      teleopPenBadge.classList.toggle('down', data.pen_down);
    }
  } catch (_) {}
}

// Connect ESP32
freeroamConnectBtn?.addEventListener('click', async () => {
  const ip = freeroamIp?.value.trim() || '192.168.10.14';
  if (freeroamStatusBadge) {
    freeroamStatusBadge.textContent = 'Connecting…';
  }
  try {
    const res = await fetch('/api/robot/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ esp32_ip: ip, stream_tft: true }),
    });
    const data = await res.json();
    if (freeroamStatusBadge) {
      freeroamStatusBadge.textContent = `Connected (${ip})`;
      freeroamStatusBadge.classList.add('connected');
    }
  } catch (err) {
    if (freeroamStatusBadge) {
      freeroamStatusBadge.textContent = 'Connection Error';
    }
  }
});

// Speed slider
motorSpeedSlider?.addEventListener('input', (e) => {
  const v = e.target.value;
  const pct = Math.round((v / 255) * 100);
  if (speedValText) speedValText.textContent = `${v} (${pct}%)`;
});

// Servo angle slider
servoAngleSlider?.addEventListener('input', (e) => {
  const ang = e.target.value;
  if (servoAngleText) servoAngleText.textContent = `${ang}°`;
  fetch('/api/robot/servo_angle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ angle: parseInt(ang, 10) }),
  });
});

<<<<<<< HEAD
// Pen quick actions
btnPenDown?.addEventListener('click', () => sendTeleop('pen_down'));
btnPenUp?.addEventListener('click',   () => sendTeleop('pen_up'));
btnPenToggle?.addEventListener('click', () => sendTeleop('space'));

// D-Pad buttons
btnDpadUp   ?.addEventListener('mousedown', () => sendTeleop('up'));
btnDpadDown ?.addEventListener('mousedown', () => sendTeleop('down'));
btnDpadLeft ?.addEventListener('mousedown', () => sendTeleop('left'));
btnDpadRight?.addEventListener('mousedown', () => sendTeleop('right'));
btnDpadStop ?.addEventListener('click',     () => sendTeleop('stop'));

btnDpadUp   ?.addEventListener('touchstart', (e) => { e.preventDefault(); sendTeleop('up'); });
btnDpadDown ?.addEventListener('touchstart', (e) => { e.preventDefault(); sendTeleop('down'); });
btnDpadLeft ?.addEventListener('touchstart', (e) => { e.preventDefault(); sendTeleop('left'); });
btnDpadRight?.addEventListener('touchstart', (e) => { e.preventDefault(); sendTeleop('right'); });

window.addEventListener('mouseup', () => {
  if (activeTeleopKey) {
    sendTeleop('stop');
    activeTeleopKey = null;
  }
});
window.addEventListener('touchend', () => sendTeleop('stop'));

// Quick macros
btnMacroForward?.addEventListener('click', () => {
  fetch('/api/robot/test_drive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'forward', duration_sec: 1.0, speed: parseInt(motorSpeedSlider?.value || '220', 10) }),
  });
});
btnMacroSpin?.addEventListener('click', () => {
  fetch('/api/robot/test_drive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'spin', duration_sec: 1.5, speed: parseInt(motorSpeedSlider?.value || '220', 10) }),
  });
});
btnMacroStop?.addEventListener('click', () => sendTeleop('stop'));

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  const k = e.key.toLowerCase();
  if (['arrowup', 'w'].includes(k) && activeTeleopKey !== 'up') {
    e.preventDefault();
    activeTeleopKey = 'up';
    btnDpadUp?.classList.add('active');
    sendTeleop('up');
  } else if (['arrowdown', 's'].includes(k) && activeTeleopKey !== 'down') {
    e.preventDefault();
    activeTeleopKey = 'down';
    btnDpadDown?.classList.add('active');
    sendTeleop('down');
  } else if (['arrowleft', 'a'].includes(k) && activeTeleopKey !== 'left') {
    e.preventDefault();
    activeTeleopKey = 'left';
    btnDpadLeft?.classList.add('active');
    sendTeleop('left');
  } else if (['arrowright', 'd'].includes(k) && activeTeleopKey !== 'right') {
    e.preventDefault();
    activeTeleopKey = 'right';
    btnDpadRight?.classList.add('active');
    sendTeleop('right');
  } else if (e.code === 'Space') {
    e.preventDefault();
    sendTeleop('space');
  }
});

document.addEventListener('keyup', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  const k = e.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 's', 'a', 'd'].includes(k)) {
    e.preventDefault();
    activeTeleopKey = null;
    btnDpadUp?.classList.remove('active');
    btnDpadDown?.classList.remove('active');
    btnDpadLeft?.classList.remove('active');
    btnDpadRight?.classList.remove('active');
    sendTeleop('stop');
  }
});

// ── Camera Modal ────────────────────────────────────────────────────────────
const cameraModal        = document.getElementById('cameraModal');
const cameraModalBtn     = document.getElementById('cameraModalBtn');
const cameraModalClose   = document.getElementById('cameraModalClose');
const modalCameraStream  = document.getElementById('modalCameraStream');
const modalCameraRefresh = document.getElementById('modalCameraRefresh');

cameraModalBtn?.addEventListener('click', () => {
  cameraModal?.classList.remove('hidden');
  if (modalCameraStream) modalCameraStream.src = `/api/camera/stream?ts=${Date.now()}`;
});
cameraModalClose?.addEventListener('click', () => cameraModal?.classList.add('hidden'));
modalCameraRefresh?.addEventListener('click', () => {
  if (modalCameraStream) modalCameraStream.src = `/api/camera/stream?ts=${Date.now()}`;
});

// ── Health check (topbar badge) ─────────────────────────────────────────────
async function refreshHealth() {
  try {
    const resp = await fetch('/api/health');
    if (!resp.ok) return;
    const h = await resp.json();
    if (h.ai_available && statusDot) {
      statusDot.classList.remove('offline'); statusDot.classList.add('online');
      if (statusLabel) statusLabel.textContent = `${h.provider || 'AI'} ready`;
      if (statusSub)   statusSub.textContent   = 'AI design generation active';
    }
  } catch (_) {}
}

// ── Boot ────────────────────────────────────────────────────────────────────
goToStep(1);
refreshHealth();
setInterval(refreshHealth, 15000);
bindLiveViewEvents();
=======
themeInput.addEventListener('keydown', e => { if (e.key === 'Enter') generateBtn.click(); });
themeInput.addEventListener('input',   ()  => { if (themeInput.value.trim()) themeError.textContent = ''; });

// ══════════════════════════════════════════════════════════════════════════════
// LIVE CAMERA MODULE
// Uses browser getUserMedia — works on localhost without HTTPS.
// ══════════════════════════════════════════════════════════════════════════════

const camVideo        = document.getElementById('cameraVideo');
const camCanvas       = document.getElementById('cameraCanvas');
const camStartBtn     = document.getElementById('camStartBtn');
const camStopBtn      = document.getElementById('camStopBtn');
const camCaptureBtn   = document.getElementById('camCaptureBtn');
const camFlipBtn      = document.getElementById('camFlipBtn');
const camDeviceSelect = document.getElementById('camDeviceSelect');
const camPlaceholder  = document.getElementById('camPlaceholder');
const camStatusDot    = document.getElementById('camStatusDot');
const camStatusText   = document.getElementById('camStatusText');
const camError        = document.getElementById('camError');
const capturePreview  = document.getElementById('capturePreview');
const captureImg      = document.getElementById('captureImg');
const captureCloseBtn = document.getElementById('captureCloseBtn');

let camStream   = null;   // active MediaStream
let camMirrored = true;   // mirror front-facing cameras by default
let camDeviceId = null;   // currently selected device

// ── Helpers ───────────────────────────────────────────────────────────────────
function camSetStatus(state, text) {
  camStatusDot.className  = 'cam-status-dot' + (state ? ' ' + state : '');
  camStatusText.textContent = text;
}

function camShowError(msg) {
  camError.textContent = msg;
  camError.classList.remove('hidden');
}
function camClearError() {
  camError.textContent = '';
  camError.classList.add('hidden');
}

// ── Enumerate cameras and populate dropdown ───────────────────────────────────
async function camEnumerateDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(d => d.kind === 'videoinput');
    camDeviceSelect.innerHTML = '';
    cameras.forEach((cam, i) => {
      const opt = document.createElement('option');
      opt.value = cam.deviceId;
      opt.textContent = cam.label || `Camera ${i + 1}`;
      camDeviceSelect.appendChild(opt);
    });
    if (cameras.length > 0) {
      camDeviceSelect.classList.remove('hidden');
      // Restore previously chosen device if still present
      if (camDeviceId && cameras.some(c => c.deviceId === camDeviceId)) {
        camDeviceSelect.value = camDeviceId;
      } else {
        camDeviceId = cameras[0].deviceId;
      }
    }
  } catch (_) { /* labels unavailable before permission */ }
}

// ── Start camera ──────────────────────────────────────────────────────────────
async function camStart() {
  camClearError();

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    camShowError('Your browser does not support camera access.');
    return;
  }

  // Build constraints — prefer the selected device, fall back to any video
  const constraints = {
    video: camDeviceId
      ? { deviceId: { exact: camDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
      : { width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: false,
  };

  try {
    camStream = await navigator.mediaDevices.getUserMedia(constraints);
    camVideo.srcObject = camStream;

    // Mirror front-facing cameras
    camVideo.classList.toggle('mirrored', camMirrored);

    camPlaceholder.classList.add('hidden');
    camStartBtn.classList.add('hidden');
    camStopBtn.classList.remove('hidden');
    camCaptureBtn.classList.remove('hidden');
    camFlipBtn.classList.remove('hidden');
    camSetStatus('live', 'Live');

    // After permission is granted labels become available — re-enumerate
    await camEnumerateDevices();

    // Store the active track's device id
    const track = camStream.getVideoTracks()[0];
    if (track) {
      const settings = track.getSettings();
      if (settings.deviceId) {
        camDeviceId = settings.deviceId;
        camDeviceSelect.value = camDeviceId;
      }
    }

  } catch (err) {
    let msg = 'Camera access failed.';
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')
      msg = 'Camera permission denied. Allow camera access in your browser and try again.';
    else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError')
      msg = 'No camera found. Make sure your webcam is connected.';
    else if (err.name === 'NotReadableError')
      msg = 'Camera is in use by another application.';
    else if (err.name === 'OverconstrainedError')
      msg = 'Selected camera constraints could not be satisfied. Trying default camera.';
    camShowError(msg);
    camSetStatus('error', 'Error');

    // If a specific device failed, retry with any camera
    if (err.name === 'OverconstrainedError' && camDeviceId) {
      camDeviceId = null;
      camStart();
    }
  }
}

// ── Stop camera ───────────────────────────────────────────────────────────────
function camStop() {
  if (!camStream) return;
  camStream.getTracks().forEach(t => t.stop());
  camStream = null;
  camVideo.srcObject = null;
  camPlaceholder.classList.remove('hidden');
  camStartBtn.classList.remove('hidden');
  camStopBtn.classList.add('hidden');
  camCaptureBtn.classList.add('hidden');
  camFlipBtn.classList.add('hidden');
  camSetStatus('', 'Camera off');
}

// ── Capture frame ─────────────────────────────────────────────────────────────
function camCapture() {
  if (!camStream || !camVideo.videoWidth) return;

  const w = camVideo.videoWidth;
  const h = camVideo.videoHeight;
  camCanvas.width  = w;
  camCanvas.height = h;

  const ctx = camCanvas.getContext('2d');
  if (camMirrored) {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(camVideo, 0, 0, w, h);
  if (camMirrored) ctx.setTransform(1, 0, 0, 1, 0, 0); // reset

  const dataUrl = camCanvas.toDataURL('image/jpeg', 0.92);
  captureImg.src = dataUrl;
  capturePreview.classList.remove('hidden');
  capturePreview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Flip mirror ───────────────────────────────────────────────────────────────
function camFlip() {
  camMirrored = !camMirrored;
  camVideo.classList.toggle('mirrored', camMirrored);
}

// ── Switch device ─────────────────────────────────────────────────────────────
camDeviceSelect.addEventListener('change', async () => {
  camDeviceId = camDeviceSelect.value;
  if (camStream) {
    camStop();
    await camStart();
  }
});

// ── Button wiring ─────────────────────────────────────────────────────────────
camStartBtn.addEventListener('click',   camStart);
camStopBtn.addEventListener('click',    camStop);
camCaptureBtn.addEventListener('click', camCapture);
camFlipBtn.addEventListener('click',    camFlip);
captureCloseBtn.addEventListener('click', () => capturePreview.classList.add('hidden'));

// ── Pre-enumerate so device names show before permission (may be blank labels) ─
navigator.mediaDevices?.enumerateDevices().then(camEnumerateDevices).catch(() => {});
>>>>>>> 688fbef8d852319436917ffdfbb0e7238771e880
