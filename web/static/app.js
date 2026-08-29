'use strict';

const themeInput        = document.getElementById('themeInput');
const themeError        = document.getElementById('themeError');
const symmetrySelect    = document.getElementById('symmetrySelect');
const complexitySelect  = document.getElementById('complexitySelect');
const styleSelect       = document.getElementById('styleSelect');
const generateBtn       = document.getElementById('generateBtn');
const generateMsg       = document.getElementById('generateMsg');
const designsSection    = document.getElementById('designsSection');
const designsGrid       = document.getElementById('designsGrid');
const previewInfoSection= document.getElementById('previewInfoSection');
const previewSvgWrap    = document.getElementById('previewSvgWrap');
const previewTheme      = document.getElementById('previewTheme');
const previewName       = document.getElementById('previewName');
const previewSymmetry   = document.getElementById('previewSymmetry');
const previewComplexity = document.getElementById('previewComplexity');
const continueBtn       = document.getElementById('continueBtn');
const continueBtn2      = document.getElementById('continueBtn2');
const continueTodo      = document.getElementById('continueTodo');
const previewDefaultBox = document.getElementById('previewDefaultBox');
const previewInfoBox    = document.getElementById('previewInfoBox');
const previewInfoText   = document.getElementById('previewInfoText');
const canvasDots        = document.getElementById('canvasDots');
const canvasPlaceholder = document.getElementById('canvasPlaceholder');
const sidebarToggle     = document.getElementById('sidebarToggle');
const sidebar           = document.getElementById('sidebar');
const footerYear        = document.getElementById('footerYear');

footerYear.textContent = new Date().getFullYear();

// ── Sidebar toggle ────────────────────────────────────────────────────────────
sidebarToggle.addEventListener('click', (e) => { e.stopPropagation(); sidebar.classList.toggle('open'); });
document.addEventListener('click', (e) => {
  if (!sidebar.contains(e.target) && e.target !== sidebarToggle) sidebar.classList.remove('open');
});
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
  });
});

// ── Orbit dots ────────────────────────────────────────────────────────────────
for (let i = 0; i < 2; i++) {
  const dot = document.createElement('div');
  dot.className = 'orbit-dot';
  canvasDots.appendChild(dot);
}

// ── SVG Designs — warm light palette ─────────────────────────────────────────
const DESIGNS = [
  { id: 'lotus-harmony', name: 'Lotus Harmony',  description: 'Eight lotus petals radiating from a central disc — classic Kerala motif.', symmetry: '8-fold',  complexity: 'Simple',   svg: buildLotusSVG()    },
  { id: 'kerala-mandala', name: 'Kerala Mandala', description: 'Layered rings with diamond accents inspired by Thrissur Pooram.',           symmetry: '12-fold', complexity: 'Medium',   svg: buildMandalaSVG()  },
  { id: 'floral-star',   name: 'Floral Star',     description: 'Interlocking triangles and petal arcs forming a six-pointed star.',          symmetry: '6-fold',  complexity: 'Detailed', svg: buildFloralStarSVG()},
];

function buildLotusSVG() {
  const cx = 120, cy = 120;
  let p = '';
  for (let i = 0; i < 8; i++) {
    const a = (i/8)*2*Math.PI;
    const a1=a-Math.PI/8*.6, a2=a+Math.PI/8*.6, tip=90, ctrl=58;
    const tx=cx+tip*Math.cos(a), ty=cy+tip*Math.sin(a);
    const c1x=cx+ctrl*Math.cos(a1),c1y=cy+ctrl*Math.sin(a1);
    const c2x=cx+ctrl*Math.cos(a2),c2y=cy+ctrl*Math.sin(a2);
    p += `<path d="M${cx},${cy} Q${c1x},${c1y} ${tx},${ty} Q${c2x},${c2y} ${cx},${cy}Z" fill="rgba(200,134,10,.1)" stroke="#c8860a" stroke-width="1.4"/>`;
  }
  for (let i = 0; i < 8; i++) {
    const a=(i/8)*2*Math.PI+Math.PI/8;
    const a1=a-Math.PI/8*.5,a2=a+Math.PI/8*.5,tip=52,ctrl=34;
    const tx=cx+tip*Math.cos(a),ty=cy+tip*Math.sin(a);
    const c1x=cx+ctrl*Math.cos(a1),c1y=cy+ctrl*Math.sin(a1);
    const c2x=cx+ctrl*Math.cos(a2),c2y=cy+ctrl*Math.sin(a2);
    p += `<path d="M${cx},${cy} Q${c1x},${c1y} ${tx},${ty} Q${c2x},${c2y} ${cx},${cy}Z" fill="rgba(46,125,50,.08)" stroke="#2e7d32" stroke-width="1.1"/>`;
  }
  return `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${cx}" cy="${cy}" r="108" fill="none" stroke="#e8d9c0" stroke-width="1"/>
    <circle cx="${cx}" cy="${cy}" r="72"  fill="none" stroke="#e8d9c0" stroke-width=".8"/>
    <circle cx="${cx}" cy="${cy}" r="36"  fill="none" stroke="#e8d9c0" stroke-width=".8"/>
    ${p}
    <circle cx="${cx}" cy="${cy}" r="10" fill="#c8860a" fill-opacity=".5"/>
    <circle cx="${cx}" cy="${cy}" r="4"  fill="#e65100"/>
  </svg>`;
}

function buildMandalaSVG() {
  const cx=120,cy=120; let m='';
  [[90,12,'#2e7d32'],[68,12,'#c8860a'],[46,6,'#7b1fa2']].forEach(([r,n,col])=>{
    for(let i=0;i<n;i++){
      const a=(i/n)*2*Math.PI;
      const ix=cx+(r-7)*Math.cos(a),iy=cy+(r-7)*Math.sin(a);
      const ox=cx+(r+7)*Math.cos(a),oy=cy+(r+7)*Math.sin(a);
      const lx=cx+r*Math.cos(a-.16),ly=cy+r*Math.sin(a-.16);
      const rx2=cx+r*Math.cos(a+.16),ry2=cy+r*Math.sin(a+.16);
      m += `<path d="M${ix},${iy} L${lx},${ly} L${ox},${oy} L${rx2},${ry2}Z" fill="${col}18" stroke="${col}" stroke-width="1"/>`;
    }
  });
  return `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${cx}" cy="${cy}" r="108" fill="none" stroke="#e8d9c0" stroke-width="1"/>
    <circle cx="${cx}" cy="${cy}" r="90"  fill="none" stroke="#2e7d32" stroke-width="1.5"/>
    <circle cx="${cx}" cy="${cy}" r="68"  fill="none" stroke="#c8860a" stroke-width="1.5"/>
    <circle cx="${cx}" cy="${cy}" r="46"  fill="none" stroke="#7b1fa2" stroke-width="1.2"/>
    <circle cx="${cx}" cy="${cy}" r="24"  fill="none" stroke="#c8860a" stroke-width="1"/>
    ${m}
    <circle cx="${cx}" cy="${cy}" r="10" fill="#c8860a" fill-opacity=".5"/>
    <circle cx="${cx}" cy="${cy}" r="4"  fill="#2e7d32"/>
  </svg>`;
}

function buildFloralStarSVG() {
  const cx=120,cy=120; let a2='';
  for(let i=0;i<6;i++){
    const a=(i/6)*2*Math.PI;
    const a1=a-Math.PI/6*.7,a3=a+Math.PI/6*.7,tip=85,ctrl=55;
    const tx=cx+tip*Math.cos(a),ty=cy+tip*Math.sin(a);
    const c1x=cx+ctrl*Math.cos(a1),c1y=cy+ctrl*Math.sin(a1);
    const c2x=cx+ctrl*Math.cos(a3),c2y=cy+ctrl*Math.sin(a3);
    a2+=`<path d="M${cx},${cy} Q${c1x},${c1y} ${tx},${ty} Q${c2x},${c2y} ${cx},${cy}Z" fill="rgba(46,125,50,.08)" stroke="#2e7d32" stroke-width="1.5"/>`;
  }
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

// ── Generate ──────────────────────────────────────────────────────────────────
generateBtn.addEventListener('click', () => {
  const theme      = themeInput.value.trim();
  const symmetry   = symmetrySelect.options[symmetrySelect.selectedIndex].text;
  const complexity = complexitySelect.value;
  const style      = styleSelect.value;
  if (!theme) { themeError.textContent = 'Please enter a theme before generating.'; themeInput.focus(); return; }
  themeError.textContent = '';
  lastParams = { theme, symmetry, complexity, style };
  generateBtn.disabled = true;
  generateBtn.classList.add('loading');
  generateMsg.textContent = `Generating designs for "${theme}"…`;

  // TODO: POST /api/generate-design
  // TODO: Send { theme, symmetry, complexity, style } to AI backend
  // TODO: Replace DESIGNS with API response

  setTimeout(() => {
    generateBtn.disabled = false;
    generateBtn.classList.remove('loading');
    generateMsg.textContent = `3 designs generated for "${theme}".`;
    showDesigns();
  }, 1800);
});

function showDesigns() {
  designsGrid.innerHTML = '';
  selectedDesignId = null;
  DESIGNS.forEach(design => {
    const card = document.createElement('article');
    card.className = 'design-card';
    card.setAttribute('role', 'listitem');
    card.dataset.id = design.id;
    card.innerHTML = `
      <div class="design-card-preview">${design.svg}</div>
      <div class="design-card-body">
        <div class="design-card-name">${design.name}</div>
        <div class="design-card-desc">${design.description}</div>
        <div class="design-card-meta">
          <span class="tag">${design.symmetry}</span>
          <span class="tag">${design.complexity}</span>
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
}

function selectDesign(id) {
  selectedDesignId = id;
  const design = DESIGNS.find(d => d.id === id);
  designsGrid.querySelectorAll('.design-card').forEach(card => {
    const btn = card.querySelector('button'), sel = card.dataset.id === id;
    card.classList.toggle('selected', sel);
    btn.textContent = sel ? 'Selected ✓' : 'Select Design';
    btn.classList.toggle('selected', sel);
  });
  previewSvgWrap.innerHTML = design.svg;
  previewSvgWrap.classList.add('has-design');
  if (canvasPlaceholder) canvasPlaceholder.style.display = 'none';
  previewInfoBox.classList.remove('hidden');
  previewDefaultBox.classList.add('hidden');
  previewInfoText.textContent = `"${design.name}" — ${design.symmetry} symmetry, ${design.complexity.toLowerCase()}.`;
  continueBtn2.classList.remove('hidden');
  previewTheme.textContent       = lastParams.theme || '—';
  previewName.textContent        = design.name;
  previewSymmetry.textContent    = design.symmetry;
  previewComplexity.textContent  = design.complexity;
  continueTodo.classList.add('hidden');
  previewInfoSection.classList.remove('hidden');
  previewInfoSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

[continueBtn, continueBtn2].forEach(btn => {
  btn.addEventListener('click', () => {
    // TODO: POST /api/generate-path with selected SVG
    // TODO: Display generated theta/r/pen waypoints
    continueTodo.classList.remove('hidden');
    btn.blur();
  });
});

themeInput.addEventListener('keydown', e => { if (e.key === 'Enter') generateBtn.click(); });
themeInput.addEventListener('input',   ()  => { if (themeInput.value.trim()) themeError.textContent = ''; });
