(function () {
  var carousel = document.querySelector(".carousel");
  var track = document.querySelector(".carousel-track");
  if (!carousel || !track || !track.children.length) return;

  var SPEED = 0.5;
  var HOVER_RESUME_MS = 500;
  var TOUCH_RESUME_MS = 2000;
  var ARROW_RESUME_MS = 2000;
  var JUMP_MS = 400;

  var offset = 0;
  var paused = false;
  var jumping = false;
  var resumeTimer = null;
  var rafId = null;

  function gap() {
    return parseFloat(getComputedStyle(track).gap) || 20;
  }

  function cardStep() {
    var card = track.children[0];
    return card ? card.offsetWidth + gap() : 0;
  }

  function applyTransform() {
    track.style.transform = "translateX(" + offset + "px)";
  }

  function recycleFront() {
    var step = cardStep();
    if (!step) return;
    while (-offset >= step) {
      track.appendChild(track.children[0]);
      offset += step;
    }
  }

  function tick() {
    if (!paused && !jumping) {
      offset -= SPEED;
      recycleFront();
      applyTransform();
    }
    rafId = requestAnimationFrame(tick);
  }

  function pause() {
    paused = true;
    clearTimeout(resumeTimer);
    resumeTimer = null;
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

  function setTransition(enabled) {
    track.style.transition = enabled
      ? "transform " + JUMP_MS + "ms ease"
      : "none";
  }

  function jump(dir) {
    if (jumping) return;
    pause();
    jumping = true;

    var step = cardStep();
    if (!step) {
      jumping = false;
      scheduleResume(ARROW_RESUME_MS);
      return;
    }

    if (dir > 0) {
      setTransition(true);
      offset -= step;
      applyTransform();

      var onEnd = function (e) {
        if (e.target !== track || e.propertyName !== "transform") return;
        track.removeEventListener("transitionend", onEnd);
        setTransition(false);
        track.appendChild(track.children[0]);
        offset += step;
        applyTransform();
        jumping = false;
        scheduleResume(ARROW_RESUME_MS);
      };
      track.addEventListener("transitionend", onEnd);
    } else {
      setTransition(false);
      track.insertBefore(
        track.children[track.children.length - 1],
        track.children[0],
      );
      offset -= step;
      applyTransform();

      // Force reflow so the transition applies from the new offset
      void track.offsetWidth;
      setTransition(true);
      offset += step;
      applyTransform();

      var onEndPrev = function (e) {
        if (e.target !== track || e.propertyName !== "transform") return;
        track.removeEventListener("transitionend", onEndPrev);
        setTransition(false);
        jumping = false;
        scheduleResume(ARROW_RESUME_MS);
      };
      track.addEventListener("transitionend", onEndPrev);
    }
  }

  document.querySelectorAll(".carousel-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      jump(Number(btn.getAttribute("data-dir")));
    });
  });

  carousel.addEventListener("mouseenter", pause);
  carousel.addEventListener("mouseleave", function () {
    scheduleResume(HOVER_RESUME_MS);
  });

  carousel.addEventListener("touchstart", pause, { passive: true });
  carousel.addEventListener(
    "touchend",
    function () {
      scheduleResume(TOUCH_RESUME_MS);
    },
    { passive: true },
  );

  applyTransform();
  rafId = requestAnimationFrame(tick);

  window.addEventListener("beforeunload", function () {
    cancelAnimationFrame(rafId);
  });
})();
