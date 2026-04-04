/**
 * LeapYear Assessment — Results Page
 * Renders personalized results with scroll-reveal animations
 * and archetype-colored accents.
 */

import { OUTPUT_CONTENT } from './content.js';

const ARCHETYPE_COLORS = {
  philosopher: '#3D4E8C', analyst: '#5E8A72', builder: '#C4724E', organizer: '#C49A3B',
  connector: '#D4847A', mobilizer: '#B8453A', creator: '#7B5B8A', explorer: '#2E8B8B'
};

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function renderResults(result) {
  const c = OUTPUT_CONTENT;
  const coreColor = ARCHETYPE_COLORS[result.primary];
  const secColor = ARCHETYPE_COLORS[result.secondary];
  const pNarr = c.primaryNarratives[result.primary];
  const sNarr = c.primaryNarratives[result.secondary];

  // Set archetype accent as CSS variable
  document.documentElement.style.setProperty('--core-color', coreColor);
  document.documentElement.style.setProperty('--sec-color', secColor);

  // ===== HERO =====
  const heroHtml = `<div class="results-hero">
    <div class="hero-wash" style="background: ${coreColor}"></div>
    <span class="hero-label rv d1">Your Pairing</span>
    <h1 class="hero-type rv d2">The ${cap(result.primary)}</h1>
    <p class="hero-secondary rv d3">with ${cap(result.secondary)}</p>
    <div class="hero-drives rv d4">
      <span class="hero-drive">
        <span class="dot" style="background:${coreColor}"></span>
        <span style="color:rgba(245,241,235,0.6)">${pNarr.coreDrive}</span>
      </span>
      <span class="hero-drive">
        <span class="dot" style="background:${secColor}"></span>
        <span style="color:rgba(245,241,235,0.4)">${sNarr.coreDrive}</span>
      </span>
    </div>
    <span class="hero-scroll-hint">Scroll to explore</span>
  </div>`;

  // ===== BODY SECTIONS =====
  let html = '';

  // Pairing intro + flags
  html += `<div class="result-section">
    <p class="section-intro rv">${c.sectionIntros.pairing}</p>`;
  if (result.isRenaissance) {
    html += `<div class="result-flag rv">
      <h3>Renaissance Profile</h3>
      <p>${c.sectionIntros.renaissance}</p>
    </div>`;
  } else if (result.isBalanced) {
    html += `<div class="result-flag rv">
      <h3>Balanced Profile</h3>
      <p>${c.sectionIntros.balanced}</p>
    </div>`;
  }
  html += `</div>`;

  // Core Type
  html += `<div class="result-section">
    <div class="separator rv"></div>
    <span class="section-label rv">Core Type</span>
    <h2 class="section-heading rv">The <span class="accent">${cap(result.primary)}</span></h2>
    <p class="section-intro rv">${c.sectionIntros.coreType}</p>
    <div class="section-body rv">${pNarr.narrative.split('\n\n').map(p => `<p>${p}</p>`).join('')}</div>
  </div>`;

  // Secondary Type
  html += `<div class="result-section">
    <div class="separator rv"></div>
    <span class="section-label rv">Secondary Type</span>
    <h2 class="section-heading rv">The <span style="color:${secColor}">${cap(result.secondary)}</span></h2>
    <p class="section-intro rv">${c.sectionIntros.secondaryType}</p>
    <div class="section-body rv"><p>${c.secondaryDescriptions[result.secondary]}</p></div>
  </div>`;

  // Tension
  const tension = c.tensionTemplates[result.modifiers.tensionTemplate];
  if (tension) {
    // Extract the first compelling sentence for the pull quote
    const sentences = tension.content.split('. ');
    const pullQuote = sentences[0] + '.';
    const remaining = sentences.slice(1).join('. ');

    html += `<div class="result-section">
      <div class="separator rv"></div>
      <span class="section-label rv">Your Tension</span>
      <h2 class="section-heading rv">${tension.title}</h2>
      <p class="section-intro rv">${c.sectionIntros.tension}</p>
      <div class="tension-quote rv"><p>${pullQuote}</p></div>
      <div class="section-body rv"><p>${remaining}</p></div>
    </div>`;
  }

  // Shadows
  if (result.modifiers.shadows.length > 0) {
    html += `<div class="result-section">
      <div class="separator rv"></div>
      <span class="section-label rv">Your Shadows</span>
      <h2 class="section-heading rv">The Other Side of Your Strengths</h2>
      <p class="section-intro rv">${c.sectionIntros.shadow}</p>
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
    <div class="separator rv"></div>
    <span class="section-label rv">Your Mindset</span>
    <h2 class="section-heading rv">How You Think About Growth</h2>
    <p class="section-intro rv">${c.sectionIntros.mindset}</p>
    <div class="rv"><span class="mindset-badge ${mindsetClass}">${mindsetLabels[result.modifiers.growthMindsetTier]} Mindset</span></div>
    <div class="section-body rv"><p>${c.growthMindsetClosings[result.modifiers.growthMindsetTier]}</p></div>
  </div>`;

  // Score chart
  html += `<div class="result-section">
    <div class="separator rv"></div>
    <span class="section-label rv">Full Profile</span>
    <h2 class="section-heading rv">Your Archetype Scores</h2>
    <div class="score-chart rv">`;
  result.allScores.forEach(s => {
    const isPrimary = s.archetype === result.primary;
    const isSecondary = s.archetype === result.secondary;
    const rowClass = isPrimary ? 'is-primary' : isSecondary ? 'is-secondary' : '';
    const barColor = ARCHETYPE_COLORS[s.archetype];
    const barOpacity = isPrimary ? 1 : isSecondary ? 0.7 : 0.2;
    html += `<div class="score-row ${rowClass}">
      <span class="score-label">${cap(s.archetype)}</span>
      <div class="score-bar-track"><div class="score-bar-fill" style="background:${barColor}; opacity:${barOpacity}" data-width="${s.score}%"></div></div>
      <span class="score-value">${s.score.toFixed(0)}</span>
    </div>`;
  });
  html += `</div></div>`;

  // Bridge
  html += `<div class="result-bridge rv">
    <h2>What Comes Next</h2>
    <p>${c.leapYearBridge}</p>
  </div>`;

  // CTA
  html += `<div class="result-cta rv">
    <h2>${c.leapYearCTA.headline}</h2>
    <p>${c.leapYearCTA.body}</p>
    <a href="${c.leapYearCTA.buttonUrl}" target="_blank" rel="noopener">${c.leapYearCTA.buttonText}</a>
  </div>`;

  // Retake
  html += `<div style="text-align:center" class="rv">
    <button class="btn-retake" onclick="window.location.href='quiz.html'">Take It Again</button>
  </div>`;

  // ===== RENDER =====
  const resultsContent = document.getElementById('results-content');
  const existingHero = resultsContent.parentElement.querySelector('.results-hero');
  if (existingHero) existingHero.remove();
  resultsContent.insertAdjacentHTML('beforebegin', heroHtml);
  resultsContent.className = 'results-content';
  resultsContent.innerHTML = html;

  // ===== SCROLL REVEAL =====
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('vis');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  // Observe all .rv elements (except hero ones which animate immediately)
  resultsContent.querySelectorAll('.rv').forEach(el => observer.observe(el));

  // Hero reveals trigger immediately
  document.querySelectorAll('.results-hero .rv').forEach(el => {
    setTimeout(() => el.classList.add('vis'), 100);
  });

  // Animate score bars when chart scrolls in
  const chartEl = resultsContent.querySelector('.score-chart');
  if (chartEl) {
    const chartObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.score-bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.width;
          });
          chartObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    chartObserver.observe(chartEl);
  }

  // Set CTA and bridge wash colors
  const bridge = resultsContent.querySelector('.result-bridge');
  if (bridge) bridge.querySelector('::before') || (bridge.style.setProperty('--wash', coreColor));
  const cta = resultsContent.querySelector('.result-cta');
  if (cta) cta.style.setProperty('--wash', coreColor);

  // Apply wash colors via inline styles (pseudo-elements can't be styled inline)
  const style = document.createElement('style');
  style.textContent = `
    .result-bridge::before { background: ${coreColor}; }
    .result-cta::before { background: ${coreColor}; }
  `;
  document.head.appendChild(style);
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
