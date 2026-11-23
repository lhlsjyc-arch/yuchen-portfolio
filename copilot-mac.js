const readingProgress = document.querySelector("[data-reading-progress]");
const responsiveLab = document.querySelector("[data-responsive-lab]");
const widthLabel = document.querySelector("[data-width-label]");
const dimensionLabel = document.querySelector("[data-dimension-label]");
const caseMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const filmStaticViewport = window.matchMedia("(max-width: 560px)");
const scrollFilm = document.querySelector("[data-scroll-film]");
const scrollFilmSticky = scrollFilm?.querySelector(".copilot-film-sticky");
const scrollFilmCanvas = scrollFilm?.querySelector("[data-scroll-canvas]");
const heroProductImages = [...document.querySelectorAll(".copilot-film-product-stack img")];
const designSystemVideo = document.querySelector("[data-design-system-video]");
const nativeMaterialVideo = document.querySelector("[data-native-material-video]");
const imageLightbox = document.querySelector("[data-image-lightbox]");
const imageLightboxImage = imageLightbox?.querySelector("[data-image-lightbox-image]");
const imageLightboxClose = imageLightbox?.querySelector("[data-image-lightbox-close]");
const zoomableImages = [...document.querySelectorAll("main img:not([data-image-zoom-disabled])")];
const motionSections = document.querySelectorAll(
  ".feature-story, .workspace-system, .case-impact",
);

let lightboxSourceImage = null;
let lightboxCloseTimer = 0;

function revealCurrentHashTarget() {
  if (!window.location.hash) return;
  const target = document.querySelector(window.location.hash);
  target?.closest(".reveal")?.classList.add("is-visible");
}

revealCurrentHashTarget();
window.addEventListener("hashchange", revealCurrentHashTarget);

function closeImageLightbox() {
  if (!imageLightbox?.open) return;
  window.clearTimeout(lightboxCloseTimer);
  imageLightbox.classList.remove("is-open");
  document.body.classList.remove("image-lightbox-open");

  const finishClose = () => {
    imageLightbox.close();
    imageLightboxImage?.removeAttribute("src");
    lightboxSourceImage?.focus({ preventScroll: true });
    lightboxSourceImage = null;
  };

  if (caseMotionPreference.matches) {
    finishClose();
    return;
  }
  lightboxCloseTimer = window.setTimeout(finishClose, 220);
}

function openImageLightbox(image) {
  if (!imageLightbox || !imageLightboxImage) return;
  window.clearTimeout(lightboxCloseTimer);
  lightboxSourceImage = image;
  imageLightboxImage.src = image.currentSrc || image.src;
  imageLightboxImage.alt = image.alt || "放大图片";
  document.body.classList.add("image-lightbox-open");
  if (!imageLightbox.open) imageLightbox.showModal();
  requestAnimationFrame(() => imageLightbox.classList.add("is-open"));
}

zoomableImages.forEach((image) => {
  const description = image.alt || "案例图片";
  image.tabIndex = 0;
  image.setAttribute("role", "button");
  image.setAttribute("aria-haspopup", "dialog");
  image.setAttribute("aria-label", `放大查看：${description}`);
  image.addEventListener("click", () => openImageLightbox(image));
  image.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openImageLightbox(image);
  });
});

function setHeroProductInteractivity(isInteractive) {
  scrollFilm?.classList.toggle("is-product-interactive", isInteractive);
  heroProductImages.forEach((image) => {
    image.tabIndex = isInteractive ? 0 : -1;
    if (isInteractive) {
      image.removeAttribute("aria-hidden");
    } else {
      image.setAttribute("aria-hidden", "true");
    }
  });
}

imageLightboxClose?.addEventListener("click", closeImageLightbox);
imageLightbox?.addEventListener("click", (event) => {
  if (event.target === imageLightbox) closeImageLightbox();
});
imageLightbox?.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeImageLightbox();
});

const layoutMeta = {
  compact: { width: "834 px", dimension: "834 PX · COMPACT" },
  focused: { width: "1024 px", dimension: "1024 PX · FOCUSED" },
  expanded: { width: "1440 px", dimension: "1440 PX · EXPANDED" },
};

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function smoothstep(start, end, value) {
  const progress = clamp((value - start) / (end - start));
  return progress * progress * (3 - 2 * progress);
}

function initProductOverviewDome() {
  const root = document.querySelector("[data-product-dome]");
  const sticky = root?.querySelector("[data-product-dome-sticky]");
  const main = root?.querySelector("[data-product-dome-main]");
  const sphere = root?.querySelector("[data-product-dome-sphere]");
  if (!root || !sticky || !main || !sphere) return;

  const segments = 34;
  const fit = 1.8;
  const maxVerticalRotation = 3;
  const dragSensitivity = 20;
  const dragDamping = 2;
  const tileWidth = 2.9;
  const tileHeight = 2;
  const horizontalStep = 2.8;
  const verticalStep = 1.8;
  const columns = 10;
  const rows = 5;
  const imagePaths = Array.from({ length: 32 }, (_, index) => {
    const fileNumber = String(index + 1).padStart(2, "0");
    return `./assets/copilot-overview-gallery/copilot-mac-${fileNumber}.png`;
  });

  root.style.setProperty("--segments-x", segments);
  root.style.setProperty("--segments-y", segments);

  const coordinates = [];
  for (let column = 0; column < columns; column += 1) {
    const x = (column - (columns - 1) / 2) * horizontalStep;
    const rowCount = column % 2 === 0 ? rows : rows - 1;

    for (let row = 0; row < rowCount; row += 1) {
      const y = (row - (rowCount - 1) / 2) * verticalStep;
      coordinates.push({ x, y });
    }
  }

  const imageDecodePromises = [];
  let dragging = false;
  let moved = false;

  coordinates.forEach(({ x, y }, index) => {
    const imageIndex = index % imagePaths.length;
    const item = document.createElement("div");
    item.className = "product-overview-dome-item";
    item.style.setProperty("--offset-x", x);
    item.style.setProperty("--offset-y", y);
    item.style.setProperty("--item-size-x", tileWidth);
    item.style.setProperty("--item-size-y", tileHeight);

    const imageWrap = document.createElement("div");
    imageWrap.className = "product-overview-dome-image";

    const image = document.createElement("img");
    image.src = imagePaths[imageIndex];
    image.alt = `Copilot Mac 产品界面 ${String(imageIndex + 1).padStart(2, "0")}`;
    image.width = 1420;
    image.height = 1000;
    image.decoding = "async";
    image.loading = "eager";
    image.draggable = false;
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-haspopup", "dialog");
    image.setAttribute("aria-label", `放大查看：${image.alt}`);

    image.addEventListener("click", (event) => {
      if (event.detail > 0 && moved) return;
      event.stopPropagation();
      openImageLightbox(image);
    });
    image.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openImageLightbox(image);
    });

    imageWrap.appendChild(image);
    item.appendChild(imageWrap);
    sphere.appendChild(item);

    if (typeof image.decode === "function") {
      imageDecodePromises.push(image.decode().catch(() => undefined));
    } else {
      imageDecodePromises.push(new Promise((resolve) => {
        if (image.complete) {
          resolve();
          return;
        }
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      }));
    }
  });

  Promise.all(imageDecodePromises).then(() => root.classList.add("is-dome-ready"));

  function updateRadius() {
    const width = root.clientWidth;
    const height = root.clientHeight;
    const basis = width / height >= 1.3 ? width : Math.min(width, height);
    const minimumRadius = width < 600 ? 760 : 1800;
    const radius = Math.max(minimumRadius, Math.min(basis * fit, height * 1.35));
    root.style.setProperty("--radius", `${Math.round(radius)}px`);
  }

  updateRadius();
  const radiusObserver = new ResizeObserver(updateRadius);
  radiusObserver.observe(root);

  const degreesPerUnit = 180 / segments;
  const maxOffsetX = ((columns - 1) / 2) * horizontalStep + (tileWidth - 1) / 2;
  const maxHorizontalRotation = maxOffsetX * degreesPerUnit - 20;
  const rotation = { x: 0, y: 0 };
  let automaticDirection = -1;
  let startPosition = null;
  let startRotation = null;
  let lastMoveX = 0;
  let lastMoveTime = 0;
  let inertiaFrame = 0;
  let automaticFrame = 0;
  let storyMotionFrame = 0;
  let isInView = false;
  let lastAutomaticTime = 0;

  function updateStoryMotion() {
    storyMotionFrame = 0;

    if (caseMotionPreference.matches) {
      root.classList.add("is-overview-content-visible");
      root.style.setProperty("--overview-cue-opacity", "0");
      return;
    }

    const bounds = root.getBoundingClientRect();
    const travel = Math.max(1, root.offsetHeight - sticky.offsetHeight);
    const progress = clamp(-bounds.top / travel);
    const contentVisible = progress >= 0.5;
    const cueOut = smoothstep(0.04, 0.2, progress);

    root.dataset.storyProgress = progress.toFixed(3);
    root.classList.toggle("is-overview-content-visible", contentVisible);
    root.style.setProperty("--overview-cue-opacity", (1 - cueOut).toFixed(3));
  }

  function requestStoryMotion() {
    if (!storyMotionFrame) storyMotionFrame = requestAnimationFrame(updateStoryMotion);
  }

  function applyTransform() {
    rotation.y = clamp(rotation.y, -maxHorizontalRotation, maxHorizontalRotation);
    sphere.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;
  }

  function stopInertia() {
    if (!inertiaFrame) return;
    cancelAnimationFrame(inertiaFrame);
    inertiaFrame = 0;
  }

  function startAutomaticRotation() {
    if (automaticFrame || !isInView || caseMotionPreference.matches) return;
    lastAutomaticTime = performance.now();

    const tick = (time) => {
      if (!isInView || caseMotionPreference.matches) {
        automaticFrame = 0;
        return;
      }

      const elapsed = Math.min(32, Math.max(0, time - lastAutomaticTime));
      lastAutomaticTime = time;
      if (!dragging && !inertiaFrame) {
        rotation.y += automaticDirection * 0.005 * (elapsed / 16.67);
        if (rotation.y <= -maxHorizontalRotation) {
          rotation.y = -maxHorizontalRotation;
          automaticDirection = 1;
        } else if (rotation.y >= maxHorizontalRotation) {
          rotation.y = maxHorizontalRotation;
          automaticDirection = -1;
        }
        applyTransform();
      }
      automaticFrame = requestAnimationFrame(tick);
    };

    automaticFrame = requestAnimationFrame(tick);
  }

  function stopAutomaticRotation() {
    if (!automaticFrame) return;
    cancelAnimationFrame(automaticFrame);
    automaticFrame = 0;
  }

  main.addEventListener("pointerdown", (event) => {
    stopInertia();
    dragging = true;
    moved = false;
    startPosition = { x: event.clientX, y: event.clientY };
    startRotation = { x: rotation.x, y: rotation.y };
    lastMoveX = event.clientX;
    lastMoveTime = performance.now();
    main.classList.add("is-dragging");
  });

  main.addEventListener("pointermove", (event) => {
    if (!dragging || !startPosition || !startRotation) return;
    const deltaX = event.clientX - startPosition.x;
    const deltaY = event.clientY - startPosition.y;
    if (!moved && deltaX * deltaX + deltaY * deltaY > 16) moved = true;
    rotation.x = clamp(startRotation.x - deltaY / dragSensitivity, -maxVerticalRotation, maxVerticalRotation);
    rotation.y = clamp(startRotation.y + deltaX / dragSensitivity, -maxHorizontalRotation, maxHorizontalRotation);
    applyTransform();
    lastMoveX = event.clientX;
    lastMoveTime = performance.now();
  });

  function finishDrag(event) {
    if (!dragging) return;
    dragging = false;
    main.classList.remove("is-dragging");

    const elapsed = performance.now() - lastMoveTime;
    const velocityX = elapsed > 0 && elapsed < 100 ? (event.clientX - lastMoveX) / elapsed : 0;
    if (!caseMotionPreference.matches && Math.abs(velocityX) > 0.005) {
      const maximumVelocity = 1.4;
      let velocity = clamp(velocityX, -maximumVelocity, maximumVelocity) * 80;
      const damping = clamp(dragDamping, 0, 1);
      const friction = 0.94 + 0.055 * damping;
      const threshold = 0.015 - 0.01 * damping;
      const maximumFrames = Math.round(90 + 270 * damping);
      let frameCount = 0;

      const coast = () => {
        velocity *= friction;
        if (Math.abs(velocity) < threshold || ++frameCount > maximumFrames) {
          inertiaFrame = 0;
          return;
        }
        rotation.y += velocity / 200;
        if (rotation.y <= -maxHorizontalRotation || rotation.y >= maxHorizontalRotation) {
          rotation.y = clamp(rotation.y, -maxHorizontalRotation, maxHorizontalRotation);
          applyTransform();
          inertiaFrame = 0;
          return;
        }
        applyTransform();
        inertiaFrame = requestAnimationFrame(coast);
      };

      inertiaFrame = requestAnimationFrame(coast);
    }

    startPosition = null;
    startRotation = null;
  }

  window.addEventListener("pointerup", finishDrag);
  window.addEventListener("pointercancel", finishDrag);

  if ("IntersectionObserver" in window) {
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isInView = entry.isIntersecting;
      root.classList.toggle("is-dome-in-view", isInView);
      if (isInView) {
        startAutomaticRotation();
        requestStoryMotion();
      } else {
        stopAutomaticRotation();
      }
    }, { threshold: 0.05 });
    visibilityObserver.observe(root);
  } else {
    isInView = true;
    root.classList.add("is-dome-in-view");
    startAutomaticRotation();
  }

  caseMotionPreference.addEventListener("change", () => {
    if (caseMotionPreference.matches) stopAutomaticRotation();
    else startAutomaticRotation();
    requestStoryMotion();
  });

  window.addEventListener("scroll", requestStoryMotion, { passive: true });
  window.addEventListener("resize", requestStoryMotion, { passive: true });

  applyTransform();
  updateStoryMotion();
}

initProductOverviewDome();

function updateReadingProgress() {
  if (!readingProgress) return;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? Math.min(1, window.scrollY / maxScroll) : 0;
  readingProgress.style.transform = `scaleX(${progress})`;
}

function setLabLayout(layout) {
  if (!responsiveLab || !layoutMeta[layout]) return;
  responsiveLab.dataset.layout = layout;
  if (widthLabel) widthLabel.textContent = layoutMeta[layout].width;
  if (dimensionLabel) dimensionLabel.textContent = layoutMeta[layout].dimension;

  responsiveLab.querySelectorAll("[data-layout-button]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.layoutButton === layout));
  });
}

responsiveLab?.querySelectorAll("[data-layout-button]").forEach((button) => {
  button.addEventListener("click", () => setLabLayout(button.dataset.layoutButton));
});

function decodeHeroProducts() {
  return Promise.all(heroProductImages.map((image) => {
    if (typeof image.decode === "function") {
      return image.decode().catch(() => undefined);
    }
    if (image.complete) return Promise.resolve();
    return new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    });
  }));
}

const filmAtlasMetrics = {
  frameWidth: 1920,
  frameHeight: 1080,
  columns: 4,
  framesPerAtlas: 8,
  atlases: 8,
  frames: 64,
};
const filmInitialOffsetY = 90;
const filmAtlasCache = new Map();
const filmForegroundCanvas = document.createElement("canvas");
let filmAtlasReady = false;
let lastFilmFrame = -1;
let lastCanvasWidth = 0;
let lastCanvasHeight = 0;
let desiredFilmFrame = 0;
let desiredFilmOffsetY = filmInitialOffsetY;
let lastFilmOffsetY = Number.NaN;

function loadFilmAtlas(index) {
  if (index < 0 || index >= filmAtlasMetrics.atlases) return Promise.resolve(null);
  const cached = filmAtlasCache.get(index);
  if (cached) {
    cached.lastUsed = performance.now();
    return cached.promise;
  }

  const atlas = new Image();
  const record = { atlas, lastUsed: performance.now(), promise: null };
  record.promise = new Promise((resolve) => {
    atlas.addEventListener("load", () => resolve(atlas), { once: true });
    atlas.addEventListener("error", () => resolve(null), { once: true });
    atlas.src = `./assets/copilot-m365-retina-${index}.webp`;
  }).then(async (loadedAtlas) => {
    if (!loadedAtlas) return null;
    if (typeof loadedAtlas.decode === "function") {
      await loadedAtlas.decode().catch(() => undefined);
    }
    return loadedAtlas.naturalWidth ? loadedAtlas : null;
  });
  filmAtlasCache.set(index, record);
  return record.promise;
}

function trimFilmAtlasCache(activeIndex) {
  if (filmAtlasCache.size <= 3) return;
  const removable = [...filmAtlasCache.entries()]
    .filter(([index]) => Math.abs(index - activeIndex) > 1)
    .sort((a, b) => a[1].lastUsed - b[1].lastUsed);

  while (filmAtlasCache.size > 3 && removable.length) {
    const [index] = removable.shift();
    filmAtlasCache.delete(index);
  }
}

function preloadFilmAtlasNeighbors(activeIndex) {
  [activeIndex - 1, activeIndex + 1].forEach((index) => {
    loadFilmAtlas(index).then(() => {
      const currentAtlas = Math.floor(desiredFilmFrame / filmAtlasMetrics.framesPerAtlas);
      trimFilmAtlasCache(currentAtlas);
    });
  });
}

async function prepareFilmAtlas() {
  if (!scrollFilmCanvas) return;
  filmAtlasReady = Boolean(await loadFilmAtlas(0));
  if (filmAtlasReady) preloadFilmAtlasNeighbors(0);
}

async function preparePageMotion() {
  await Promise.all([
    document.fonts?.ready ?? Promise.resolve(),
    decodeHeroProducts(),
    prepareFilmAtlas(),
  ]);
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  updateFilmMotion();
  document.body.classList.add("is-case-ready");
}

if (!(caseMotionPreference.matches) && "IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-section-active");
        sectionObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -12%" },
  );

  motionSections.forEach((section) => sectionObserver.observe(section));
} else {
  motionSections.forEach((section) => section.classList.add("is-section-active"));
}

if (designSystemVideo) {
  let designSystemVideoFinished = false;

  if (!(caseMotionPreference.matches) && "IntersectionObserver" in window) {
    const designSystemVideoObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !designSystemVideoFinished) {
          designSystemVideo.play().catch(() => undefined);
        } else {
          designSystemVideo.pause();
        }
      },
      { threshold: 0.28, rootMargin: "8% 0px -8%" },
    );

    designSystemVideo.addEventListener(
      "ended",
      () => {
        designSystemVideoFinished = true;
        designSystemVideoObserver.unobserve(designSystemVideo);
      },
      { once: true },
    );

    designSystemVideoObserver.observe(designSystemVideo);
  } else {
    designSystemVideo.pause();
  }
}

if (nativeMaterialVideo) {
  let nativeMaterialVideoFinished = false;

  if (!caseMotionPreference.matches && "IntersectionObserver" in window) {
    const nativeMaterialVideoObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !nativeMaterialVideoFinished) {
          nativeMaterialVideo.play().catch(() => undefined);
        } else {
          nativeMaterialVideo.pause();
        }
      },
      { threshold: 0.42, rootMargin: "6% 0px -6%" },
    );

    nativeMaterialVideo.addEventListener(
      "ended",
      () => {
        nativeMaterialVideoFinished = true;
        nativeMaterialVideoObserver.unobserve(nativeMaterialVideo);
      },
      { once: true },
    );

    nativeMaterialVideoObserver.observe(nativeMaterialVideo);
  } else {
    nativeMaterialVideo.pause();
  }
}

let filmFrame = 0;

function drawFilmFrame(frameIndex, force = false, offsetY = desiredFilmOffsetY) {
  if (!scrollFilmCanvas || !filmAtlasReady) return;

  const safeFrame = Math.round(clamp(frameIndex, 0, filmAtlasMetrics.frames - 1));
  const atlasIndex = Math.floor(safeFrame / filmAtlasMetrics.framesPerAtlas);
  const cachedAtlas = filmAtlasCache.get(atlasIndex);
  const atlas = cachedAtlas?.atlas;
  desiredFilmFrame = safeFrame;
  desiredFilmOffsetY = offsetY;

  if (!atlas?.naturalWidth) {
    loadFilmAtlas(atlasIndex).then((loadedAtlas) => {
      if (!loadedAtlas) return;
      const desiredAtlas = Math.floor(desiredFilmFrame / filmAtlasMetrics.framesPerAtlas);
      if (desiredAtlas === atlasIndex) {
        drawFilmFrame(desiredFilmFrame, true, desiredFilmOffsetY);
      }
      preloadFilmAtlasNeighbors(desiredAtlas);
    });
    return;
  }
  cachedAtlas.lastUsed = performance.now();

  const bounds = scrollFilmCanvas.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const renderWidth = Math.round(bounds.width * dpr);
  const renderHeight = Math.round(bounds.height * dpr);
  const resized = renderWidth !== lastCanvasWidth || renderHeight !== lastCanvasHeight;

  if (resized) {
    scrollFilmCanvas.width = renderWidth;
    scrollFilmCanvas.height = renderHeight;
    filmForegroundCanvas.width = renderWidth;
    filmForegroundCanvas.height = renderHeight;
    lastCanvasWidth = renderWidth;
    lastCanvasHeight = renderHeight;
  }

  if (
    !force &&
    !resized &&
    safeFrame === lastFilmFrame &&
    Math.abs(offsetY - lastFilmOffsetY) < 0.1
  ) return;

  const context = scrollFilmCanvas.getContext("2d", { alpha: false });
  if (!context) return;

  const localFrame = safeFrame % filmAtlasMetrics.framesPerAtlas;
  const sourceX = (localFrame % filmAtlasMetrics.columns) * filmAtlasMetrics.frameWidth;
  const sourceY = Math.floor(localFrame / filmAtlasMetrics.columns) * filmAtlasMetrics.frameHeight;
  const scale = Math.min(
    bounds.width / filmAtlasMetrics.frameWidth,
    bounds.height / filmAtlasMetrics.frameHeight,
  );
  const drawWidth = filmAtlasMetrics.frameWidth * scale;
  const drawHeight = filmAtlasMetrics.frameHeight * scale;
  const drawX = (bounds.width - drawWidth) / 2;
  const drawY = (bounds.height - drawHeight) / 2 + offsetY;

  const ambientScale = Math.max(
    bounds.width / filmAtlasMetrics.frameWidth,
    bounds.height / filmAtlasMetrics.frameHeight,
  ) * 1.06;
  const ambientWidth = filmAtlasMetrics.frameWidth * ambientScale;
  const ambientHeight = filmAtlasMetrics.frameHeight * ambientScale;
  const ambientX = (bounds.width - ambientWidth) / 2;
  const ambientY = (bounds.height - ambientHeight) / 2;
  const ambientBlur = Math.round(clamp(Math.min(bounds.width, bounds.height) * 0.055, 34, 58));

  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.fillStyle = "#f5f8ef";
  context.fillRect(0, 0, bounds.width, bounds.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  // Extend the cropped source safely: a softened cover copy fills the stage,
  // while the untouched 16:9 frame stays sharp and fully visible above it.
  context.save();
  context.globalAlpha = 0.42;
  context.filter = `blur(${ambientBlur}px) saturate(0.88)`;
  context.drawImage(
    atlas,
    sourceX,
    sourceY,
    filmAtlasMetrics.frameWidth,
    filmAtlasMetrics.frameHeight,
    ambientX,
    ambientY,
    ambientWidth,
    ambientHeight,
  );
  context.restore();

  context.fillStyle = "rgba(245, 248, 239, 0.28)";
  context.fillRect(0, 0, bounds.width, bounds.height);

  const foregroundContext = filmForegroundCanvas.getContext("2d");
  if (!foregroundContext) return;
  foregroundContext.setTransform(1, 0, 0, 1, 0, 0);
  foregroundContext.clearRect(0, 0, renderWidth, renderHeight);
  foregroundContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  foregroundContext.imageSmoothingEnabled = true;
  foregroundContext.imageSmoothingQuality = "high";
  foregroundContext.drawImage(
    atlas,
    sourceX,
    sourceY,
    filmAtlasMetrics.frameWidth,
    filmAtlasMetrics.frameHeight,
    drawX,
    drawY,
    drawWidth,
    drawHeight,
  );

  if (drawY > 0.5) {
    const featherY = clamp(drawHeight * 0.07, 32, 56);
    const verticalMask = foregroundContext.createLinearGradient(
      0,
      drawY,
      0,
      drawY + drawHeight,
    );
    verticalMask.addColorStop(0, "rgba(0, 0, 0, 0)");
    verticalMask.addColorStop(featherY / drawHeight, "rgba(0, 0, 0, 1)");
    verticalMask.addColorStop(1 - featherY / drawHeight, "rgba(0, 0, 0, 1)");
    verticalMask.addColorStop(1, "rgba(0, 0, 0, 0)");
    foregroundContext.globalCompositeOperation = "destination-in";
    foregroundContext.fillStyle = verticalMask;
    foregroundContext.fillRect(drawX, drawY, drawWidth, drawHeight);
    foregroundContext.globalCompositeOperation = "source-over";
  }

  context.drawImage(
    filmForegroundCanvas,
    0,
    0,
    renderWidth,
    renderHeight,
    0,
    0,
    bounds.width,
    bounds.height,
  );

  lastFilmFrame = safeFrame;
  lastFilmOffsetY = offsetY;
  scrollFilm.dataset.filmFrame = String(safeFrame);
  scrollFilm.dataset.filmOffsetY = offsetY.toFixed(2);
  preloadFilmAtlasNeighbors(atlasIndex);
}

function updateFilmMotion() {
  filmFrame = 0;
  if (
    !scrollFilm ||
    !scrollFilmSticky ||
    caseMotionPreference.matches ||
    filmStaticViewport.matches
  ) {
    setHeroProductInteractivity(true);
    document.body.style.setProperty("--case-header-white-progress", "1");
    return;
  }

  const headerHeight = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
  ) || 0;
  const bounds = scrollFilm.getBoundingClientRect();
  const travel = Math.max(1, scrollFilm.offsetHeight - scrollFilmSticky.offsetHeight);
  const progress = clamp((headerHeight - bounds.top) / travel);
  const copyOut = smoothstep(0.05, 0.23, progress);
  const cueOut = smoothstep(0.01, 0.12, progress);
  const productIn = smoothstep(0.72, 0.94, progress);
  const videoOut = smoothstep(0.76, 0.93, progress);
  const videoProgress = smoothstep(0.015, 0.78, progress);
  const filmCentering = smoothstep(0, 0.23, progress);

  scrollFilm.style.setProperty("--film-copy-opacity", (1 - copyOut).toFixed(3));
  scrollFilm.style.setProperty("--film-copy-y", `${(-28 * copyOut).toFixed(2)}px`);
  scrollFilm.style.setProperty("--film-cue-opacity", (1 - cueOut).toFixed(3));
  scrollFilm.style.setProperty("--film-video-opacity", (1 - videoOut).toFixed(3));
  scrollFilm.style.setProperty("--film-white-opacity", videoOut.toFixed(3));
  scrollFilm.style.setProperty("--film-product-opacity", productIn.toFixed(3));
  scrollFilm.style.setProperty("--film-product-inset", `${(8 * (1 - productIn)).toFixed(2)}%`);
  setHeroProductInteractivity(productIn > 0.82);
  document.body.style.setProperty("--case-header-white-progress", videoOut.toFixed(3));

  const targetFrame = Math.round(videoProgress * (filmAtlasMetrics.frames - 1));
  const targetOffsetY = filmInitialOffsetY * (1 - filmCentering);
  drawFilmFrame(targetFrame, false, targetOffsetY);
}

function requestFilmMotion() {
  if (!filmFrame) filmFrame = requestAnimationFrame(updateFilmMotion);
}

preparePageMotion();
updateReadingProgress();
updateFilmMotion();
window.addEventListener("scroll", () => {
  updateReadingProgress();
  requestFilmMotion();
}, { passive: true });
window.addEventListener("resize", () => {
  lastFilmFrame = -1;
  lastFilmOffsetY = Number.NaN;
  requestFilmMotion();
}, { passive: true });
