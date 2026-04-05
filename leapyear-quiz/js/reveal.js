/**
 * LeapYear Assessment — Reveal Animation Module
 * Roulette spin → fade ring → scale in standalone winner card → text reveal.
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

  // Reset state
  ring.classList.remove('is-visible');
  ring.style.transition = 'none';
  ring.style.transform = 'rotate(0deg)';
  statusText.style.opacity = '1';
  statusText.style.transform = 'translate(-50%, -50%)';
  finalResults.style.opacity = '0';
  finalResults.style.pointerEvents = 'none';
  bgWash.style.opacity = '0';
  lrCards.forEach(function(card) {
    card.classList.remove('is-loser');
  });

  // Remove any previous standalone winner card
  var oldWinner = document.querySelector('.lr-winner');
  if (oldWinner) oldWinner.remove();

  // Find the winning card index
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

  // Show ring
  setTimeout(function() { ring.classList.add('is-visible'); }, 50);

  // Phase 1: Spin
  var anglePerCard = 360 / N;
  var offsetAngle = winningIndex * anglePerCard;
  var finalRotation = 1080 - offsetAngle;

  setTimeout(function() {
    ring.style.transition = 'transform 4.5s cubic-bezier(0.15, 0.95, 0.25, 1)';
    ring.offsetHeight;
    ring.style.transform = 'rotate(' + finalRotation + 'deg)';
  }, 300);

  // Phase 2: Fade out ring, show standalone winner card
  setTimeout(function() {
    // Fade status text
    statusText.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    statusText.style.opacity = '0';
    statusText.style.transform = 'translate(-50%, -100%) scale(0.9)';

    // Fade out ALL ring cards (including the winner inside the ring)
    lrCards.forEach(function(card) {
      card.style.transition = 'opacity 0.6s ease';
      card.style.opacity = '0';
    });

    // Fade out ring
    ring.style.transition = 'opacity 0.6s ease';
    ring.style.opacity = '0';

    // Create standalone winner card (clone from the ring card)
    var winSource = lrCards[winningIndex];
    var winCard = winSource.cloneNode(true);
    winCard.classList.add('lr-winner');
    winCard.classList.remove('is-loser');
    winCard.style.cssText = ''; // Clear all inline styles from ring positioning
    document.body.appendChild(winCard);

    // Animate in: scale from 0 → 1 with spring easing (via JS inline styles)
    var winScale = isMobile ? 0.82 : 1;
    // Start state
    winCard.style.opacity = '0';
    winCard.style.transform = 'translateX(-50%) scale(0.3)';

    // Trigger entrance after a beat (let ring fade start)
    setTimeout(function() {
      winCard.style.transition = 'transform 1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease';
      winCard.style.opacity = '1';
      winCard.style.transform = 'translateX(-50%) scale(' + winScale + ')';
    }, 400);

    // Background wash
    bgWash.style.backgroundColor = 'var(--' + primaryType + ')';
    bgWash.style.opacity = '0.35';
  }, 5000);

  // Phase 3: Text reveal
  setTimeout(function() {
    var name = capitalize(primaryType);
    var vowels = ['A','E','I','O','U'];
    var prefix = vowels.indexOf(name.charAt(0)) >= 0 ? 'an' : 'a';
    document.getElementById('lrResultHeading').innerHTML = 'You are ' + prefix + ' <span class="si">' + name + '</span>.';
    finalResults.style.transition = 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1)';
    finalResults.style.opacity = '1';
    finalResults.style.pointerEvents = 'auto';
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
