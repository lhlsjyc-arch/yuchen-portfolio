const header = document.querySelector(".site-header");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("#mobile-menu");
const currentProject = document.querySelector("[data-project-current]");
const projectSlides = document.querySelectorAll("[data-project-slide]");
const projectProgress = document.querySelector(".project-progress");
const projectWork = document.querySelector(".work");
const moreWorkSection = document.querySelector("#more-work");
const scrollScreens = [...document.querySelectorAll("[data-scroll-screen]")];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const portraitHero = document.querySelector("[data-portrait-hero]");
const portraitStage = document.querySelector("[data-portrait-stage]");
const portraitVideo = document.querySelector("[data-portrait-video]");
const projectVideo = document.querySelector("[data-project-video]");
const experienceToggles = document.querySelectorAll(".experience-toggle");
const contactSection = document.querySelector("#contact");
const contactToggle = document.querySelector("[data-contact-toggle]");
const contactDetails = document.querySelector("[data-contact-details]");
const contactCopyButtons = document.querySelectorAll("[data-copy-button]");
const contactCopyStatus = document.querySelector("[data-copy-status]");
const contactQrCards = document.querySelectorAll("[data-contact-qr-card]");
const hasFinePointer = window.matchMedia("(pointer: fine)");
const portraitMotionEnabled = hasFinePointer.matches && !prefersReducedMotion.matches;
const highlightCursor = document.querySelector("[data-highlight-cursor]");
const highlightCursorLabel = highlightCursor?.querySelector("[data-highlight-cursor-label]");
let activeProjectNumber = currentProject?.textContent ?? "01";
let setMoreWorkProgressActive = () => {};
let beginMoreWorkProgressReturn = () => {};

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

if (highlightCursor && highlightCursorLabel) {
  const defaultCursorLabel = "You";
  let activeCursorTarget = null;
  let customCursorEnabled = false;

  function enableHighlightCursor(event) {
    if (event.pointerType && event.pointerType !== "mouse") return false;
    if (!customCursorEnabled) {
      customCursorEnabled = true;
      document.documentElement.classList.add("is-cursor-enabled");
    }
    return true;
  }

  function hideHighlightCursor() {
    document.documentElement.classList.remove("is-cursor-active");
    highlightCursor.classList.remove("is-hot", "is-edge-right", "is-edge-bottom");
    highlightCursorLabel.textContent = defaultCursorLabel;
    activeCursorTarget = null;
  }

  document.addEventListener("pointermove", (event) => {
    if (!enableHighlightCursor(event)) return;
    highlightCursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    document.documentElement.classList.add("is-cursor-active");

    highlightCursor.classList.toggle("is-edge-right", event.clientX > window.innerWidth - 130);
    highlightCursor.classList.toggle("is-edge-bottom", event.clientY > window.innerHeight - 58);

    const nextCursorTarget = event.target instanceof Element
      ? event.target.closest("[data-cursor-label]")
      : null;

    if (nextCursorTarget !== activeCursorTarget) {
      activeCursorTarget = nextCursorTarget;
      highlightCursor.classList.toggle("is-hot", Boolean(activeCursorTarget));
      highlightCursorLabel.textContent = activeCursorTarget?.dataset.cursorLabel || defaultCursorLabel;
    }
  }, { passive: true });

  document.documentElement.addEventListener("pointerleave", hideHighlightCursor);
  window.addEventListener("blur", hideHighlightCursor);
}

experienceToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const item = toggle.closest(".experience-item");
    const panelId = toggle.getAttribute("aria-controls");
    const panel = panelId ? document.getElementById(panelId) : null;
    const willOpen = !item?.classList.contains("is-open");

    item?.classList.toggle("is-open", willOpen);
    toggle.setAttribute("aria-expanded", String(willOpen));
    if (panel) panel.inert = !willOpen;

    const label = toggle.querySelector(".visually-hidden");
    const company = item?.querySelector(".experience-copy h3")?.textContent?.trim() ?? "该项";
    if (label) label.textContent = `${willOpen ? "收起" : "展开"}${company}详细经历`;
  });
});

if (contactSection && contactToggle && contactDetails) {
  contactDetails.inert = true;

  contactToggle.addEventListener("click", () => {
    const willOpen = !contactSection.classList.contains("is-contact-open");

    contactSection.classList.toggle("is-contact-open", willOpen);
    contactToggle.setAttribute("aria-expanded", String(willOpen));
    contactToggle.dataset.cursorLabel = willOpen ? "收起联系方式" : "展开联系方式";
    contactDetails.setAttribute("aria-hidden", String(!willOpen));
    contactDetails.inert = !willOpen;

    window.setTimeout(() => window.ScrollTrigger?.refresh(), prefersReducedMotion.matches ? 0 : 680);
  });
}

async function copyContactValue(value) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const helper = document.createElement("textarea");
  helper.value = value;
  helper.readOnly = true;
  helper.style.position = "fixed";
  helper.style.inset = "0 auto auto -9999px";
  helper.style.opacity = "0";
  document.body.append(helper);
  helper.select();
  helper.setSelectionRange(0, helper.value.length);

  const didCopy = document.execCommand("copy");
  helper.remove();

  if (!didCopy) throw new Error("Copy command was rejected");
}

contactCopyButtons.forEach((button) => {
  let resetTimer;

  button.addEventListener("click", async () => {
    window.clearTimeout(resetTimer);

    try {
      await copyContactValue(button.dataset.copyValue || "");
      button.textContent = "已复制";
      button.classList.add("is-copied");
      button.dataset.cursorLabel = "已复制";
      if (contactCopyStatus) contactCopyStatus.textContent = `${button.dataset.copyLabel || "内容"}已复制`;
    } catch {
      button.textContent = "复制失败";
      button.classList.remove("is-copied");
      button.dataset.cursorLabel = "请重试";
      if (contactCopyStatus) contactCopyStatus.textContent = `${button.dataset.copyLabel || "内容"}复制失败，请重试`;
    }

    resetTimer = window.setTimeout(() => {
      button.textContent = "复制";
      button.classList.remove("is-copied");
      button.dataset.cursorLabel = `复制${button.dataset.copyLabel || "内容"}`;
    }, 1800);
  });
});

if (contactQrCards.length && hasFinePointer.matches && !prefersReducedMotion.matches) {
  contactQrCards.forEach((card) => {
    let pointerFrame = 0;
    let pendingPointer = null;

    const resetQrDepth = () => {
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      pendingPointer = null;
      card.style.setProperty("--qr-rx", "0deg");
      card.style.setProperty("--qr-ry", "0deg");
      card.style.setProperty("--qr-shadow-x", "0px");
      card.style.setProperty("--qr-shadow-y", "18px");
    };

    const renderQrDepth = () => {
      pointerFrame = 0;
      if (!pendingPointer) return;

      const bounds = card.getBoundingClientRect();
      const x = Math.min(Math.max(pendingPointer.clientX - bounds.left, 0), bounds.width);
      const y = Math.min(Math.max(pendingPointer.clientY - bounds.top, 0), bounds.height);
      const normalizedX = (x / bounds.width - 0.5) * 2;
      const normalizedY = (y / bounds.height - 0.5) * 2;

      // Tilt the hovered side away from the viewer to create a subtle pressed-in surface.
      card.style.setProperty("--qr-rx", `${(-normalizedY * 7).toFixed(2)}deg`);
      card.style.setProperty("--qr-ry", `${(normalizedX * 7).toFixed(2)}deg`);
      card.style.setProperty("--qr-shadow-x", `${(-normalizedX * 9).toFixed(1)}px`);
      card.style.setProperty("--qr-shadow-y", `${(18 - normalizedY * 5).toFixed(1)}px`);
    };

    card.addEventListener("pointermove", (event) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      pendingPointer = { clientX: event.clientX, clientY: event.clientY };
      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(renderQrDepth);
    }, { passive: true });

    card.addEventListener("pointerleave", resetQrDepth);
    card.addEventListener("pointercancel", resetQrDepth);
  });
}

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

      if (activeSlide) {
        activeProjectNumber = activeSlide.target.dataset.projectSlide;
        if (!projectProgress?.classList.contains("is-more-work")) {
          currentProject.textContent = activeProjectNumber;
          projectProgress?.setAttribute("aria-label", `当前项目 ${activeProjectNumber} /03`);
        }
      }
    },
    { threshold: [0.2, 0.45, 0.7], rootMargin: "-28% 0px -28%" },
  );

  projectSlides.forEach((slide) => projectObserver.observe(slide));
}

if (projectProgress && projectWork && moreWorkSection && "IntersectionObserver" in window) {
  let isProjectWorkVisible = false;
  let isMoreWorkActive = false;
  let isReturningUpFromMoreWork = false;
  let progressScrollEndTimer = 0;
  let progressBoundaryFrame = 0;

  const syncProjectProgress = () => {
    const isInProgressArea = isProjectWorkVisible && !isMoreWorkActive;

    projectProgress.classList.toggle("is-active", isInProgressArea);
    projectProgress.classList.toggle("is-returning-up", isReturningUpFromMoreWork);

    if (!isInProgressArea || isReturningUpFromMoreWork) {
      projectProgress.setAttribute("aria-hidden", "true");
    } else {
      projectProgress.removeAttribute("aria-hidden");
    }

    // Keep the outgoing label frozen while it is hidden. This prevents the
    // more-work title from turning into the project number for a visible frame.
    if (isReturningUpFromMoreWork) return;

    projectProgress.classList.toggle("is-more-work", isMoreWorkActive);

    if (isMoreWorkActive) {
      currentProject.textContent = "";
      projectProgress.setAttribute("aria-label", "项目轮播");
    } else {
      currentProject.textContent = activeProjectNumber;
      projectProgress.setAttribute("aria-label", `当前项目 ${activeProjectNumber} /03`);
    }
  };

  setMoreWorkProgressActive = (isActive) => {
    if (isMoreWorkActive === isActive) return;
    isMoreWorkActive = isActive;
    syncProjectProgress();
  };

  const finishUpwardReturn = () => {
    window.clearTimeout(progressScrollEndTimer);
    if (!isReturningUpFromMoreWork) return;
    isReturningUpFromMoreWork = false;
    syncProjectProgress();
  };

  const scheduleUpwardReturnFinish = () => {
    window.clearTimeout(progressScrollEndTimer);
    progressScrollEndTimer = window.setTimeout(finishUpwardReturn, 220);
  };

  beginMoreWorkProgressReturn = () => {
    if (isReturningUpFromMoreWork) return;
    isReturningUpFromMoreWork = true;
    syncProjectProgress();
    scheduleUpwardReturnFinish();
  };

  const updateMoreWorkProgressBoundary = () => {
    progressBoundaryFrame = 0;
    const bounds = moreWorkSection.getBoundingClientRect();
    const isBeforeSectionEnd = bounds.bottom > 24;
    const entryThreshold = -32;
    const exitThreshold = -8;
    const nextIsMoreWorkActive = isBeforeSectionEnd && (
      isMoreWorkActive
        ? bounds.top <= exitThreshold
        : bounds.top <= entryThreshold
    );

    if (nextIsMoreWorkActive === isMoreWorkActive) return;

    if (isMoreWorkActive && !nextIsMoreWorkActive && bounds.top > exitThreshold) {
      beginMoreWorkProgressReturn();
    }
    setMoreWorkProgressActive(nextIsMoreWorkActive);
  };

  const scheduleMoreWorkProgressBoundary = () => {
    if (progressBoundaryFrame) return;
    progressBoundaryFrame = window.requestAnimationFrame(updateMoreWorkProgressBoundary);
  };

  const projectProgressObserver = new IntersectionObserver(
    ([entry]) => {
      isProjectWorkVisible = entry.isIntersecting;
      syncProjectProgress();
    },
    { threshold: 0, rootMargin: "-1px 0px -1px" },
  );

  projectProgressObserver.observe(projectWork);
  window.addEventListener("scroll", scheduleMoreWorkProgressBoundary, { passive: true });
  window.addEventListener("resize", scheduleMoreWorkProgressBoundary);
  scheduleMoreWorkProgressBoundary();
}

const coverflowSection = document.querySelector("[data-coverflow]");

if (coverflowSection) {
  const coverflowPin = coverflowSection.querySelector("[data-coverflow-pin]");
  const coverflowStage = coverflowSection.querySelector("[data-coverflow-stage]");
  const coverflowTrack = coverflowSection.querySelector("[data-coverflow-track]");
  const coverflowCards = [...coverflowSection.querySelectorAll("[data-coverflow-card]")];
  const coverflowTitle = coverflowSection.querySelector("[data-coverflow-title]");
  const coverflowDescription = coverflowSection.querySelector("[data-coverflow-description]");
  const coverflowCopyItems = [coverflowTitle, coverflowDescription].filter(Boolean);
  const coverflowCurrent = coverflowSection.querySelector("[data-coverflow-current]");
  const coverflowProgress = coverflowSection.querySelector("[data-coverflow-progress]");
  const coverflowPrev = coverflowSection.querySelector("[data-coverflow-prev]");
  const coverflowNext = coverflowSection.querySelector("[data-coverflow-next]");
  const projectLightbox = document.querySelector("[data-project-lightbox]");
  const projectLightboxMedia = projectLightbox?.querySelector("[data-project-lightbox-media]");
  const projectLightboxTitle = projectLightbox?.querySelector("[data-project-lightbox-title]");
  const projectLightboxLabel = projectLightbox?.querySelector("[data-project-lightbox-label]");
  const projectLightboxClose = projectLightbox?.querySelector("[data-project-lightbox-close]");
  let activeCoverflowIndex = -1;
  let coverflowTween = null;
  let staticScrollFrame = 0;
  let coverflowPointerStart = null;
  let lightboxReturnFocus = null;

  const clampCoverflowIndex = (index) => Math.max(0, Math.min(coverflowCards.length - 1, index));

  function updateCoverflowCopy(index, animate = true) {
    const nextIndex = clampCoverflowIndex(index);
    if (nextIndex === activeCoverflowIndex) return;

    activeCoverflowIndex = nextIndex;
    const activeCard = coverflowCards[nextIndex];

    coverflowCards.forEach((card, cardIndex) => {
      const isActive = cardIndex === nextIndex;
      const cardTitle = card.dataset.title || "项目";
      card.classList.toggle("is-active", isActive);
      card.tabIndex = isActive ? 0 : -1;
      card.dataset.cursorLabel = isActive
        ? "放大查看"
        : cardIndex < nextIndex
          ? "查看上一项"
          : "查看下一项";
      card.setAttribute("aria-label", isActive ? `放大查看 ${cardTitle}` : `切换到 ${cardTitle}`);
      if (isActive) card.setAttribute("aria-current", "true");
      else card.removeAttribute("aria-current");
    });

    if (coverflowTitle) coverflowTitle.textContent = activeCard.dataset.title || "";
    if (coverflowDescription) coverflowDescription.textContent = activeCard.dataset.description || "";
    if (coverflowCurrent) coverflowCurrent.textContent = String(nextIndex + 1).padStart(2, "0");
    if (coverflowPrev) coverflowPrev.disabled = nextIndex === 0;
    if (coverflowNext) coverflowNext.disabled = nextIndex === coverflowCards.length - 1;

    if (
      animate &&
      !prefersReducedMotion.matches &&
      window.gsap &&
      coverflowCopyItems.length
    ) {
      window.gsap.fromTo(
        coverflowCopyItems,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.28, ease: "power1.out", stagger: 0.025, overwrite: "auto" },
      );
    }
  }

  function updateStaticCoverflow() {
    staticScrollFrame = 0;
    if (!coverflowTrack || !coverflowSection.classList.contains("is-static")) return;

    const trackCenter = coverflowTrack.scrollLeft + coverflowTrack.clientWidth / 2;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    coverflowCards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - trackCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    updateCoverflowCopy(nearestIndex, false);
    if (coverflowProgress) {
      const progress = coverflowCards.length > 1 ? nearestIndex / (coverflowCards.length - 1) : 1;
      coverflowProgress.style.transform = `scaleX(${progress})`;
    }
  }

  function goToCoverflowCard(index) {
    const nextIndex = clampCoverflowIndex(index);
    const scrollTrigger = coverflowTween?.scrollTrigger;

    if (scrollTrigger) {
      const progress = coverflowCards.length > 1 ? nextIndex / (coverflowCards.length - 1) : 0;
      const targetY = scrollTrigger.start + (scrollTrigger.end - scrollTrigger.start) * progress;
      window.scrollTo({ top: targetY, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
      return;
    }

    const card = coverflowCards[nextIndex];
    if (!coverflowTrack || !card) return;
    const targetLeft = card.offsetLeft - (coverflowTrack.clientWidth - card.offsetWidth) / 2;
    coverflowTrack.scrollTo({ left: targetLeft, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
  }

  coverflowPrev?.addEventListener("click", () => goToCoverflowCard(activeCoverflowIndex - 1));
  coverflowNext?.addEventListener("click", () => goToCoverflowCard(activeCoverflowIndex + 1));

  function openProjectLightbox(card) {
    if (!projectLightbox || !projectLightboxMedia || !card.firstElementChild) return;

    const title = card.dataset.title || "项目大图";
    const visual = card.firstElementChild.cloneNode(true);
    visual.setAttribute("aria-hidden", "true");
    projectLightboxMedia.replaceChildren(visual);
    if (projectLightboxTitle) projectLightboxTitle.textContent = `${title} 项目大图`;
    if (projectLightboxLabel) projectLightboxLabel.textContent = title;

    lightboxReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : card;
    document.documentElement.classList.add("is-project-lightbox-open");
    projectLightbox.showModal();
  }

  coverflowCards.forEach((card, cardIndex) => {
    card.setAttribute("role", "button");
    card.removeAttribute("aria-roledescription");

    card.addEventListener("click", () => {
      if (coverflowPointerStart?.moved) return;
      if (cardIndex !== activeCoverflowIndex) {
        goToCoverflowCard(cardIndex);
        return;
      }
      openProjectLightbox(card);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      if (cardIndex !== activeCoverflowIndex) {
        goToCoverflowCard(cardIndex);
        return;
      }
      openProjectLightbox(card);
    });
  });

  coverflowStage?.addEventListener("pointerdown", (event) => {
    coverflowPointerStart = { x: event.clientX, y: event.clientY, moved: false };
  });

  coverflowStage?.addEventListener("pointermove", (event) => {
    if (!coverflowPointerStart) return;
    const distance = Math.hypot(event.clientX - coverflowPointerStart.x, event.clientY - coverflowPointerStart.y);
    if (distance > 8) coverflowPointerStart.moved = true;
  });

  coverflowStage?.addEventListener("pointercancel", () => {
    coverflowPointerStart = null;
  });

  coverflowStage?.addEventListener("click", (event) => {
    if (coverflowPointerStart?.moved) return;
    if (event.target instanceof Element && event.target.closest("[data-coverflow-card]")) return;

    const activeCard = coverflowCards[activeCoverflowIndex];
    if (!activeCard) return;
    const activeRect = activeCard.getBoundingClientRect();

    if (event.clientX < activeRect.left && activeCoverflowIndex > 0) {
      goToCoverflowCard(activeCoverflowIndex - 1);
    } else if (event.clientX > activeRect.right && activeCoverflowIndex < coverflowCards.length - 1) {
      goToCoverflowCard(activeCoverflowIndex + 1);
    }
  });

  projectLightbox?.addEventListener("click", (event) => {
    if (event.target === projectLightbox) projectLightbox.close();
  });

  projectLightboxClose?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    projectLightbox.close();
  });

  projectLightbox?.addEventListener("close", () => {
    document.documentElement.classList.remove("is-project-lightbox-open");
    projectLightboxMedia?.replaceChildren();
    lightboxReturnFocus?.focus?.({ preventScroll: true });
    lightboxReturnFocus = null;
  });

  coverflowStage?.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    goToCoverflowCard(activeCoverflowIndex + (event.key === "ArrowRight" ? 1 : -1));
  });

  coverflowTrack?.addEventListener(
    "scroll",
    () => {
      if (staticScrollFrame) return;
      staticScrollFrame = requestAnimationFrame(updateStaticCoverflow);
    },
    { passive: true },
  );

  if (
    coverflowPin &&
    coverflowStage &&
    coverflowTrack &&
    coverflowCards.length &&
    window.gsap &&
    window.ScrollTrigger
  ) {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    const coverflowMedia = gsap.matchMedia();
    gsap.registerPlugin(ScrollTrigger);

    coverflowMedia.add(
      {
        scrollMode: "(min-width: 821px) and (prefers-reduced-motion: no-preference)",
        staticMode: "(max-width: 820px), (prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { scrollMode } = context.conditions;

        if (!scrollMode) {
          coverflowSection.classList.add("is-static");
          gsap.set(coverflowCards, { clearProps: "transform,opacity,visibility,zIndex,pointerEvents" });
          requestAnimationFrame(updateStaticCoverflow);
          return () => {
            coverflowSection.classList.remove("is-static");
          };
        }

        coverflowSection.classList.remove("is-static");
        const coverflowState = { position: 0 };

        function renderCoverflow(position) {
          const cardStep = Math.min(window.innerWidth * 0.38, 470);

          coverflowCards.forEach((card, index) => {
            const offset = index - position;
            const distance = Math.abs(offset);
            const direction = Math.sign(offset);

            gsap.set(card, {
              xPercent: -50,
              yPercent: -50,
              x: offset * cardStep,
              z: -distance * 240,
              rotationY: -direction * Math.min(58, distance * 46),
              scale: Math.max(0.7, 1 - distance * 0.12),
              autoAlpha: distance > 2.2 ? 0 : Math.max(0.18, 1 - distance * 0.24),
              zIndex: Math.round(100 - distance * 10),
              pointerEvents: distance < 1.2 ? "auto" : "none",
            });
          });

          updateCoverflowCopy(Math.round(position));
          if (coverflowProgress) {
            const progress = coverflowCards.length > 1 ? position / (coverflowCards.length - 1) : 1;
            gsap.set(coverflowProgress, { scaleX: progress });
          }
        }

        renderCoverflow(0);

        coverflowTween = gsap.to(coverflowState, {
          position: coverflowCards.length - 1,
          ease: "none",
          onUpdate: () => renderCoverflow(coverflowState.position),
          scrollTrigger: {
            id: "more-work-coverflow",
            trigger: coverflowSection,
            start: "top top",
            end: () => `+=${Math.max(720, window.innerHeight * 0.82) * (coverflowCards.length - 1)}`,
            pin: coverflowPin,
            pinSpacing: true,
            scrub: 0.65,
            snap: {
              snapTo: 1 / (coverflowCards.length - 1),
              directional: false,
              duration: { min: 0.18, max: 0.42 },
              delay: 0.08,
              ease: "power1.inOut",
            },
            onToggle: (self) => {
              if (self.isActive) {
                document.documentElement.classList.add("is-coverflow-active");
                return;
              }

              document.documentElement.classList.remove("is-coverflow-active");
            },
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        let dragPointerId = null;
        let dragStartX = 0;
        let dragStartScrollY = 0;

        function stopCoverflowDrag(event) {
          if (dragPointerId === null || (event && event.pointerId !== dragPointerId)) return;
          if (coverflowStage.hasPointerCapture?.(dragPointerId)) coverflowStage.releasePointerCapture(dragPointerId);
          dragPointerId = null;
          coverflowStage.classList.remove("is-dragging");
        }

        function startCoverflowDrag(event) {
          if (event.button !== 0 || !coverflowTween?.scrollTrigger?.isActive) return;
          dragPointerId = event.pointerId;
          dragStartX = event.clientX;
          dragStartScrollY = window.scrollY;
        }

        function moveCoverflowDrag(event) {
          if (event.pointerId !== dragPointerId || !coverflowTween?.scrollTrigger) return;
          const dragDistance = event.clientX - dragStartX;
          if (Math.abs(dragDistance) < 3) return;
          event.preventDefault();
          if (!coverflowStage.hasPointerCapture?.(event.pointerId)) {
            coverflowStage.setPointerCapture?.(event.pointerId);
            coverflowStage.classList.add("is-dragging");
          }
          const trigger = coverflowTween.scrollTrigger;
          const scrollRange = trigger.end - trigger.start;
          const dragSensitivity = 0.55;
          const targetY = dragStartScrollY - dragDistance * (scrollRange / Math.max(coverflowStage.clientWidth, 1)) * dragSensitivity;
          window.scrollTo(0, Math.max(trigger.start, Math.min(trigger.end, targetY)));
        }

        coverflowStage.addEventListener("pointerdown", startCoverflowDrag);
        coverflowStage.addEventListener("pointermove", moveCoverflowDrag);
        coverflowStage.addEventListener("pointerup", stopCoverflowDrag);
        coverflowStage.addEventListener("pointercancel", stopCoverflowDrag);

        requestAnimationFrame(() => ScrollTrigger.refresh());

        return () => {
          coverflowStage.removeEventListener("pointerdown", startCoverflowDrag);
          coverflowStage.removeEventListener("pointermove", moveCoverflowDrag);
          coverflowStage.removeEventListener("pointerup", stopCoverflowDrag);
          coverflowStage.removeEventListener("pointercancel", stopCoverflowDrag);
          stopCoverflowDrag();
          document.documentElement.classList.remove("is-coverflow-active");
          coverflowTween = null;
        };
      },
    );
  } else {
    coverflowSection.classList.add("is-static");
    requestAnimationFrame(updateStaticCoverflow);
  }

  updateCoverflowCopy(0, false);
}

const screenSnapQuery = window.matchMedia("(min-width: 821px) and (pointer: fine)");
let screenScrollLocked = false;
let screenCanAdvance = true;
let wheelReleaseTimer = 0;

function getActiveScreenIndex() {
  const headerOffset = header?.offsetHeight ?? 0;
  const containingIndex = scrollScreens.findIndex((screen) => {
    const bounds = screen.getBoundingClientRect();
    return bounds.top <= headerOffset + 2 && bounds.bottom > headerOffset + 2;
  });

  if (containingIndex >= 0) return containingIndex;

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
    if (document.documentElement.classList.contains("is-project-lightbox-open")) {
      event.preventDefault();
      return;
    }
    if (!scrollScreens.length || !screenSnapQuery.matches) return;
    if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX) || Math.abs(event.deltaY) < 8) return;

    const direction = Math.sign(event.deltaY);
    const activeIndex = getActiveScreenIndex();
    const activeScreen = scrollScreens[activeIndex];
    const activeBounds = activeScreen.getBoundingClientRect();
    const headerOffset = header?.offsetHeight ?? 0;

    if (activeScreen.hasAttribute("data-scroll-long")) {
      const canScrollDown = direction > 0 && activeBounds.bottom > window.innerHeight + 2;
      const canScrollUp = direction < 0 && activeBounds.top < headerOffset - 2;
      if (canScrollDown || canScrollUp) return;
    }

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
