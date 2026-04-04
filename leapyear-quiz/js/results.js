/**
 * LeapYear Assessment — Results Page
 * Card dashboard with modal overlays, sticky badge, share image generation.
 */

import { OUTPUT_CONTENT } from './content.js';

const ARCHETYPE_COLORS = {
  philosopher: '#3D4E8C', analyst: '#5E8A72', builder: '#C4724E', organizer: '#C49A3B',
  connector: '#D4847A', mobilizer: '#B8453A', creator: '#7B5B8A', explorer: '#2E8B8B'
};

const ICONS = {
  philosopher: `<svg viewBox="0 0 180 180" fill="none"><circle cx="90" cy="90" r="25.2" stroke="currentColor" stroke-width="1.8"/><circle cx="90" cy="90" r="50.4" stroke="currentColor" stroke-width="1.8"/><circle cx="90" cy="90" r="75.6" stroke="currentColor" stroke-width="1.8"/><circle cx="90" cy="90" r="6.3" fill="currentColor"/></svg>`,
  analyst: `<svg viewBox="0 0 180 180" fill="none"><path d="M154.8 90L122.4 146.124H57.6L25.2 90L57.6 33.876H122.4L154.8 90Z" stroke="currentColor" stroke-width="1.8"/><path d="M133.2 90L111.6 127.404H68.4L46.8 90L68.4 52.596H111.6L133.2 90Z" stroke="currentColor" stroke-width="1.8"/></svg>`,
  builder: `<svg viewBox="0 0 180 180" fill="none"><path d="M27 153V90C27 73.291 33.637 57.267 45.452 45.452C57.267 33.637 73.291 27 90 27C106.709 27 122.733 33.637 134.548 45.452C146.362 57.267 153 73.291 153 90V153" stroke="currentColor" stroke-width="1.8" stroke-linecap="square"/><path d="M54 153V90C54 80.452 57.793 71.295 64.544 64.544C71.295 57.793 80.452 54 90 54C99.548 54 108.705 57.793 115.456 64.544C122.207 71.295 126 80.452 126 90V153" stroke="currentColor" stroke-width="1.8" stroke-linecap="square"/></svg>`,
  organizer: `<svg viewBox="0 0 180 180" fill="none"><path d="M90 25.2L118.058 41.4V73.8L90 90L61.942 73.8V41.4L90 25.2Z" stroke="currentColor" stroke-width="1.8"/><path d="M61.938 73.8L89.996 90V122.4L61.938 138.6L33.88 122.4V90L61.938 73.8Z" stroke="currentColor" stroke-width="1.8"/><path d="M118.062 73.8L146.12 90V122.4L118.062 138.6L90.004 122.4V90L118.062 73.8Z" stroke="currentColor" stroke-width="1.8"/></svg>`,
  connector: `<svg viewBox="0 0 180 180" fill="none"><circle cx="90" cy="63" r="46.8" stroke="currentColor" stroke-width="1.8"/><circle cx="66.6" cy="103.5" r="46.8" stroke="currentColor" stroke-width="1.8"/><circle cx="113.4" cy="103.5" r="46.8" stroke="currentColor" stroke-width="1.8"/></svg>`,
  mobilizer: `<svg viewBox="0 0 180 180" fill="none"><path d="M39.6 36L93.6 90L39.6 144" stroke="currentColor" stroke-width="1.8"/><path d="M66.6 36L120.6 90L66.6 144" stroke="currentColor" stroke-width="1.8"/><path d="M93.6 36L147.6 90L93.6 144" stroke="currentColor" stroke-width="1.8"/></svg>`,
  creator: `<svg viewBox="0 0 180 180" fill="none"><ellipse cx="90" cy="90" rx="68.4" ry="21.6" stroke="currentColor" stroke-width="1.8"/><ellipse cx="90" cy="90" rx="68.4" ry="21.6" stroke="currentColor" stroke-width="1.8" transform="rotate(60 90 90)"/><ellipse cx="90" cy="90" rx="68.4" ry="21.6" stroke="currentColor" stroke-width="1.8" transform="rotate(120 90 90)"/></svg>`,
  explorer: `<svg viewBox="0 0 180 180" fill="none"><circle cx="90" cy="90" r="64.8" stroke="currentColor" stroke-width="1.8"/><path d="M90 25.2L97.2 82.8L154.8 90L97.2 97.2L90 154.8L82.8 97.2L25.2 90L82.8 82.8L90 25.2Z" stroke="currentColor" stroke-width="1.8"/></svg>`
};

const CLOSE_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
const ARROW_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>`;
const SHARE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>`;

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ===== MODAL SYSTEM =====
let modalBackdrop = null;
let modalSheet = null;
let dragStartY = 0;
let dragCurrentY = 0;
let isDragging = false;

function isMobile() {
  return window.innerWidth <= 768;
}

function createModalSystem() {
  modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';
  document.body.appendChild(modalBackdrop);

  modalSheet = document.createElement('div');
  modalSheet.className = 'modal-sheet';
  // Hidden by default
  modalSheet.style.opacity = '0';
  modalSheet.style.pointerEvents = 'none';
  if (isMobile()) {
    modalSheet.style.transform = 'translateY(100%)';
  } else {
    modalSheet.style.transform = 'translate(-50%, -50%) scale(0.95)';
  }
  document.body.appendChild(modalSheet);

  modalBackdrop.addEventListener('click', closeModal);

  // Swipe to dismiss (mobile)
  modalSheet.addEventListener('touchstart', (e) => {
    const handle = modalSheet.querySelector('.modal-handle');
    if (!handle) return;
    if (e.target === handle || handle.contains(e.target) || modalSheet.scrollTop <= 0) {
      dragStartY = e.touches[0].clientY;
      isDragging = true;
      modalSheet.style.transition = 'none';
    }
  }, { passive: true });

  modalSheet.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    dragCurrentY = e.touches[0].clientY;
    const delta = dragCurrentY - dragStartY;
    if (delta > 0) {
      modalSheet.style.transform = `translateY(${delta}px)`;
    }
  }, { passive: true });

  modalSheet.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    const delta = dragCurrentY - dragStartY;
    if (delta > 120) {
      closeModal();
    } else {
      modalSheet.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      modalSheet.style.transform = 'translateY(0)';
    }
    dragStartY = 0;
    dragCurrentY = 0;
  });
}

function openModal(contentHtml) {
  modalSheet.innerHTML = `
    <div class="modal-handle"></div>
    <button class="modal-close">${CLOSE_SVG}</button>
    <div class="modal-content">${contentHtml}</div>
  `;

  modalSheet.querySelector('.modal-close').addEventListener('click', closeModal);

  // Prevent body scroll
  document.body.style.overflow = 'hidden';

  // Show modal with JS inline styles
  const mobile = isMobile();
  modalSheet.style.pointerEvents = 'auto';
  modalSheet.style.opacity = '1';
  if (mobile) {
    modalSheet.style.transform = 'translateY(0)';
  } else {
    modalSheet.style.transform = 'translate(-50%, -50%) scale(1)';
  }

  // Show backdrop
  modalBackdrop.style.background = 'rgba(0,0,0,0.5)';
  modalBackdrop.style.pointerEvents = 'auto';

  // Animate score bars if present
  setTimeout(() => {
    modalSheet.querySelectorAll('.modal-score-fill').forEach(f => {
      f.style.width = f.dataset.width;
    });
  }, 300);
}

function closeModal() {
  const mobile = isMobile();
  modalSheet.style.opacity = '0';
  modalSheet.style.pointerEvents = 'none';
  if (mobile) {
    modalSheet.style.transform = 'translateY(100%)';
  } else {
    modalSheet.style.transform = 'translate(-50%, -50%) scale(0.95)';
  }
  modalBackdrop.style.background = 'rgba(0,0,0,0)';
  modalBackdrop.style.pointerEvents = 'none';
  document.body.style.overflow = '';
  modalSheet.innerHTML = '';
}

// ===== SHARE IMAGE GENERATION =====
function generateShareImage(result, callback) {
  const canvas = document.createElement('canvas');
  const w = 1080;
  const h = 1920;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const pColor = ARCHETYPE_COLORS[result.primary];
  const sColor = ARCHETYPE_COLORS[result.secondary];

  // Background
  ctx.fillStyle = '#1B1918';
  ctx.fillRect(0, 0, w, h);

  // Color wash
  const grd = ctx.createRadialGradient(w / 2, h * 0.35, 0, w / 2, h * 0.35, 500);
  grd.addColorStop(0, pColor + '60');
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);

  // Secondary wash
  const grd2 = ctx.createRadialGradient(w * 0.7, h * 0.7, 0, w * 0.7, h * 0.7, 400);
  grd2.addColorStop(0, sColor + '30');
  grd2.addColorStop(1, 'transparent');
  ctx.fillStyle = grd2;
  ctx.fillRect(0, 0, w, h);

  // "Your Full Profile" label
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(250,247,241,0.4)';
  ctx.font = '700 28px area-normal, sans-serif';
  ctx.letterSpacing = '6px';
  ctx.fillText('YOUR FULL PROFILE', w / 2, h * 0.32);

  // "You are a"
  ctx.fillStyle = '#FAF7F1';
  ctx.font = '700 72px neulis-neue, sans-serif';
  ctx.fillText('You are ' + ((['a','e','i','o','u'].includes(result.primary.charAt(0))) ? 'an' : 'a'), w / 2, h * 0.42);

  // Archetype name
  ctx.font = 'italic 400 120px Instrument Serif, Georgia, serif';
  ctx.fillText(cap(result.primary) + '.', w / 2, h * 0.50);

  // Pairing
  ctx.fillStyle = 'rgba(250,247,241,0.5)';
  ctx.font = '600 36px area-normal, sans-serif';
  ctx.fillText(cap(result.primary) + '  —  ' + cap(result.secondary), w / 2, h * 0.58);

  // Core drives
  const pNarr = OUTPUT_CONTENT.primaryNarratives[result.primary];
  const sNarr = OUTPUT_CONTENT.primaryNarratives[result.secondary];
  if (pNarr && sNarr) {
    ctx.fillStyle = 'rgba(250,247,241,0.3)';
    ctx.font = '600 26px area-normal, sans-serif';
    ctx.fillText(pNarr.coreDrive + '  ·  ' + sNarr.coreDrive, w / 2, h * 0.63);
  }

  // Divider
  ctx.strokeStyle = 'rgba(250,247,241,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w * 0.3, h * 0.68);
  ctx.lineTo(w * 0.7, h * 0.68);
  ctx.stroke();

  // Scores preview
  const sorted = result.allScores.slice(0, 4);
  sorted.forEach((s, i) => {
    const y = h * 0.73 + i * 60;
    const barW = (s.score / 100) * 400;
    ctx.fillStyle = 'rgba(250,247,241,0.3)';
    ctx.font = '700 22px area-normal, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(cap(s.archetype), w * 0.35, y + 5);
    ctx.fillStyle = 'rgba(250,247,241,0.08)';
    ctx.fillRect(w * 0.38, y - 4, 420, 8);
    ctx.fillStyle = s.archetype === result.primary ? pColor : s.archetype === result.secondary ? sColor : 'rgba(250,247,241,0.2)';
    ctx.fillRect(w * 0.38, y - 4, barW, 8);
  });

  // LeapYear branding
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(250,247,241,0.2)';
  ctx.font = '700 28px neulis-neue, sans-serif';
  ctx.fillText('LeapYear', w / 2, h * 0.92);

  ctx.fillStyle = 'rgba(250,247,241,0.12)';
  ctx.font = '400 22px area-normal, sans-serif';
  ctx.fillText('startleapyear.com/quiz', w / 2, h * 0.95);

  callback(canvas);
}

// ===== MAIN RENDER =====
function renderResults(result) {
  const c = OUTPUT_CONTENT;
  const pColor = ARCHETYPE_COLORS[result.primary];
  const sColor = ARCHETYPE_COLORS[result.secondary];
  const pNarr = c.primaryNarratives[result.primary];
  const sNarr = c.primaryNarratives[result.secondary];

  document.documentElement.style.setProperty('--core-color', pColor);
  document.documentElement.style.setProperty('--sec-color', sColor);

  const prefix = ['a','e','i','o','u'].includes(result.primary.charAt(0)) ? 'an' : 'a';

  // Create modal system
  createModalSystem();

  // ===== BUILD PAGE HTML =====
  const container = document.getElementById('results');

  // Clean up
  container.querySelectorAll('.results-hero, .ambient-wash, .pairing-intro, .card-grid, .results-bottom, .sticky-badge').forEach(el => el.remove());

  // Ambient washes
  document.body.insertAdjacentHTML('afterbegin', `
    <div class="ambient-wash w-primary" style="background: ${pColor};"></div>
    <div class="ambient-wash w-secondary" style="background: ${sColor};"></div>
  `);

  // Hero
  const heroHtml = `<div class="results-hero">
    <div class="hero-wash" style="background: ${pColor}"></div>
    <div class="hero-icon hero-rv" style="color: ${pColor};">${ICONS[result.primary] || ''}</div>
    <div class="hero-tag hero-rv d1">Your Full Profile</div>
    <h1 class="hero-title hero-rv d1">You are ${prefix} <span class="si">${cap(result.primary)}</span>.</h1>
    <div class="hero-pairing hero-rv d2">
      <span>Pairing:</span> <strong>${cap(result.primary)} &mdash; ${cap(result.secondary)}</strong>
    </div>
  </div>`;

  // Pairing intro + renaissance/balanced
  let introHtml = `<div class="pairing-intro">
    <div class="intro-text rv">${c.sectionIntros.pairing}</div>`;
  if (result.isRenaissance) {
    const top3 = result.allScores.slice(0, 3);
    introHtml += `<div class="result-flag renaissance-block rv d1" style="--c1: var(--${top3[0].archetype}); --c2: var(--${top3[1].archetype}); --c3: var(--${top3[2].archetype});">
      <div class="ren-wash"></div>
      <div class="ren-content">
        <h3>Renaissance Profile</h3>
        <div class="ren-pills">${top3.map(s => `<span class="ren-pill" style="color: var(--${s.archetype});">${cap(s.archetype)}</span>`).join('')}</div>
        <p>${c.sectionIntros.renaissance}</p>
      </div>
    </div>`;
  } else if (result.isBalanced) {
    introHtml += `<div class="result-flag rv d1"><h3>Balanced Profile</h3><p>${c.sectionIntros.balanced}</p></div>`;
  }
  introHtml += `</div>`;

  // Card grid
  const tension = c.tensionTemplates[result.modifiers.tensionTemplate];
  const shadowCount = result.modifiers.shadows.filter(s => c.shadowModifiers[s]).length;
  const mindsetLabel = result.modifiers.growthMindsetTier === 'high' ? 'Growth' : result.modifiers.growthMindsetTier === 'low' ? 'Fixed' : 'Mixed';
  const mindsetClass = result.modifiers.growthMindsetTier === 'high' ? 'growth' : result.modifiers.growthMindsetTier === 'low' ? 'fixed' : 'mixed';

  // Mini bars for scores preview
  const topScores = result.allScores.slice(0, 4);
  const maxScore = Math.max(...topScores.map(s => s.score));
  const miniBarsHtml = topScores.map(s =>
    `<div class="card-mini-bar" style="width:${(s.score / maxScore) * 100}%;background:rgba(250,247,241,${s.archetype === result.primary ? '0.6' : '0.2'})"></div>`
  ).join('');

  let gridHtml = `<div class="card-grid">
    <!-- Core Type -->
    <div class="explore-card card-dark rv d1" data-section="core">
      <div class="card-wash" style="background:radial-gradient(circle at 30% 30%, ${pColor}, transparent)"></div>
      <div>
        <div class="card-icon" style="color:${pColor}">${ICONS[result.primary] || ''}</div>
        <div class="card-label">Core Type</div>
        <div class="card-title">The <span class="si">${cap(result.primary)}</span></div>
      </div>
      <div class="card-hook">${pNarr.coreDrive}</div>
      <div class="card-arrow">${ARROW_SVG}</div>
    </div>

    <!-- Secondary -->
    <div class="explore-card card-dark rv d2" data-section="secondary">
      <div class="card-wash" style="background:radial-gradient(circle at 70% 30%, ${sColor}, transparent)"></div>
      <div>
        <div class="card-icon" style="color:${sColor}">${ICONS[result.secondary] || ''}</div>
        <div class="card-label">Secondary Type</div>
        <div class="card-title">The <span class="si">${cap(result.secondary)}</span></div>
      </div>
      <div class="card-hook">${sNarr.coreDrive}</div>
      <div class="card-arrow">${ARROW_SVG}</div>
    </div>

    <!-- Tension -->
    ${tension ? `<div class="explore-card card-light rv d3" data-section="tension">
      <div>
        <div class="card-tension-preview">
          <div class="card-tension-dot" style="background:${pColor}"></div>
          <div class="card-tension-dot" style="background:${sColor}"></div>
        </div>
        <div class="card-label">Internal Dynamics</div>
        <div class="card-title">Your <span class="si">Tension</span></div>
      </div>
      <div class="card-hook">${tension.title}</div>
      <div class="card-arrow">${ARROW_SVG}</div>
    </div>` : ''}

    <!-- Strengths & Shadows -->
    <div class="explore-card card-dark rv d4" data-section="shadows">
      <div>
        ${shadowCount > 0 ? `<div class="card-shadow-count">${shadowCount}</div>` : `<div class="card-shadow-count">&#9681;</div>`}
        <div class="card-label">Strengths & Shadows</div>
        <div class="card-title">Two <span class="si">Sides</span></div>
      </div>
      <div class="card-hook">${shadowCount > 0 ? `${shadowCount} insights to explore` : 'The other side of your strengths'}</div>
      <div class="card-arrow">${ARROW_SVG}</div>
    </div>

    <!-- Mindset -->
    <div class="explore-card card-dark rv d5" data-section="mindset">
      <div>
        <span class="card-mindset-badge ${mindsetClass}">${mindsetLabel}</span>
        <div class="card-label">Framework</div>
        <div class="card-title">Your <span class="si">Mindset</span></div>
      </div>
      <div class="card-hook">How you think about growth</div>
      <div class="card-arrow">${ARROW_SVG}</div>
    </div>

    <!-- Scores -->
    <div class="explore-card card-dark rv d6" data-section="scores">
      <div>
        <div class="card-mini-bars">${miniBarsHtml}</div>
        <div class="card-label">Data Breakdown</div>
        <div class="card-title">Archetype <span class="si">Scores</span></div>
      </div>
      <div class="card-hook">Full profile breakdown</div>
      <div class="card-arrow">${ARROW_SVG}</div>
    </div>

    <!-- Share -->
    <div class="explore-card card-share rv d6" data-section="share">
      <div class="card-share-icon">${SHARE_ICON}</div>
      <div class="card-share-text">
        <div class="card-title" style="color:var(--cream)">Share Your Type</div>
        <div class="card-hook">Generate a story-ready image</div>
      </div>
      <div class="card-arrow" style="position:static;width:20px;height:20px;color:rgba(250,247,241,0.3)">${ARROW_SVG}</div>
    </div>
  </div>`;

  // CTA Bridge
  const bottomHtml = `<div class="results-bottom rv">
    <div class="result-bridge">
      <h2>Talk Through <span class="si">Your Results</span></h2>
      <p class="bridge-text">${c.leapYearCTA.body}</p>
      <a href="${c.leapYearCTA.buttonUrl}" target="_blank" rel="noopener" class="btn-light">
        ${c.leapYearCTA.buttonText}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </a>
    </div>
    <div style="text-align:center">
      <button class="btn-retake" onclick="window.location.href='quiz.html'">Take the Assessment Again</button>
    </div>
  </div>`;

  // Sticky badge
  const badgeHtml = `<div class="sticky-badge" id="sticky-badge">
    <span class="badge-dot" style="background:${pColor}"></span>
    <span>${cap(result.primary)}</span>
    <span class="badge-sep"></span>
    <span class="badge-dot" style="background:${sColor}"></span>
    <span>${cap(result.secondary)}</span>
  </div>`;

  // ===== INJECT =====
  const resultsContent = document.getElementById('results-content');
  resultsContent.innerHTML = '';
  container.insertAdjacentHTML('afterbegin', heroHtml);
  container.insertAdjacentHTML('beforeend', introHtml);
  container.insertAdjacentHTML('beforeend', gridHtml);
  container.insertAdjacentHTML('beforeend', bottomHtml);
  document.body.insertAdjacentHTML('beforeend', badgeHtml);

  // Bridge glow
  const style = document.createElement('style');
  style.textContent = `.result-bridge::before { background: ${pColor}; }`;
  document.head.appendChild(style);

  // ===== CARD CLICK HANDLERS =====
  document.querySelectorAll('.explore-card[data-section]').forEach(card => {
    card.addEventListener('click', () => {
      const section = card.dataset.section;
      if (section === 'share') {
        openShareModal(result);
      } else {
        const content = buildModalContent(section, result, c, pColor, sColor);
        openModal(content);
      }
    });
    // Ensure touch devices fire reliably
    card.style.webkitTapHighlightColor = 'transparent';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
  });

  // ===== SCROLL REVEALS =====
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('vis');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });

  document.querySelectorAll('.pairing-intro .rv, .card-grid .rv, .results-bottom .rv').forEach(el => observer.observe(el));

  // ===== STICKY BADGE =====
  const badge = document.getElementById('sticky-badge');
  const heroEl = document.querySelector('.results-hero');
  const badgeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        badge.classList.remove('vis');
      } else {
        badge.classList.add('vis');
      }
    });
  }, { threshold: 0.3 });
  if (heroEl) badgeObserver.observe(heroEl);

  // ===== NAV MODE =====
  const nav = document.querySelector('.nav');
  if (nav && heroEl) {
    nav.classList.remove('light-mode');
    nav.classList.add('dark-mode');
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          nav.classList.add('dark-mode');
          nav.classList.remove('light-mode');
        } else {
          nav.classList.remove('dark-mode');
          nav.classList.add('light-mode');
        }
      });
    }, { threshold: 0.1 });
    navObserver.observe(heroEl);
  }

  // Escape to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

// ===== MODAL CONTENT BUILDERS =====
function buildModalContent(section, result, c, pColor, sColor) {
  const pNarr = c.primaryNarratives[result.primary];
  const sNarr = c.primaryNarratives[result.secondary];

  switch (section) {
    case 'core':
      return `
        <span class="modal-label">Core Type</span>
        <h2 class="modal-heading">The <span class="si" style="color:${pColor}">${cap(result.primary)}</span></h2>
        <p class="modal-intro">${c.sectionIntros.coreType}</p>
        <div class="modal-body">${pNarr.narrative.split('\n\n').map(p => `<p>${p}</p>`).join('')}</div>
      `;

    case 'secondary':
      return `
        <span class="modal-label">Secondary Type</span>
        <h2 class="modal-heading">The <span class="si" style="color:${sColor}">${cap(result.secondary)}</span></h2>
        <p class="modal-intro">${c.sectionIntros.secondaryType}</p>
        <div class="modal-body"><p>${c.secondaryDescriptions[result.secondary]}</p></div>
      `;

    case 'tension': {
      const tension = c.tensionTemplates[result.modifiers.tensionTemplate];
      if (!tension) return '';
      return `
        <span class="modal-label">Internal Dynamics</span>
        <h2 class="modal-heading">Your <span class="si">Tension</span></h2>
        <div class="modal-tension-visual">
          <div class="modal-t-circle" style="background:${pColor}"></div>
          <div class="modal-t-circle" style="background:${sColor}"></div>
        </div>
        <h3 style="font-family:var(--display);font-weight:700;font-size:20px;color:var(--ink);margin-bottom:12px;">${tension.title}</h3>
        <p class="modal-intro" style="font-size:17px;">${c.sectionIntros.tension}</p>
        <div class="modal-body"><p>${tension.content}</p></div>
      `;
    }

    case 'shadows': {
      let cards = '';
      result.modifiers.shadows.forEach(s => {
        if (c.shadowModifiers[s]) {
          cards += `<div class="modal-shadow-card"><p>${c.shadowModifiers[s]}</p></div>`;
        }
      });
      // If no specific shadow modifiers fired, extract shadow content from primary narrative
      if (!cards) {
        const pNarrText = pNarr.narrative;
        // Find the shadow paragraph — typically starts with "But here's your shadow" or "Your shadow" or "That's your shadow"
        const shadowMatch = pNarrText.match(/(?:But here['']s (?:your|the) shadow|Your shadow|That['']s your shadow|The hard part)[^]*$/i);
        if (shadowMatch) {
          const shadowParagraphs = shadowMatch[0].split('\n\n').filter(p => p.trim());
          shadowParagraphs.forEach(p => {
            cards += `<div class="modal-shadow-card"><p>${p.trim()}</p></div>`;
          });
        }
      }
      return `
        <span class="modal-label">Strengths & Shadows</span>
        <h2 class="modal-heading">The Other Side of Your <span class="si">Strengths</span></h2>
        <p class="modal-intro">${c.sectionIntros.shadow}</p>
        <div class="modal-shadow-grid">${cards}</div>
      `;
    }

    case 'mindset': {
      const tier = result.modifiers.growthMindsetTier;
      const label = tier === 'high' ? 'Growth' : tier === 'low' ? 'Fixed' : 'Mixed';
      const cls = tier === 'high' ? 'growth' : tier === 'low' ? 'fixed' : 'mixed';
      return `
        <span class="modal-label">Framework</span>
        <h2 class="modal-heading">Your <span class="si">Mindset</span></h2>
        <span class="modal-mindset-badge ${cls}">${label} Mindset</span>
        <p class="modal-intro" style="font-size:17px;">${c.sectionIntros.mindset}</p>
        <div class="modal-body"><p>${c.growthMindsetClosings[tier]}</p></div>
      `;
    }

    case 'scores': {
      let rows = '';
      result.allScores.forEach(s => {
        const typeClass = s.archetype === result.primary ? 's-primary' : s.archetype === result.secondary ? 's-secondary' : 's-other';
        rows += `<div class="modal-score-row">
          <span class="modal-score-label">${cap(s.archetype)}</span>
          <div class="modal-score-track"><div class="modal-score-fill ${typeClass}" data-width="${s.score}%"></div></div>
          <span class="modal-score-value">${s.score.toFixed(0)}</span>
        </div>`;
      });
      return `
        <span class="modal-label">Data Breakdown</span>
        <h2 class="modal-heading">Archetype <span class="si">Scores</span></h2>
        <div class="modal-score-chart">${rows}</div>
      `;
    }

    default:
      return '';
  }
}

// ===== SHARE MODAL =====
function openShareModal(result) {
  generateShareImage(result, (canvas) => {
    const dataUrl = canvas.toDataURL('image/png');

    let shareBtn = '';
    if (navigator.share && navigator.canShare) {
      shareBtn = `<button class="btn-share-native" id="share-native">Share</button>`;
    }

    const html = `
      <span class="modal-label">Share Your Type</span>
      <h2 class="modal-heading">Save & <span class="si">Share</span></h2>
      <div class="share-preview">
        <canvas id="share-canvas" style="display:none"></canvas>
        <img src="${dataUrl}" style="width:100%;max-width:280px;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.15);" alt="Your LeapYear Profile">
        <div class="share-actions">
          <button class="btn-download" id="share-download">Download Image</button>
          ${shareBtn}
        </div>
      </div>
    `;

    openModal(html);

    // Wire download
    setTimeout(() => {
      const dlBtn = document.getElementById('share-download');
      if (dlBtn) {
        dlBtn.addEventListener('click', () => {
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `leapyear-${result.primary}.png`;
          a.click();
        });
      }

      const nativeBtn = document.getElementById('share-native');
      if (nativeBtn) {
        nativeBtn.addEventListener('click', async () => {
          try {
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], `leapyear-${result.primary}.png`, { type: 'image/png' });
            await navigator.share({ files: [file], title: `I'm a ${cap(result.primary)}!`, text: `I just took the LeapYear assessment — I'm a ${cap(result.primary)}!` });
          } catch (err) { /* user cancelled */ }
        });
      }
    }, 100);
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  const stored = localStorage.getItem('ly_result');
  if (!stored) {
    const el = document.getElementById('results-content');
    if (el) {
      el.innerHTML = `<div style="text-align:center; padding: 6rem 1.5rem; min-height: 60vh; display:flex; flex-direction:column; align-items:center; justify-content:center;">
        <h2 style="font-family:var(--display); font-size:1.5rem; color:var(--ink); margin-bottom:0.75rem;">No results found.</h2>
        <p style="font-family:var(--body); color:var(--t2); margin-bottom:2rem;">Take the assessment first.</p>
        <a href="quiz.html" style="font-family:var(--body); font-weight:600; font-size:15px; padding:14px 36px; background:var(--ink); color:var(--cream); border-radius:100px; text-decoration:none;">Start Assessment</a>
      </div>`;
    }
    return;
  }

  renderResults(JSON.parse(stored));
});
