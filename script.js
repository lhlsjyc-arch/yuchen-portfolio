const header = document.querySelector(".site-header");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("#mobile-menu");
const currentProject = document.querySelector("[data-project-current]");
const projectSlides = document.querySelectorAll("[data-project-slide]");
const projectProgress = document.querySelector(".project-progress");
const projectWork = document.querySelector(".work");
const scrollScreens = [...document.querySelectorAll("[data-scroll-screen]")];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const portraitHero = document.querySelector("[data-portrait-hero]");
const portraitStage = document.querySelector("[data-portrait-stage]");
const portraitVideo = document.querySelector("[data-portrait-video]");
const projectVideo = document.querySelector("[data-project-video]");
const hasFinePointer = window.matchMedia("(pointer: fine)");
const portraitMotionEnabled = hasFinePointer.matches && !prefersReducedMotion.matches;

function closeMenu() {
  if (!mobileMenu || !menuToggle) return;
  mobileMenu.hidden = true;
  menuToggle.setAttribute("aria-expanded", "false");
}

menuToggle?.addEventListener("click", () => {
  const opening = mobileMenu?.hidden ?? false;
  if (!mobileMenu) return;
  mobileMenu.hidden = !opening;
  menuToggle.setAttribute("aria-expanded", String(opening));
});

mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

document.addEventListener("click", (event) => {
  if (!mobileMenu || mobileMenu.hidden) return;
  if (!header?.contains(event.target)) closeMenu();
});

const revealItems = document.querySelectorAll(".reveal");

if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8%" },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

if (projectVideo) {
  let projectVideoFinished = false;
  let projectVideoInView = false;

  const syncProjectVideoPlayback = () => {
    if (!projectVideoInView || projectVideoFinished) {
      projectVideo.pause();
      return;
    }

    projectVideo.play().catch(() => undefined);
  };

  if (!prefersReducedMotion.matches && "IntersectionObserver" in window) {
    const projectVideoObserver = new IntersectionObserver(
      ([entry]) => {
        projectVideoInView = entry.isIntersecting;
        syncProjectVideoPlayback();
      },
      { threshold: 0.3, rootMargin: "6% 0px -6%" },
    );

    projectVideo.addEventListener("canplay", syncProjectVideoPlayback);

    projectVideo.addEventListener(
      "ended",
      () => {
        projectVideoFinished = true;
        projectVideo.removeEventListener("canplay", syncProjectVideoPlayback);
        projectVideoObserver.unobserve(projectVideo);
      },
      { once: true },
    );

    projectVideoObserver.observe(projectVideo);
  } else {
    projectVideo.pause();
  }
}

if (currentProject && projectSlides.length && "IntersectionObserver" in window) {
  const projectObserver = new IntersectionObserver(
    (entries) => {
      const activeSlide = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (activeSlide) currentProject.textContent = activeSlide.target.dataset.projectSlide;
    },
    { threshold: [0.2, 0.45, 0.7], rootMargin: "-28% 0px -28%" },
  );

  projectSlides.forEach((slide) => projectObserver.observe(slide));
}

if (projectProgress && projectWork && "IntersectionObserver" in window) {
  const projectProgressObserver = new IntersectionObserver(
    ([entry]) => {
      projectProgress.classList.toggle("is-active", entry.isIntersecting);
    },
    { threshold: 0, rootMargin: "-1px 0px -1px" },
  );

  projectProgressObserver.observe(projectWork);
}

const screenSnapQuery = window.matchMedia("(min-width: 821px) and (pointer: fine)");
let screenScrollLocked = false;
let screenCanAdvance = true;
let wheelReleaseTimer = 0;

function getActiveScreenIndex() {
  const viewportCenter = window.innerHeight / 2;
  let activeIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  scrollScreens.forEach((screen, index) => {
    const bounds = screen.getBoundingClientRect();
    const screenCenter = bounds.top + bounds.height / 2;
    const distance = Math.abs(screenCenter - viewportCenter);
    if (distance < closestDistance) {
      closestDistance = distance;
      activeIndex = index;
    }
  });

  return activeIndex;
}

window.addEventListener(
  "wheel",
  (event) => {
    if (!scrollScreens.length || !screenSnapQuery.matches) return;
    if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX) || Math.abs(event.deltaY) < 8) return;

    const direction = Math.sign(event.deltaY);
    const activeIndex = getActiveScreenIndex();
    const targetIndex = activeIndex + direction;

    window.clearTimeout(wheelReleaseTimer);
    wheelReleaseTimer = window.setTimeout(() => {
      screenCanAdvance = true;
    }, 180);

    if (targetIndex < 0 || targetIndex >= scrollScreens.length) return;

    event.preventDefault();
    if (screenScrollLocked || !screenCanAdvance) return;

    screenScrollLocked = true;
    screenCanAdvance = false;
    scrollScreens[targetIndex].scrollIntoView({
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      block: "start",
    });
    window.setTimeout(() => {
      screenScrollLocked = false;
    }, prefersReducedMotion.matches ? 100 : 850);
  },
  { passive: false },
);

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 16);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

// The VP9 clip is a 12-second circular turn. These frame-accurate anchors were
// checked at 24 fps; interpolation between them maps the pointer angle to time.
if (portraitHero && portraitStage && portraitVideo && portraitMotionEnabled) {
  const userAgent = navigator.userAgent;
  const isSafari = /Safari/i.test(userAgent) && !/Chrome|Chromium|CriOS|Edg|OPR|Android/i.test(userAgent);
  const supportsVp9WebM = portraitVideo.canPlayType('video/webm; codecs="vp9"') !== "";

  if (!isSafari && supportsVp9WebM) {
    const cycleDuration = 12;
    const fullTurn = Math.PI * 2;
    const sectorAngle = fullTurn / 8;
    const deadZoneRadius = 80;
    const idleDelay = 1800;
    const directionFrames = [
      { direction: "front", time: 0.0, frame: 0 },
      { direction: "left", time: 2.0, frame: 48 },
      { direction: "left-up", time: 3.208, frame: 77 },
      { direction: "up", time: 4.5, frame: 108 },
      { direction: "right-up", time: 5.792, frame: 139 },
      { direction: "right", time: 7.0, frame: 168 },
      { direction: "right-down", time: 8.208, frame: 197 },
      { direction: "down", time: 9.5, frame: 228 },
      { direction: "left-down", time: 10.708, frame: 257 },
      { direction: "front", time: 12.0, frame: 288 },
    ];
    const angleFrames = directionFrames.slice(1, -1);
    let currentTime = 0;
    let targetTime = 0;
    let animationFrame = 0;
    let previousTimestamp = 0;
    let idleTimer = 0;
    let videoReady = false;

    const wrapTime = (time) => ((time % cycleDuration) + cycleDuration) % cycleDuration;

    function shortestTimeDelta(from, to) {
      let delta = wrapTime(to) - wrapTime(from);
      if (delta > cycleDuration / 2) delta -= cycleDuration;
      if (delta < -cycleDuration / 2) delta += cycleDuration;
      return delta;
    }

    function interpolateCircularTime(from, to, progress) {
      return wrapTime(from + shortestTimeDelta(from, to) * progress);
    }

    function timeForPointer(deltaX, deltaY) {
      if (Math.hypot(deltaX, deltaY) <= deadZoneRadius) return directionFrames[0].time;

      const pointerAngle = Math.atan2(deltaY, deltaX);
      const clockwiseFromLeft = (pointerAngle - Math.PI + fullTurn) % fullTurn;
      const position = clockwiseFromLeft / sectorAngle;
      const currentIndex = Math.floor(position) % angleFrames.length;
      const nextIndex = (currentIndex + 1) % angleFrames.length;
      const progress = position - Math.floor(position);

      return interpolateCircularTime(
        angleFrames[currentIndex].time,
        angleFrames[nextIndex].time,
        progress,
      );
    }

    function renderPortrait(timestamp) {
      const elapsed = previousTimestamp ? Math.min(50, timestamp - previousTimestamp) : 1000 / 60;
      const smoothing = 1 - Math.pow(0.85, elapsed / (1000 / 60));
      const delta = shortestTimeDelta(currentTime, targetTime);
      previousTimestamp = timestamp;

      if (Math.abs(delta) < 1 / 240) {
        currentTime = wrapTime(targetTime);
      } else {
        currentTime = wrapTime(currentTime + delta * smoothing);
      }

      if (videoReady) portraitVideo.currentTime = currentTime;

      if (Math.abs(shortestTimeDelta(currentTime, targetTime)) >= 1 / 240) {
        animationFrame = requestAnimationFrame(renderPortrait);
      } else {
        animationFrame = 0;
        previousTimestamp = 0;
      }
    }

    function startMotion() {
      if (!animationFrame) animationFrame = requestAnimationFrame(renderPortrait);
    }

    function returnToFront() {
      targetTime = 0;
      startMotion();
    }

    function scheduleReturnToFront() {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(returnToFront, idleDelay);
    }

    function updatePortraitFromPointer(event) {
      const bounds = portraitStage.getBoundingClientRect();
      const headCenterX = bounds.left + bounds.width * 0.5;
      const headCenterY = bounds.top + bounds.height * 0.38;
      targetTime = timeForPointer(event.clientX - headCenterX, event.clientY - headCenterY);
      startMotion();
      scheduleReturnToFront();
    }

    // Listen in the capture phase at document level. Embedded previews can place
    // overlays above the hero, so a section-level mousemove listener may never
    // receive the pointer even though the user is moving it over the page.
    const pointerMoveEvent = "PointerEvent" in window ? "pointermove" : "mousemove";
    document.addEventListener(pointerMoveEvent, updatePortraitFromPointer, {
      capture: true,
      passive: true,
    });
    document.addEventListener("pointerdown", updatePortraitFromPointer, {
      capture: true,
      passive: true,
    });

    document.documentElement.addEventListener("mouseleave", returnToFront);
    window.addEventListener("blur", returnToFront);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) returnToFront();
    });

    portraitVideo.addEventListener(
      "loadeddata",
      () => {
        portraitVideo.pause();
        portraitVideo.currentTime = 0;
        currentTime = 0;
        targetTime = 0;
        videoReady = true;
        portraitStage.classList.add("is-ready");
      },
      { once: true },
    );

    portraitVideo.addEventListener("error", () => {
      videoReady = false;
      portraitStage.classList.remove("is-ready");
    });

    portraitVideo.src = portraitVideo.dataset.src;
    portraitVideo.load();
  }
}
