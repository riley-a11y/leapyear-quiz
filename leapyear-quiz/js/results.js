/**
 * LeapYear Assessment — Results Page Module
 * Reads scored result from localStorage and renders the full results page.
 */

import { OUTPUT_CONTENT } from './content.js';

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function renderResults(result) {
  const c = OUTPUT_CONTENT;

  // Build hero (outside results-content, injected before it)
  let heroHtml = `<div class="results-hero">
    <div class="result-label">Your Pairing</div>
    <div class="result-type">${capitalize(result.primary)} &mdash; ${capitalize(result.secondary)}</div>
  </div>`;

  let html = '';

  // 1. Your Pairing intro
  html += `<div class="result-section">
    <p class="section-intro">${c.sectionIntros.pairing}</p>`;

  // Balanced / Renaissance flags
  if (result.isRenaissance) {
    html += `<div class="result-flag-block">
      <h3>Renaissance Profile</h3>
      <p>${c.sectionIntros.renaissance}</p>
    </div>`;
  } else if (result.isBalanced) {
    html += `<div class="result-flag-block">
      <h3>Balanced Profile</h3>
      <p>${c.sectionIntros.balanced}</p>
    </div>`;
  }
  html += `</div>`;

  // 2. Core Type
  const pNarr = c.primaryNarratives[result.primary];
  html += `<div class="result-section">
    <div class="separator"></div>
    <h2>Core Type: The ${capitalize(result.primary)}</h2>
    <p class="section-intro">${c.sectionIntros.coreType}</p>
    <div class="narrative">${pNarr.narrative.split('\n\n').map(p => `<p>${p}</p>`).join('')}</div>
  </div>`;

  // 3. Secondary Type
  html += `<div class="result-section">
    <div class="separator"></div>
    <h2>Secondary Type: The ${capitalize(result.secondary)}</h2>
    <p class="section-intro">${c.sectionIntros.secondaryType}</p>
    <p>${c.secondaryDescriptions[result.secondary]}</p>
  </div>`;

  // 4. Tension
  const tension = c.tensionTemplates[result.modifiers.tensionTemplate];
  if (tension) {
    html += `<div class="result-section">
      <div class="separator"></div>
      <h2>Your Tension: ${tension.title}</h2>
      <p class="section-intro">${c.sectionIntros.tension}</p>
      <p>${tension.content}</p>
    </div>`;
  }

  // 5. Shadows
  if (result.modifiers.shadows.length > 0) {
    html += `<div class="result-section">
      <div class="separator"></div>
      <h2>Your Shadows</h2>
      <p class="section-intro">${c.sectionIntros.shadow}</p>
      <div class="narrative">`;
    result.modifiers.shadows.forEach(s => {
      if (c.shadowModifiers[s]) {
        html += `<p>${c.shadowModifiers[s]}</p>`;
      }
    });
    html += `</div></div>`;
  }

  // 6. Your Mindset
  const mindsetLabels = { high: 'Growth', low: 'Fixed', mixed: 'Mixed' };
  html += `<div class="result-section">
    <div class="separator"></div>
    <h2>Your Mindset</h2>
    <p class="section-intro">${c.sectionIntros.mindset}</p>
    <div class="mindset-indicator">
      <span class="mindset-label">${mindsetLabels[result.modifiers.growthMindsetTier]} Mindset</span>
    </div>
    <p>${c.growthMindsetClosings[result.modifiers.growthMindsetTier]}</p>
  </div>`;

  // Score chart
  html += `<div class="result-section">
    <div class="separator"></div>
    <h3>Your Archetype Scores</h3>
    <div class="score-chart">`;
  result.allScores.forEach(s => {
    const barClass = s.archetype === result.primary ? 'primary-bar' : s.archetype === result.secondary ? 'secondary-bar' : 'other-bar';
    html += `<div class="score-row">
      <span class="score-label">${capitalize(s.archetype)}</span>
      <div class="score-bar-track"><div class="score-bar-fill ${barClass}" style="width: 0%;" data-width="${s.score}%"></div></div>
      <span class="score-value">${s.score.toFixed(0)}</span>
    </div>`;
  });
  html += `</div></div>`;

  // 7. LeapYear Bridge
  html += `<div class="result-bridge">
    <h2>What Comes Next</h2>
    <p>${c.leapYearBridge}</p>
  </div>`;

  // 8. Calendly CTA Block
  html += `<div class="result-cta-block">
    <h2>${c.leapYearCTA.headline}</h2>
    <p>${c.leapYearCTA.body}</p>
    <a href="${c.leapYearCTA.buttonUrl}" target="_blank" rel="noopener">${c.leapYearCTA.buttonText}</a>
  </div>`;

  // Retake
  html += `<div style="text-align:center; margin-top: 2rem;">
    <button class="btn-retake" onclick="window.location.href='quiz.html'">Take It Again</button>
  </div>`;

  // Insert hero before results-content, then content inside it
  const resultsContent = document.getElementById('results-content');
  // Clear any previous hero
  const existingHero = resultsContent.parentElement.querySelector('.results-hero');
  if (existingHero) existingHero.remove();
  resultsContent.insertAdjacentHTML('beforebegin', heroHtml);
  resultsContent.innerHTML = html;

  // Animate score bars after render
  setTimeout(() => {
    document.querySelectorAll('.score-bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.width;
    });
  }, 100);
}

// ===== Self-initialize on DOMContentLoaded =====

document.addEventListener('DOMContentLoaded', () => {
  const stored = localStorage.getItem('ly_result');
  if (!stored) {
    const resultsContent = document.getElementById('results-content');
    if (resultsContent) {
      resultsContent.innerHTML = `<div class="result-section" style="text-align:center; padding: 4rem 1.5rem;">
        <h2>No results found.</h2>
        <p>Take the assessment first.</p>
        <a href="quiz.html" style="display:inline-block; margin-top:1.5rem; padding:0.75rem 2rem; background:var(--ly-flame); color:#fff; border-radius:8px; text-decoration:none; font-weight:600;">Start Assessment</a>
      </div>`;
    }
    return;
  }

  const result = JSON.parse(stored);
  renderResults(result);
});
