/**
 * LeapYear Assessment — Reveal Animation Module
 * Self-initializing: reads type from URL params and auto-plays the roulette reveal.
 */

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function showLoadingReveal(primaryType) {
  var ring = document.getElementById('lrRing');
  var lrCards = ring.querySelectorAll('.ocard');
  var statusText = document.getElementById('lrStatusText');
  var finalResults = document.getElementById('lrFinal');
  var bgWash = document.getElementById('lrBgWash');
  var N = lrCards.length;
  var isMobile = window.innerWidth < 768;
  var radius = isMobile ? 140 : 280;

  // Reset state from any previous run
  ring.classList.remove('is-visible');
  ring.style.transition = 'none';
  ring.style.transform = 'rotate(0deg)';
  statusText.style.opacity = '1';
  statusText.style.transform = 'translate(-50%, -50%)';
  finalResults.classList.remove('is-visible');
  bgWash.style.opacity = '0';
  lrCards.forEach(function(card) {
    card.classList.remove('is-winner', 'is-loser');
    card.style.removeProperty('--win-x');
    card.style.removeProperty('--win-y');
    card.style.removeProperty('--counter-rot');
    card.style.removeProperty('--morph');
  });

  // Find the winning card by the ACTUAL scored primary type
  var winningIndex = 0;
  lrCards.forEach(function(card, i) {
    if (card.getAttribute('data-type') === primaryType) {
      winningIndex = i;
    }
  });

  // Position cards in initial circle
  lrCards.forEach(function(card, i) {
    var angle = (i / N) * Math.PI * 2 - Math.PI / 2;
    var tx = Math.cos(angle) * radius;
    var ty = Math.sin(angle) * radius;
    card.style.setProperty('--tx', tx + 'px');
    card.style.setProperty('--ty', ty + 'px');
  });

  // Show the ring after a frame so the browser registers the reset
  setTimeout(function() { ring.classList.add('is-visible'); }, 50);

  // Phase 1: Spin the roulette — land on the REAL type
  var anglePerCard = 360 / N;
  var offsetAngle = winningIndex * anglePerCard;
  var finalRotation = 1080 - offsetAngle; // 3 full spins then land on winner at top

  // Re-enable transition and spin after browser paints the initial state
  setTimeout(function() {
    ring.style.transition = 'transform 4.5s cubic-bezier(0.15, 0.95, 0.25, 1)';
    // Force reflow so the browser registers the starting position
    ring.offsetHeight;
    ring.style.transform = 'rotate(' + finalRotation + 'deg)';
  }, 300);

  // Phase 2: Stop & reveal the winner (after spin finishes at ~4.8s)
  setTimeout(function() {
    statusText.style.opacity = '0';
    statusText.style.transform = 'translate(-50%, -100%) scale(0.9)';

    lrCards.forEach(function(card, i) {
      if (i === winningIndex) {
        // Counter-rotate so the card faces upright
        var counterRot = -finalRotation;
        // Position the winner at center-top of viewport
        card.style.setProperty('--counter-rot', counterRot);
        card.classList.add('is-winner');
        // Also set --morph inline to ensure clip-path morphs to full card
        card.style.setProperty('--morph', '1');

        bgWash.style.backgroundColor = 'var(--' + primaryType + ')';
        bgWash.style.opacity = '0.35';
      } else {
        card.classList.add('is-loser');
      }
    });
  }, 5000);

  // Phase 3: Text reveal with correct name
  setTimeout(function() {
    var name = capitalize(primaryType);
    var vowels = ['A','E','I','O','U'];
    var prefix = vowels.indexOf(name.charAt(0)) >= 0 ? 'an' : 'a';
    document.getElementById('lrResultHeading').innerHTML = 'You are ' + prefix + ' <span class="si">' + name + '</span>.';
    finalResults.classList.add('is-visible');
  }, 6200);
}

// ===== Self-initialize on DOMContentLoaded =====

document.addEventListener('DOMContentLoaded', function() {
  var params = new URLSearchParams(window.location.search);
  var primaryType = params.get('type');
  var token = params.get('token');

  if (!primaryType) {
    window.location.href = 'quiz.html';
    return;
  }

  // Update "See Your Full Results" link with token
  var resultsLink = document.querySelector('a.btn-light[href="results.html"]');
  if (resultsLink && token) {
    resultsLink.href = '/results/' + token;
  }

  // Update Calendly link with token in utm_content
  var calendlyLink = document.querySelector('a.btn-light[href*="calendly.com"]');
  if (calendlyLink && token) {
    var href = calendlyLink.href;
    calendlyLink.href = href + (href.indexOf('?') >= 0 ? '&' : '?') + 'utm_content=' + token;
  }

  showLoadingReveal(primaryType);
});
