function initCaseMotion() {
  if (!window.gsap || !window.ScrollTrigger) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  const motion = gsap.matchMedia();

  motion.add(
    {
      reduceMotion: "(prefers-reduced-motion: reduce)",
      fullMotion: "(prefers-reduced-motion: no-preference)",
    },
    (context) => {
      const heroCopy = [
        document.querySelector(".yc-hero__fact"),
        document.querySelector(".yc-hero h1"),
        document.querySelector(".yc-hero__lede"),
        document.querySelector(".yc-hero__actions"),
      ].filter(Boolean);
      const heroVisual = document.querySelector("[data-hero-visual]");
      const workflow = document.querySelector("[data-system-track]");
      const workflowSteps = workflow ? gsap.utils.toArray(".system-steps li", workflow) : [];

      if (context.conditions.reduceMotion) {
        gsap.set([...heroCopy, heroVisual, ...workflowSteps].filter(Boolean), { clearProps: "all" });
        return;
      }

      const heroTimeline = gsap.timeline({
        defaults: { duration: 0.72, ease: "power3.out" },
      });

      heroTimeline
        .fromTo(
          heroCopy,
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, stagger: 0.07 },
          0.08,
        )
        .fromTo(
          heroVisual,
          { autoAlpha: 0, y: 34, scale: 0.985 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 1.05, ease: "expo.out" },
          0.28,
        );

      if (workflow && workflowSteps.length) {
        const workflowTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: workflow,
            start: "top 74%",
            end: "bottom 46%",
            scrub: 0.5,
          },
        });
        workflowTimeline.fromTo(
          workflowSteps,
          { y: 12 },
          { y: 0, duration: 0.72, ease: "power2.out" },
          0,
        );
      }
    },
  );

  if (document.readyState === "complete") ScrollTrigger.refresh();
  else window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });

  window.addEventListener("pagehide", () => motion.revert(), { once: true });
}

initCaseMotion();

function initVoiceInteraction() {
  if (!window.gsap) return;

  const { gsap } = window;
  const trigger = document.querySelector("[data-voice-trigger]");
  const stage = trigger?.closest(".voice-stage");
  const wave = stage?.querySelector(".voice-wave");
  const dots = wave ? gsap.utils.toArray("i", wave) : [];
  const status = stage?.querySelector("[data-voice-status]");

  if (!trigger || !stage || !wave || !dots.length || !status) return;

  const motion = gsap.matchMedia();
  let isHolding = false;
  let isRecording = false;
  let reduceMotion = false;
  let waveLoop = null;
  let holdTimer = 0;

  const setButtonRestingPosition = () => {
    gsap.to(trigger, {
      y: isHolding ? 5 : 0,
      scale: isHolding ? 0.975 : 1,
      duration: reduceMotion ? 0 : 0.18,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const beginRecording = () => {
    if (!isHolding || isRecording) return;
    isRecording = true;
    stage.classList.add("is-recording");
    status.textContent = "正在录音 · 松开停止";
    waveLoop?.kill();

    if (reduceMotion) {
      gsap.set(dots, { height: (index) => [16, 32, 48, 22, 40, 28, 18][index] });
      return;
    }

    gsap.set(dots, { height: 7 });
    waveLoop = gsap.to(dots, {
      height: (index) => [16, 32, 48, 22, 40, 28, 18][index],
      duration: 0.16,
      ease: "power1.inOut",
      stagger: { each: 0.028, from: "center" },
      repeat: -1,
      yoyo: true,
    });
  };

  const startHolding = () => {
    if (isHolding) return;
    isHolding = true;
    trigger.setAttribute("aria-pressed", "true");
    setButtonRestingPosition();
    window.clearTimeout(holdTimer);
    holdTimer = window.setTimeout(beginRecording, 400);
  };

  const stopHolding = () => {
    if (!isHolding && !isRecording) return;
    window.clearTimeout(holdTimer);
    holdTimer = 0;
    isHolding = false;
    isRecording = false;
    stage.classList.remove("is-recording");
    trigger.setAttribute("aria-pressed", "false");
    status.textContent = "0.4 秒后录音";
    waveLoop?.kill();
    waveLoop = null;

    gsap.to(dots, { height: 7, duration: reduceMotion ? 0 : 0.12, overwrite: "auto" });
    setButtonRestingPosition();
  };

  trigger.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    trigger.setPointerCapture?.(event.pointerId);
    startHolding();
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((eventName) => {
    trigger.addEventListener(eventName, stopHolding);
  });
  trigger.addEventListener("keydown", (event) => {
    if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    startHolding();
  });
  trigger.addEventListener("keyup", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    stopHolding();
  });
  trigger.addEventListener("blur", stopHolding);

  motion.add("(prefers-reduced-motion: reduce)", () => {
    reduceMotion = true;
    if (isRecording) {
      gsap.set(wave, { autoAlpha: 1, scale: 1 });
      gsap.set(dots, { scaleY: (index) => [1.7, 1.55, 1.35, 1.25, 1.45, 1.6, 1.8][index] });
    }
    return () => {
      reduceMotion = false;
    };
  });

  window.addEventListener(
    "pagehide",
    () => {
      waveLoop?.kill();
      window.clearTimeout(holdTimer);
      motion.revert();
    },
    { once: true },
  );
}

initVoiceInteraction();

function initSystemCarousel() {
  const carousel = document.querySelector("[data-system-carousel]");
  const slides = carousel ? [...carousel.querySelectorAll(".system-gallery figure")] : [];
  const dots = carousel ? [...carousel.querySelectorAll("[data-carousel-dot]")] : [];
  const previousButton = carousel?.querySelector("[data-carousel-prev]");
  const nextButton = carousel?.querySelector("[data-carousel-next]");
  const count = carousel?.querySelector("[data-carousel-count]");

  if (!carousel || !slides.length || !previousButton || !nextButton || !count) return;

  let activeIndex = 0;

  const showSlide = (nextIndex) => {
    activeIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.toggleAttribute("inert", !isActive);
      const image = slide.querySelector("img");
      if (image) image.tabIndex = isActive ? 0 : -1;
    });

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle("is-active", isActive);
      if (isActive) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });

    count.textContent = `${activeIndex + 1} / ${slides.length}`;
  };

  previousButton.addEventListener("click", () => showSlide(activeIndex - 1));
  nextButton.addEventListener("click", () => showSlide(activeIndex + 1));
  dots.forEach((dot, index) => dot.addEventListener("click", () => showSlide(index)));
  carousel.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    showSlide(activeIndex + (event.key === "ArrowLeft" ? -1 : 1));
  });

  showSlide(0);
}

initSystemCarousel();

const imageLightbox = document.querySelector("[data-image-lightbox]");
const imageLightboxImage = imageLightbox?.querySelector("[data-image-lightbox-image]");
const imageLightboxClose = imageLightbox?.querySelector("[data-image-lightbox-close]");
const zoomableImages = [...document.querySelectorAll(".yc-page main img:not([data-image-zoom-disabled])")];
const lightboxMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

let lightboxSourceImage = null;
let lightboxCloseTimer = 0;

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

  if (lightboxMotionPreference.matches) finishClose();
  else lightboxCloseTimer = window.setTimeout(finishClose, 220);
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
  image.tabIndex = image.closest("[aria-hidden='true'][inert]") ? -1 : 0;
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

imageLightboxClose?.addEventListener("click", closeImageLightbox);
imageLightbox?.addEventListener("click", (event) => {
  if (event.target === imageLightbox) closeImageLightbox();
});
imageLightbox?.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeImageLightbox();
});
