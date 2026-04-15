/**
 * LeapYear Assessment — Quiz Logic Module
 * Manages quiz state, question rendering, scale transitions, and email capture flow.
 */

import { ITEMS, SCALES, SCALE_GROUPS } from './items.js';
import { scoreAssessment } from './scoring.js';

// ===== Module State =====
let currentIndex = 0;
const responses = {};
let capturedUserData = null;
let showingTransition = false;

// ===== Progress Persistence =====
const STORAGE_KEY = 'ly_quiz_progress';

function saveProgress() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentIndex,
      responses,
      shownTransitions: [...shownTransitions],
      timestamp: Date.now(),
    }));
  } catch (e) { /* silent */ }
}

function loadProgress() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    // Expire after 2 hours
    if (Date.now() - saved.timestamp > 2 * 60 * 60 * 1000) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return saved;
  } catch (e) { return null; }
}

function clearProgress() {
  sessionStorage.removeItem(STORAGE_KEY);
}

// ===== Scale Group Helpers =====

function getGroupForIndex(index) {
  for (let i = SCALE_GROUPS.length - 1; i >= 0; i--) {
    if (index >= SCALE_GROUPS[i].startIndex) return i;
  }
  return 0;
}

function isGroupBoundary(index) {
  return SCALE_GROUPS.some(g => g.startIndex === index);
}

// Track which group transitions have been shown
const shownTransitions = new Set();

// ===== Transition Screen =====

function showTransitionScreen(groupIndex, onContinue) {
  showingTransition = true;
  const group = SCALE_GROUPS[groupIndex];

  const assessment = document.getElementById('assessment');
  const progressContainer = assessment.querySelector('.progress-bar-container');
  const questionArea = document.getElementById('question-area');

  // Update progress bar through transition
  const pct = Math.round((group.startIndex / ITEMS.length) * 100);
  document.getElementById('progress-text').textContent = `Question ${group.startIndex + 1} of ${ITEMS.length}`;
  document.getElementById('progress-pct').textContent = `${pct}%`;
  document.getElementById('progress-fill').style.width = `${pct}%`;

  // Hide question area, show transition
  questionArea.style.display = 'none';

  let transitionEl = document.getElementById('scale-transition');
  if (!transitionEl) {
    transitionEl = document.createElement('div');
    transitionEl.id = 'scale-transition';
    transitionEl.className = 'scale-transition';
    progressContainer.after(transitionEl);
  }

  const contextHTML = group.contextNote
    ? `<p class="transition-context">${group.contextNote}</p>`
    : '';

  transitionEl.innerHTML = `
    <div class="transition-inner">
      <span class="transition-label">Next: ${group.count} questions</span>
      <h2 class="transition-stem">${group.stem}</h2>
      ${contextHTML}
      <button class="transition-btn" id="transition-continue">Continue</button>
    </div>
  `;
  transitionEl.style.display = 'flex';

  // Animate in
  requestAnimationFrame(() => {
    transitionEl.classList.add('visible');
  });

  document.getElementById('transition-continue').addEventListener('click', () => {
    transitionEl.classList.remove('visible');
    setTimeout(() => {
      transitionEl.style.display = 'none';
      questionArea.style.display = '';
      showingTransition = false;
      onContinue();
    }, 300);
  });
}

// ===== Quiz Rendering =====

function renderQuestion() {
  // Check if we need a transition screen
  const groupIndex = getGroupForIndex(currentIndex);
  if (isGroupBoundary(currentIndex) && !shownTransitions.has(groupIndex)) {
    shownTransitions.add(groupIndex);
    showTransitionScreen(groupIndex, () => renderQuestion());
    return;
  }

  const item = ITEMS[currentIndex];
  const scale = SCALES[item.scale];
  const pct = Math.round((currentIndex / ITEMS.length) * 100);

  document.getElementById('progress-text').textContent = `Question ${currentIndex + 1} of ${ITEMS.length}`;
  document.getElementById('progress-pct').textContent = `${pct}%`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
  document.getElementById('question-stem').textContent = scale.stem;

  // Render item text — use innerHTML for items with bold emphasis
  const questionTextEl = document.getElementById('question-text');
  if (item.boldWords) {
    questionTextEl.innerHTML = item.text;
  } else {
    questionTextEl.textContent = item.text;
  }

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

  // Blur active element to prevent mobile hover persistence
  document.activeElement.blur();

  setTimeout(() => {
    if (currentIndex < ITEMS.length - 1) {
      currentIndex++;
      saveProgress();
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
  if (showingTransition) return;
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
}

// ===== Role Toggle =====

function initRoleToggle() {
  const toggle = document.getElementById('role-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', (e) => {
    const btn = e.target.closest('.role-btn');
    if (!btn) return;
    toggle.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateGradYearVisibility(btn.dataset.role);
  });
  // Show grad year by default since Student is pre-selected
  updateGradYearVisibility('student');
}

function updateGradYearVisibility(role) {
  const field = document.getElementById('grad-year-field');
  if (!field) return;
  if (role === 'student') {
    field.classList.add('visible');
  } else {
    field.classList.remove('visible');
  }
}

function getSelectedRole() {
  const active = document.querySelector('#role-toggle .role-btn.active');
  return active ? active.dataset.role : 'student';
}

// ===== Email Capture =====

async function submitEmailCapture(e) {
  e.preventDefault();
  const name = document.getElementById('capture-name').value.trim();
  const email = document.getElementById('capture-email').value.trim();
  if (!name || !email) return;

  const role = getSelectedRole();
  const gradYear = role === 'student'
    ? (document.getElementById('capture-grad-year')?.value || '')
    : '';
  const btn = document.getElementById('capture-submit');
  btn.disabled = true;
  btn.textContent = 'Loading...';

  // Score the assessment
  const result = scoreAssessment(responses);

  // Save FULL result to localStorage (backup — works even if API fails)
  localStorage.setItem('ly_result', JSON.stringify(result));

  // Build scores object { philosopher: 78.3, analyst: 65.2, ... }
  const allScores = {};
  result.allScores.forEach(s => { allScores[s.archetype] = parseFloat(s.score.toFixed(1)); });

  // Build API payload
  const payload = {
    name,
    email,
    role,
    gradYear,
    primary: result.primary,
    secondary: result.secondary,
    primaryScore: result.primaryScore,
    secondaryScore: result.secondaryScore,
    isBalanced: result.isBalanced,
    isRenaissance: result.isRenaissance,
    allScores,
    growthMindsetTier: result.modifiers.growthMindsetTier,
    tensionTemplate: result.modifiers.tensionTemplate,
    socialFlavor: result.modifiers.socialFlavor,
    shadows: result.modifiers.shadows,
  };

  // POST to API — get token back
  let token = null;
  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      token = data.token;
    }
  } catch (err) {
    // Silent — localStorage backup exists
    console.warn('API submit failed, using localStorage fallback:', err.message);
  }

  // Clear saved progress — quiz is complete
  clearProgress();

  // Redirect to reveal page (with token if available)
  const params = new URLSearchParams({ type: result.primary });
  if (token) params.set('token', token);
  window.location.href = 'reveal.html?' + params.toString();
}

// ===== Start Quiz =====

function startQuiz(fresh = false) {
  // Try to restore saved progress (unless explicitly starting fresh)
  const saved = fresh ? null : loadProgress();

  if (saved && saved.currentIndex > 0) {
    currentIndex = saved.currentIndex;
    Object.keys(responses).forEach(k => delete responses[k]);
    Object.assign(responses, saved.responses);
    shownTransitions.clear();
    (saved.shownTransitions || []).forEach(i => shownTransitions.add(i));
  } else {
    currentIndex = 0;
    Object.keys(responses).forEach(k => delete responses[k]);
    shownTransitions.clear();
  }

  capturedUserData = null;
  showingTransition = false;

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
  if (showingTransition) {
    if (e.key === 'Enter' || e.key === ' ') {
      const continueBtn = document.getElementById('transition-continue');
      if (continueBtn) { e.preventDefault(); continueBtn.click(); }
    }
    return;
  }

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

  // Wire email form + role toggle
  const emailForm = document.getElementById('email-form');
  if (emailForm) {
    emailForm.addEventListener('submit', submitEmailCapture);
  }
  initRoleToggle();

  // Wire cover screen Begin button
  const coverBegin = document.getElementById('cover-begin');
  const cover = document.getElementById('quiz-cover');

  // If saved progress exists, skip cover and resume
  const savedProgress = loadProgress();
  if (savedProgress && savedProgress.currentIndex > 0 && cover) {
    cover.style.display = 'none';
    startQuiz();  // Will auto-restore from sessionStorage
  } else if (coverBegin) {
    coverBegin.addEventListener('click', () => {
      if (cover) {
        cover.classList.add('fade-out');
        setTimeout(() => {
          cover.style.display = 'none';
          startQuiz();
        }, 500);
      }
    });
  }
});
