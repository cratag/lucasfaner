(function () {
  var carousel = document.querySelector(".carousel");
  var track = document.querySelector(".carousel-track");
  if (!carousel || !track || !track.children.length) return;

  var HOVER_RESUME_MS = 0;
  var MOBILE_SPEED = 0.75;
  var DESKTOP_SPEED = 0.33;

  var offset = 0;
  var paused = false;
  var resumeTimer = null;
  var rafId = null;

  function applyTransform() {
    track.style.transform = "translateX(" + offset + "px)";
  }

  function cardStep() {
    var card = track.children[0];
    return card ? card.offsetWidth + gap() : 0;
  }

  function gap() {
    return parseFloat(getComputedStyle(track).gap) || 20;
  }

  function pause() {
    paused = true;
    clearTimeout(resumeTimer);
    resumeTimer = null;
  }

  function recycleFront() {
    var step = cardStep();
    if (!step) return;
    while (-offset >= step) {
      track.appendChild(track.children[0]);
      offset += step;
    }
  }

  function resume() {
    paused = false;
  }

  function scheduleResume(delay) {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(function () {
      if (carousel.matches(":hover")) return;
      resume();
    }, delay);
  }

  function speed() {
    return window.innerWidth < 600 ? MOBILE_SPEED : DESKTOP_SPEED;
  }

  function tick() {
    if (!paused) {
      offset -= speed();
      recycleFront();
      applyTransform();
    }
    rafId = requestAnimationFrame(tick);
  }

  carousel.addEventListener("mouseenter", pause);
  carousel.addEventListener("mouseleave", function () {
    scheduleResume(HOVER_RESUME_MS);
  });

  offset = 0;
  applyTransform();
  setTimeout(function () {
    rafId = requestAnimationFrame(tick);
  }, 1000);

  window.addEventListener("beforeunload", function () {
    cancelAnimationFrame(rafId);
  });
})();
