/**
 * LeapYear Assessment — Results Page
 * Renders personalized results with scroll-reveal animations,
 * ambient washes, SVG draw animations, and archetype-colored accents.
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

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function renderResults(result) {
  const c = OUTPUT_CONTENT;
  const pColor = ARCHETYPE_COLORS[result.primary];
  const sColor = ARCHETYPE_COLORS[result.secondary];
  const pNarr = c.primaryNarratives[result.primary];
  const sNarr = c.primaryNarratives[result.secondary];

  // Set CSS custom properties
  document.documentElement.style.setProperty('--core-color', pColor);
  document.documentElement.style.setProperty('--sec-color', sColor);

  // Article prefix
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const prefix = vowels.includes(result.primary.charAt(0)) ? 'an' : 'a';

  // ===== AMBIENT WASHES (fixed behind content) =====
  const washesHtml = `
    <div class="ambient-wash w-primary" style="background: ${pColor};"></div>
    <div class="ambient-wash w-secondary" style="background: ${sColor};"></div>`;

  // ===== HERO =====
  const heroHtml = `<div class="results-hero">
    <div class="hero-wash" style="background: ${pColor}"></div>
    <div class="hero-icon hero-rv" style="color: ${pColor};">${ICONS[result.primary] || ''}</div>
    <div class="hero-tag hero-rv d1">Your Full Profile</div>
    <h1 class="hero-title hero-rv d1">You are ${prefix} <span class="si">${cap(result.primary)}</span>.</h1>
    <div class="hero-pairing hero-rv d2">
      <span>Pairing:</span> <strong>${cap(result.primary)} &mdash; ${cap(result.secondary)}</strong>
    </div>
  </div>`;

  // ===== BODY SECTIONS =====
  let html = '';

  // Pairing intro + flags
  html += `<div class="result-section">
    <div class="section-intro rv">${c.sectionIntros.pairing}</div>`;
  if (result.isRenaissance) {
    const top3 = result.allScores.slice(0, 3);
    html += `<div class="result-flag renaissance-block rv d1" style="--c1: var(--${top3[0].archetype}); --c2: var(--${top3[1].archetype}); --c3: var(--${top3[2].archetype});">
      <div class="ren-wash"></div>
      <div class="ren-content">
        <h3>Renaissance Profile</h3>
        <div class="ren-pills">
          ${top3.map(s => `<span class="ren-pill" style="color: var(--${s.archetype});">${cap(s.archetype)}</span>`).join('')}
        </div>
        <p>${c.sectionIntros.renaissance}</p>
      </div>
    </div>`;
  } else if (result.isBalanced) {
    html += `<div class="result-flag rv d1">
      <h3>Balanced Profile</h3>
      <p>${c.sectionIntros.balanced}</p>
    </div>`;
  }
  html += `</div>`;

  // Core Type
  html += `<div class="result-section">
    <div class="section-header rv">
      <span class="section-label">Core Type</span>
      <h2 class="section-heading">The <span class="si accent">${cap(result.primary)}</span></h2>
    </div>
    <div class="section-intro rv">${c.sectionIntros.coreType}</div>
    <div class="section-body rv">${pNarr.narrative.split('\n\n').map(p => `<p>${p}</p>`).join('')}</div>
  </div>`;

  // Secondary Type
  html += `<div class="result-section">
    <div class="section-header rv">
      <span class="section-label">Secondary Type</span>
      <h2 class="section-heading">The <span class="si" style="color:${sColor}">${cap(result.secondary)}</span></h2>
    </div>
    <div class="section-intro rv">${c.sectionIntros.secondaryType}</div>
    <div class="section-body rv"><p>${c.secondaryDescriptions[result.secondary]}</p></div>
  </div>`;

  // Tension
  const tension = c.tensionTemplates[result.modifiers.tensionTemplate];
  if (tension) {
    html += `<div class="result-section">
      <div class="section-header rv">
        <span class="section-label">Internal Dynamics</span>
        <h2 class="section-heading">Your <span class="si">Tension</span></h2>
      </div>
      <div class="tension-visual rv d1">
        <div class="t-circle-wrap left"><div class="t-circle" style="background:${pColor};"></div></div>
        <div class="t-circle-wrap right"><div class="t-circle" style="background:${sColor};"></div></div>
      </div>
      <h3 class="rv" style="font-family:var(--display);font-weight:700;font-size:18px;color:var(--ink);margin-bottom:8px;">${tension.title}</h3>
      <div class="section-intro rv" style="font-size:18px;margin-bottom:12px;">${c.sectionIntros.tension}</div>
      <div class="section-body rv"><p>${tension.content}</p></div>
    </div>`;
  }

  // Shadows
  if (result.modifiers.shadows.length > 0) {
    html += `<div class="result-section">
      <div class="section-header rv">
        <span class="section-label">Blind Spots</span>
        <h2 class="section-heading">Your <span class="si">Shadows</span></h2>
      </div>
      <div class="section-intro rv">${c.sectionIntros.shadow}</div>
      <div class="shadow-grid">`;
    result.modifiers.shadows.forEach((s, i) => {
      if (c.shadowModifiers[s]) {
        html += `<div class="shadow-card rv d${Math.min(i + 1, 4)}"><p>${c.shadowModifiers[s]}</p></div>`;
      }
    });
    html += `</div></div>`;
  }

  // Mindset
  const mindsetLabels = { high: 'Growth', low: 'Fixed', mixed: 'Mixed' };
  const mindsetClass = result.modifiers.growthMindsetTier === 'high' ? 'growth' : result.modifiers.growthMindsetTier === 'low' ? 'fixed' : 'mixed';
  html += `<div class="result-section">
    <div class="section-header rv">
      <span class="section-label">Framework</span>
      <h2 class="section-heading">Your <span class="si">Mindset</span></h2>
    </div>
    <div class="rv d1"><span class="mindset-badge ${mindsetClass}">${mindsetLabels[result.modifiers.growthMindsetTier]} Mindset</span></div>
    <div class="section-intro rv" style="font-size:18px;">${c.sectionIntros.mindset}</div>
    <div class="section-body rv"><p>${c.growthMindsetClosings[result.modifiers.growthMindsetTier]}</p></div>
  </div>`;

  // Score chart
  html += `<div class="result-section">
    <div class="section-header rv">
      <span class="section-label">Data Breakdown</span>
      <h2 class="section-heading">Archetype <span class="si">Scores</span></h2>
    </div>
    <div class="score-chart rv">`;
  result.allScores.forEach((s, i) => {
    const typeClass = s.archetype === result.primary ? 's-primary' : s.archetype === result.secondary ? 's-secondary' : 's-other';
    html += `<div class="score-row rv d${Math.min(i + 1, 3)}">
      <span class="score-label">${cap(s.archetype)}</span>
      <div class="score-bar-track"><div class="score-bar-fill ${typeClass}" data-width="${s.score}%"></div></div>
      <span class="score-value">${s.score.toFixed(0)}</span>
    </div>`;
  });
  html += `</div></div>`;

  // CTA Bridge (combined)
  html += `<div class="result-bridge rv">
    <h2>Talk Through <span class="si">Your Results</span></h2>
    <p class="bridge-text">${c.leapYearCTA.body}</p>
    <a href="${c.leapYearCTA.buttonUrl}" target="_blank" rel="noopener" class="btn-light">
      ${c.leapYearCTA.buttonText}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
    </a>
  </div>`;

  // Retake
  html += `<div style="text-align:center" class="rv">
    <button class="btn-retake" onclick="window.location.href='quiz.html'">Take the Assessment Again</button>
  </div>`;

  // ===== RENDER =====
  const resultsContent = document.getElementById('results-content');
  const container = resultsContent.parentElement;

  // Remove any previous hero/washes
  container.querySelectorAll('.results-hero, .ambient-wash').forEach(el => el.remove());

  // Inject ambient washes on body
  document.body.insertAdjacentHTML('afterbegin', washesHtml);

  // Inject hero before results content wrapper
  container.insertAdjacentHTML('afterbegin', heroHtml);

  resultsContent.className = 'results-content';
  resultsContent.innerHTML = html;

  // ===== SCROLL REVEAL =====
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('vis');

        // Trigger score bar fills
        const fills = entry.target.querySelectorAll('.score-bar-fill');
        fills.forEach(f => {
          f.style.width = f.dataset.width;
        });

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });

  resultsContent.querySelectorAll('.rv').forEach(el => observer.observe(el));

  // Bridge CTA glow color
  const style = document.createElement('style');
  style.textContent = `.result-bridge::before { background: ${pColor}; }`;
  document.head.appendChild(style);

  // Switch nav to dark mode for hero
  const nav = document.querySelector('.nav');
  if (nav) {
    nav.classList.remove('light-mode');
    nav.classList.add('dark-mode');

    // Switch back to light when scrolling past hero
    const hero = document.querySelector('.results-hero');
    if (hero) {
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
      navObserver.observe(hero);
    }
  }
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
