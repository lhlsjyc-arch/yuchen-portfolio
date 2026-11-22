import Slide04 from "../.figma-build/slide-04";
import Slide05 from "../.figma-build/slide-05";
import Slide06 from "../.figma-build/slide-06";
import Slide07 from "../.figma-build/slide-07";
import Slide10 from "../.figma-build/slide-10";
import Slide11 from "../.figma-build/slide-11";
import Slide12 from "../.figma-build/slide-12";
import Slide15 from "../.figma-build/slide-15";
import Slide17 from "../.figma-build/slide-17";
import Slide18 from "../.figma-build/slide-18";
import Slide20 from "../.figma-build/slide-20";
import Slide21 from "../.figma-build/slide-21";
import Slide23 from "../.figma-build/slide-23";
import Slide24 from "../.figma-build/slide-24";
import Slide25 from "../.figma-build/slide-25";
import Slide26 from "../.figma-build/slide-26";
import Slide27 from "../.figma-build/slide-27";
import Slide28 from "../.figma-build/slide-28";
import Slide29 from "../.figma-build/slide-29";
import Slide30 from "../.figma-build/slide-30";
import Slide31 from "../.figma-build/slide-31";
import Slide32 from "../.figma-build/slide-32";
import Slide33 from "../.figma-build/slide-33";
import Slide34 from "../.figma-build/slide-34";
import Slide35 from "../.figma-build/slide-35";
import Slide36 from "../.figma-build/slide-36";
import Slide37 from "../.figma-build/slide-37";
import Slide38 from "../.figma-build/slide-38";
import Slide39 from "../.figma-build/slide-39";
import Slide40 from "../.figma-build/slide-40";
import Slide41 from "../.figma-build/slide-41";
import Slide42 from "../.figma-build/slide-42";
import Slide44 from "../.figma-build/slide-44";

import Slide13Title from "../.figma-build/part-13_title";
import Slide13Screen02 from "../.figma-build/part-13_02";
import Slide13Screen03 from "../.figma-build/part-13_03";
import Slide13Screen04 from "../.figma-build/part-13_04";
import Slide13Screen05 from "../.figma-build/part-13_05";
import Slide14Title from "../.figma-build/part-14_title";
import Slide14Screen01 from "../.figma-build/part-14_01";
import Slide14Screen02 from "../.figma-build/part-14_02";
import Slide14Screen03 from "../.figma-build/part-14_03";
import Slide14Screen04 from "../.figma-build/part-14_04";
import Slide14Screen05 from "../.figma-build/part-14_05";
import Slide16Title from "../.figma-build/part-16_title";
import Slide16Screen01 from "../.figma-build/part-16_01";
import Slide16Screen04 from "../.figma-build/part-16_04";
import Slide19Title from "../.figma-build/part-19_title";
import Slide19Screen01 from "../.figma-build/part-19_01";
import Slide19Screen02 from "../.figma-build/part-19_02";
import Slide19Screen03 from "../.figma-build/part-19_03";
import Slide22Title from "../.figma-build/part-22_title";
import Slide22Overview from "../.figma-build/part-22_01";
import Slide22Comparison from "../.figma-build/part-22_02";
import Slide22LongA from "../.figma-build/part-22_03";
import Slide22LongB from "../.figma-build/part-22_04";
import Slide22Metrics from "../.figma-build/part-22_05";
import Slide43Title from "../.figma-build/part-43_title";
import Slide43Example from "../.figma-build/part-43_02";

import { applyFigmaUtilities } from "./figma-utilities";

type FigmaComponent = (props?: Record<string, unknown>) => Node;
type SlideDescriptor = { id: string; render: () => Node };

const logicalWidth = 2496;
const logicalHeight = 1376;
const lightHeaderSlides = new Set(["slide-42", "slide-44", "slide-45"]);

if ("scrollRestoration" in history) history.scrollRestoration = "manual";

function element(tag: string, className?: string) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function place(root: HTMLElement, component: FigmaComponent, x: number, y: number, width: number, height: number) {
  const wrapper = element("div", "composite-layer");
  Object.assign(wrapper.style, {
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
  });
  wrapper.appendChild(component({}));
  root.appendChild(wrapper);
}

function placeImage(root: HTMLElement, src: string, x: number, y: number, width: number, height: number, className = "") {
  const image = document.createElement("img");
  image.src = src;
  image.alt = "";
  image.decoding = "async";
  image.className = `composite-image ${className}`.trim();
  Object.assign(image.style, {
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
  });
  root.appendChild(image);
}

function compositeRoot(extraClass = "") {
  const root = element("div", `composite-root ${extraClass}`.trim());
  root.appendChild(element("div", "composite-gradient"));
  return root;
}

function renderSlide13() {
  const root = compositeRoot();
  place(root, Slide13Title, 0, 0, 2496, 157);
  place(root, Slide13Screen02, 601, 306, 390, 844);
  place(root, Slide13Screen03, 1053, 306, 390, 844);
  place(root, Slide13Screen04, 1505, 306, 390, 844);
  place(root, Slide13Screen05, 1957, 306, 390, 844);
  placeImage(root, "./assets/bing-app/screen-home.png", 149, 306, 390, 844, "screen-home-crop");
  return root;
}

function renderSlide14() {
  const root = compositeRoot();
  place(root, Slide14Title, 0, 0, 2496, 157);
  place(root, Slide14Screen01, 177, 306, 390, 844);
  place(root, Slide14Screen02, 615, 306, 390, 844);
  place(root, Slide14Screen03, 1053, 306, 390, 844);
  place(root, Slide14Screen04, 1491, 306, 390, 844);
  place(root, Slide14Screen05, 1929, 306, 390, 844);
  return root;
}

function renderSlide16() {
  const root = compositeRoot();
  place(root, Slide16Title, 0, 0, 2496, 157);
  place(root, Slide16Screen01, 421, 301, 390, 844);
  placeImage(root, "./assets/bing-app/figma-elements/slide-16-screen-02.png", 871, 302, 390, 844);
  placeImage(root, "./assets/bing-app/figma-elements/slide-16-screen-03.png", 1321, 300, 390, 844);
  place(root, Slide16Screen04, 1771, 307, 390, 844);
  return root;
}

function label(root: HTMLElement, text: string, x: number, y: number, width: number) {
  const node = element("p", "composite-label");
  node.textContent = text;
  Object.assign(node.style, { left: `${x}px`, top: `${y}px`, width: `${width}px` });
  root.appendChild(node);
}

function renderSlide19() {
  const root = compositeRoot();
  place(root, Slide19Title, 0, 0, 2496, 157);
  place(root, Slide19Screen01, 60, 351, 390, 844);
  place(root, Slide19Screen02, 563, 351, 792, 844);
  place(root, Slide19Screen03, 1456, 351, 1194, 844);
  label(root, "Search focused", 130, 1255, 226);
  label(root, "Search + Feed", 849, 1255, 210);
  label(root, "Conversational HP", 1907, 1255, 270);
  return root;
}

function renderSlide22() {
  const root = compositeRoot();
  place(root, Slide22Title, 0, 0, 2496, 157);
  place(root, Slide22Metrics, 132, 288, 1004, 461);
  place(root, Slide22Overview, 132, 853, 361, 350);
  place(root, Slide22Comparison, 544, 853, 592, 415);
  place(root, Slide22LongA, 1368, 290, 390, 1801);
  place(root, Slide22LongB, 1832, -973, 390, 2411);
  label(root, "Whole page side by side", 186, 1239, 280);
  return root;
}

function renderSlide43() {
  const root = compositeRoot();
  place(root, Slide43Title, 0, 0, 2496, 157);
  placeImage(root, "./assets/bing-app/figma-elements/slide-43-list.png", 498, 337, 1925, 844);
  place(root, Slide43Example, 64, 479, 358, 496);
  return root;
}

function renderSlide45() {
  const root = compositeRoot("slide-45-root");
  placeImage(root, "./assets/bing-app/figma-elements/slide-45-screens.png", 137, -621, 2246, 2660);
  return root;
}

function renderInteractiveSearchTypes() {
  const root = element("div", "intent-interactive");
  root.dataset.intentState = "base";

  const base = element("div", "intent-base");
  const baseSlide = Slide07({});
  if (baseSlide instanceof HTMLElement) {
    Array.from(baseSlide.children).slice(2).forEach((child) => {
      if (child instanceof HTMLElement && child.dataset.nodeId !== "1:79033") {
        child.classList.add("intent-deck-item");
      }
    });
  }
  base.appendChild(baseSlide);
  root.appendChild(base);

  function addOverlay(
    state: "left" | "right",
    type: string,
    firstLine: string,
    secondLine: string,
  ) {
    const overlay = element("div", `intent-overlay intent-overlay-${state} intent-deck-item`);
    overlay.dataset.state = state;
    overlay.setAttribute("aria-hidden", "true");

    const glass = element("div", "intent-overlay-glass");
    overlay.appendChild(glass);

    const heading = element("p", "intent-overlay-heading");
    heading.textContent = type;
    overlay.appendChild(heading);

    const copy = element("div", "intent-overlay-copy");
    const lineOne = document.createElement("p");
    lineOne.textContent = firstLine;
    const lineTwo = document.createElement("p");
    lineTwo.textContent = secondLine;
    copy.append(lineOne, lineTwo);
    overlay.appendChild(copy);
    root.appendChild(overlay);
  }

  addOverlay(
    "left",
    "User type A",
    "In the short term, ",
    "searches that require clear answers and have a strong purpose",
  );
  addOverlay(
    "right",
    "User type B",
    "In the long term, ",
    "Exploring a specific topic, seeking content for inspiration",
  );

  function setState(state: "base" | "left" | "right") {
    root.dataset.intentState = state;
    root.querySelectorAll<HTMLElement>(".intent-overlay").forEach((overlay) => {
      overlay.setAttribute("aria-hidden", String(overlay.dataset.state !== state));
    });
    root.querySelectorAll<HTMLButtonElement>(".intent-hotspot").forEach((hotspot) => {
      hotspot.setAttribute("aria-pressed", String(hotspot.dataset.side === state));
    });
  }

  function addHotspot(side: "left" | "right", labelText: string) {
    const hotspot = element("button", `intent-hotspot intent-hotspot-${side}`) as HTMLButtonElement;
    hotspot.type = "button";
    hotspot.dataset.side = side;
    hotspot.setAttribute("aria-label", labelText);
    hotspot.setAttribute("aria-pressed", "false");
    hotspot.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "touch") setState(side);
    });
    hotspot.addEventListener("pointerleave", (event) => {
      if (event.pointerType !== "touch" && !hotspot.matches(":focus")) setState("base");
    });
    hotspot.addEventListener("focus", () => setState(side));
    hotspot.addEventListener("click", (event) => {
      const pointerType = (event as PointerEvent).pointerType;
      if (pointerType === "touch") {
        setState(root.dataset.intentState === side ? "base" : side);
        return;
      }
      setState(side);
    });
    root.appendChild(hotspot);
  }

  addHotspot("left", "查看左侧两类搜索用户");
  addHotspot("right", "查看右侧两类搜索用户");

  root.addEventListener("pointerleave", (event) => {
    if (event.pointerType !== "touch" && !root.matches(":focus-within")) setState("base");
  });
  root.addEventListener("focusout", () => {
    requestAnimationFrame(() => {
      if (!root.matches(":focus-within")) setState("base");
    });
  });

  return root;
}

const slides: SlideDescriptor[] = [
  ["04", Slide04], ["05", Slide05], ["07", renderInteractiveSearchTypes], ["06", Slide06],
  ["10", Slide10], ["11", Slide11], ["12", Slide12], ["13", renderSlide13], ["14", renderSlide14], ["15", Slide15],
  ["16", renderSlide16], ["17", Slide17], ["18", Slide18], ["19", renderSlide19], ["20", Slide20], ["21", Slide21],
  ["22", renderSlide22], ["23", Slide23], ["24", Slide24], ["25", Slide25], ["26", Slide26], ["27", Slide27],
  ["28", Slide28], ["29", Slide29], ["30", Slide30], ["31", Slide31], ["32", Slide32], ["33", Slide33],
  ["34", Slide34], ["35", Slide35], ["36", Slide36], ["37", Slide37], ["38", Slide38], ["39", Slide39],
  ["40", Slide40], ["41", Slide41], ["42", Slide42], ["43", renderSlide43], ["44", Slide44], ["45", renderSlide45],
].map(([id, component]) => ({ id: id as string, render: () => (component as FigmaComponent)({}) }));

const caseRoot = document.querySelector<HTMLElement>("#bing-case");
const sectionMap = new Map<HTMLElement, SlideDescriptor>();
const backgroundMap = new Map<HTMLElement, HTMLElement>();

function separateBackground(content: HTMLElement, backgroundCanvas: HTMLElement) {
  function extractFrom(root: HTMLElement, keepBackground: boolean) {
    root.classList.add("case-content-root");

    const compositeGradient = root.querySelector<HTMLElement>(":scope > .composite-gradient");
    if (compositeGradient) {
      if (keepBackground) backgroundCanvas.appendChild(compositeGradient);
      else compositeGradient.remove();
      return;
    }

    const directChildren = Array.from(root.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
    const layers: HTMLElement[] = [];
    const baseLayer = directChildren[0];
    const glowLayer = directChildren[1];

    if (baseLayer?.hasAttribute("aria-hidden")) layers.push(baseLayer);
    if (
      glowLayer &&
      glowLayer.classList.contains("absolute") &&
      glowLayer.classList.contains("contents") &&
      !(glowLayer.textContent || "").trim()
    ) layers.push(glowLayer);

    for (const layer of layers) {
      if (keepBackground) backgroundCanvas.appendChild(layer);
      else layer.remove();
    }
  }

  const intentBase = content.querySelector<HTMLElement>(":scope > .intent-base");
  if (intentBase) {
    const baseRoot = intentBase.firstElementChild;
    if (baseRoot instanceof HTMLElement) extractFrom(baseRoot, true);
    return;
  }

  extractFrom(content, true);
}

function mount(section: Element, descriptor: SlideDescriptor) {
  if (section.hasAttribute("data-mounted")) return;
  const canvas = section.querySelector<HTMLElement>(".case-canvas");
  const backgroundCanvas = backgroundMap.get(section as HTMLElement);
  if (!canvas || !backgroundCanvas) return;
  const content = descriptor.render();
  if (content instanceof HTMLElement) {
    applyFigmaUtilities(content);
    separateBackground(content, backgroundCanvas);
  }
  content.querySelectorAll?.("img").forEach((image) => {
    (image as HTMLImageElement).loading = "lazy";
    (image as HTMLImageElement).decoding = "async";
  });
  canvas.replaceChildren(content);
  section.setAttribute("data-mounted", "");
}

if (caseRoot) {
  for (const descriptor of slides) {
    const section = element("section", "case-section");
    section.id = `slide-${descriptor.id}`;
    section.setAttribute("aria-label", `Bing App · ${descriptor.id}`);

    const backgroundLayer = element("div", "case-backdrop-layer");
    backgroundLayer.dataset.slide = descriptor.id;
    backgroundLayer.setAttribute("aria-hidden", "true");
    const backgroundCanvas = element("div", "case-background-canvas");
    backgroundLayer.appendChild(backgroundCanvas);
    section.appendChild(backgroundLayer);

    const canvas = element("div", "case-canvas");
    canvas.appendChild(element("div", "case-loading"));
    section.appendChild(canvas);
    caseRoot.appendChild(section);
    sectionMap.set(section, descriptor);
    backgroundMap.set(section, backgroundCanvas);
  }
}

function fitCanvases() {
  if (!caseRoot) return;
  const stageWidth = caseRoot.clientWidth;
  const contentScale = stageWidth / logicalWidth;
  const sectionHeight = logicalHeight * contentScale;

  document.querySelectorAll<HTMLElement>(".case-section").forEach((section) => {
    section.style.height = `${sectionHeight}px`;
  });

  document.querySelectorAll<HTMLElement>(".case-canvas").forEach((canvas) => {
    canvas.style.left = "0";
    canvas.style.top = "0";
    const isAdaptiveIntent = canvas.closest("#slide-07") !== null;
    canvas.classList.toggle("intent-adaptive-canvas", isAdaptiveIntent);
    canvas.style.setProperty("--intent-deck-offset", "0px");
    canvas.style.transform = `scale(${contentScale})`;
  });

  document.querySelectorAll<HTMLElement>(".case-background-canvas").forEach((canvas) => {
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.transform = `scale(${contentScale})`;
  });
}

const sections = Array.from(sectionMap.keys());
let currentSlideIndex = Math.max(0, sections.findIndex((section) => `#${section.id}` === location.hash));
let scrollFrame = 0;

function mountAround(index: number, radius = 1) {
  const candidates: number[] = [];
  for (let offset = -radius; offset <= radius; offset += 1) candidates.push(index + offset);
  for (const candidate of candidates) {
    const section = sections[candidate];
    const descriptor = section && sectionMap.get(section);
    if (section && descriptor) mount(section, descriptor);
  }
}

function setCurrentSlide(index: number, updateHash = true) {
  if (!sections.length) return;
  const nextIndex = Math.max(0, Math.min(sections.length - 1, index));
  currentSlideIndex = nextIndex;
  document.body.dataset.headerTone = lightHeaderSlides.has(sections[nextIndex].id) ? "light" : "dark";
  const nextHash = `#${sections[nextIndex].id}`;
  if (updateHash && location.hash !== nextHash) history.replaceState(null, "", nextHash);
}

function updateCurrentSlide() {
  scrollFrame = 0;
  const headerHeight = document.querySelector<HTMLElement>(".site-header")?.getBoundingClientRect().height ?? 0;
  const viewportCenter = headerHeight + (window.innerHeight - headerHeight) / 2;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  sections.forEach((section, index) => {
    const bounds = section.getBoundingClientRect();
    const distance = Math.abs((bounds.top + bounds.bottom) / 2 - viewportCenter);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  setCurrentSlide(closestIndex);
}

function queueCurrentSlideUpdate() {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(updateCurrentSlide);
}

function showHashSlide() {
  if (!location.hash.startsWith("#slide-")) return;
  const index = sections.findIndex((section) => `#${section.id}` === location.hash);
  if (index < 0) return;
  mountAround(index, 2);
  sections[index].scrollIntoView({ block: "start", behavior: "auto" });
  setCurrentSlide(index, false);
}

fitCanvases();
mountAround(currentSlideIndex, 2);

const mountObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const section = entry.target as HTMLElement;
    const index = sections.indexOf(section);
    if (index >= 0) mountAround(index, 1);
  }
}, { rootMargin: "120% 0px" });

sections.forEach((section) => mountObserver.observe(section));
setCurrentSlide(currentSlideIndex, false);
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    caseRoot?.classList.add("is-ready");
    if (location.hash.startsWith("#slide-")) showHashSlide();
    else updateCurrentSlide();
  });
});
window.addEventListener("scroll", queueCurrentSlideUpdate, { passive: true });
window.addEventListener("resize", () => {
  fitCanvases();
  queueCurrentSlideUpdate();
}, { passive: true });
window.visualViewport?.addEventListener("resize", () => {
  fitCanvases();
  queueCurrentSlideUpdate();
}, { passive: true });
window.addEventListener("hashchange", showHashSlide);

const header = document.querySelector<HTMLElement>(".site-header");
const menuToggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
const mobileMenu = document.querySelector<HTMLElement>("#mobile-menu");

function closeMenu() {
  if (!mobileMenu || !menuToggle) return;
  mobileMenu.hidden = true;
  menuToggle.setAttribute("aria-expanded", "false");
}

menuToggle?.addEventListener("click", () => {
  if (!mobileMenu) return;
  const opening = mobileMenu.hidden;
  mobileMenu.hidden = !opening;
  menuToggle.setAttribute("aria-expanded", String(opening));
});

document.addEventListener("click", (event) => {
  if (!mobileMenu || mobileMenu.hidden) return;
  if (!(event.target as Element).closest?.(".site-header")) closeMenu();
});
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });
window.addEventListener("scroll", () => header?.classList.toggle("is-scrolled", scrollY > 8), { passive: true });

window.addEventListener("error", (event) => {
  if (event.target instanceof HTMLImageElement) event.target.hidden = true;
}, true);
