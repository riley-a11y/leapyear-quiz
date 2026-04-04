/**
 * LeapYear Assessment — Quiz Logic Module
 * Manages quiz state, question rendering, option selection, and email capture flow.
 */

import { ITEMS, SCALES } from './items.js';
import { scoreAssessment } from './scoring.js';

// ===== Module State =====
let currentIndex = 0;
const responses = {};
let capturedUserData = null;

// ===== Quiz Rendering =====

function renderQuestion() {
  const item = ITEMS[currentIndex];
  const scale = SCALES[item.scale];
  const pct = Math.round((currentIndex / ITEMS.length) * 100);

  document.getElementById('progress-text').textContent = `Question ${currentIndex + 1} of ${ITEMS.length}`;
  document.getElementById('progress-pct').textContent = `${pct}%`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
  document.getElementById('question-stem').textContent = scale.stem;
  document.getElementById('question-text').textContent = item.text;
  document.getElementById('btn-back').disabled = currentIndex === 0;

  const optionsEl = document.getElementById('options');
  optionsEl.innerHTML = '';
  scale.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn' + (responses[item.id] === opt.value ? ' selected' : '');
    btn.innerHTML = `<span class="option-num">${opt.value}</span><span>${opt.label}</span>`;
    btn.addEventListener('click', () => selectOption(item.id, opt.value));
    optionsEl.appendChild(btn);
  });

  // Fade effect
  const area = document.getElementById('question-area');
  area.classList.remove('fade-active');
  area.classList.add('fade-enter');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      area.classList.remove('fade-enter');
      area.classList.add('fade-active');
    });
  });
}

// ===== Option Selection =====

function selectOption(itemId, value) {
  responses[itemId] = value;

  // Brief highlight before advancing
  document.querySelectorAll('.option-btn').forEach((btn, i) => {
    if (SCALES[ITEMS[currentIndex].scale].options[i].value === value) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });

  setTimeout(() => {
    if (currentIndex < ITEMS.length - 1) {
      currentIndex++;
      renderQuestion();
    } else {
      // Show email capture, hide assessment
      document.getElementById('assessment').style.display = 'none';
      document.getElementById('email-capture').style.display = 'flex';
    }
  }, 250);
}

// ===== Navigation =====

function goBack() {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
}

// ===== Email Capture =====

function submitEmailCapture(e) {
  e.preventDefault();
  const name = document.getElementById('capture-name').value.trim();
  const email = document.getElementById('capture-email').value.trim();
  if (!name || !email) return;

  const btn = document.getElementById('capture-submit');
  btn.disabled = true;
  btn.textContent = 'Loading...';

  // Score the assessment
  const result = scoreAssessment(responses);

  capturedUserData = {
    name,
    email,
    primary: result.primary,
    secondary: result.secondary,
    scores: {}
  };
  result.allScores.forEach(s => { capturedUserData.scores[s.archetype] = s.score.toFixed(1); });

  // Build payload
  const payload = {
    name,
    email,
    primary: result.primary,
    secondary: result.secondary,
    isBalanced: result.isBalanced,
    isRenaissance: result.isRenaissance,
    growthMindset: result.modifiers.growthMindsetTier,
    scores: capturedUserData.scores,
    timestamp: new Date().toISOString()
  };

  // Save FULL result to localStorage
  localStorage.setItem('ly_result', JSON.stringify(result));

  // Store in localStorage as backup array
  try {
    const existing = JSON.parse(localStorage.getItem('ly_submissions') || '[]');
    existing.push(payload);
    localStorage.setItem('ly_submissions', JSON.stringify(existing));
  } catch(err) { /* silent */ }

  // Try webhook POST (non-blocking — redirect regardless)
  const WEBHOOK_URL = ''; // Riley: paste Zapier/Make/Netlify Function URL here
  if (WEBHOOK_URL) {
    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => { /* silent — localStorage backup exists */ });
  }

  // Redirect to reveal page
  window.location.href = 'reveal.html?type=' + result.primary;
}

// ===== Start Quiz =====

function startQuiz() {
  currentIndex = 0;
  Object.keys(responses).forEach(k => delete responses[k]);
  capturedUserData = null;

  // Show assessment, hide email capture
  document.getElementById('assessment').style.display = 'flex';
  document.getElementById('email-capture').style.display = 'none';

  // Reset email form if it exists
  const emailForm = document.getElementById('email-form');
  if (emailForm) {
    emailForm.reset();
    const captureBtn = document.getElementById('capture-submit');
    if (captureBtn) {
      captureBtn.disabled = false;
      captureBtn.textContent = 'See My Results';
    }
  }

  renderQuestion();
}

// ===== Keyboard Navigation =====

document.addEventListener('keydown', e => {
  const assessmentEl = document.getElementById('assessment');
  if (assessmentEl.style.display === 'none') return;

  const item = ITEMS[currentIndex];
  const scale = SCALES[item.scale];
  const num = parseInt(e.key);
  if (num >= 1 && num <= scale.options.length) {
    selectOption(item.id, num);
  }
  if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
    e.preventDefault();
    goBack();
  }
});

// ===== Wire Up Events on DOMContentLoaded =====

document.addEventListener('DOMContentLoaded', () => {
  // Wire back button
  const backBtn = document.getElementById('btn-back');
  if (backBtn) {
    backBtn.addEventListener('click', goBack);
  }

  // Wire email form
  const emailForm = document.getElementById('email-form');
  if (emailForm) {
    emailForm.addEventListener('submit', submitEmailCapture);
  }

  // Start the quiz
  startQuiz();
});
