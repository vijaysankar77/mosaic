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
    const card = document.createElement('article');
    card.className = 'design-card';
    card.setAttribute('role', 'listitem');
    card.dataset.id = design.id;

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
}

async function selectDesign(id) {
  const design = lastDesigns.find(d => d.id === id);
  if (!design) return;
  selectedDesignId = id;

  designsGrid?.querySelectorAll('.design-card').forEach(card => {
    const cta = card.querySelector('.design-card-cta');
    const sel = card.dataset.id === id;
    card.classList.toggle('selected', sel);
    if (cta) cta.textContent = sel ? 'Selected ✓' : 'Select';
  });

  try {
    await fetch('/api/designs/select', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ design_id: design.id }),
    });
  } catch (_) {}

  goToStep(3);
  runVectorize(design.id);
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
