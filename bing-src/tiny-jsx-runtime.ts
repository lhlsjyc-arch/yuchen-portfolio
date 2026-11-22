const svgTags = new Set([
  "svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "defs", "mask",
  "clipPath", "linearGradient", "radialGradient", "stop", "filter", "feGaussianBlur", "feColorMatrix",
  "feBlend", "foreignObject", "use",
]);

const attributeNames: Record<string, string> = {
  className: "class",
  htmlFor: "for",
  tabIndex: "tabindex",
  fillRule: "fill-rule",
  clipRule: "clip-rule",
  strokeLinecap: "stroke-linecap",
  strokeLinejoin: "stroke-linejoin",
  strokeWidth: "stroke-width",
  strokeMiterlimit: "stroke-miterlimit",
  stopColor: "stop-color",
  stopOpacity: "stop-opacity",
};

export const Fragment = Symbol("Fragment");

function append(parent: Node, child: unknown) {
  if (child === null || child === undefined || child === false || child === true) return;
  if (Array.isArray(child)) {
    child.forEach((item) => append(parent, item));
    return;
  }
  if (child instanceof Node) {
    parent.appendChild(child);
    return;
  }
  parent.appendChild(document.createTextNode(String(child)));
}

function createElement(type: string) {
  return svgTags.has(type)
    ? document.createElementNS("http://www.w3.org/2000/svg", type)
    : document.createElement(type);
}

function applyStyle(element: HTMLElement | SVGElement, value: Record<string, unknown>) {
  for (const [property, raw] of Object.entries(value || {})) {
    if (raw === null || raw === undefined) continue;
    if (property.startsWith("--")) element.style.setProperty(property, String(raw));
    else (element.style as unknown as Record<string, string>)[property] = String(raw);
  }
}

export function jsx(
  type: unknown,
  props: Record<string, unknown> | null,
  ...children: unknown[]
) {
  const input = { ...(props || {}) };
  if (children.length) input.children = children;
  if (type === Fragment) {
    const fragment = document.createDocumentFragment();
    append(fragment, input.children);
    return fragment;
  }
  if (typeof type === "function") return type(input);

  const element = createElement(String(type));
  for (const [property, value] of Object.entries(input)) {
    if (property === "children" || value === null || value === undefined || value === false) continue;
    if (property === "style" && typeof value === "object") {
      applyStyle(element, value as Record<string, unknown>);
      continue;
    }
    if (property.startsWith("on") && typeof value === "function") {
      element.addEventListener(property.slice(2).toLowerCase(), value as EventListener);
      continue;
    }
    if (property === "dangerouslySetInnerHTML" && typeof value === "object") {
      element.innerHTML = String((value as { __html?: unknown }).__html || "");
      continue;
    }
    const attribute = attributeNames[property] || property;
    if (value === true) element.setAttribute(attribute, "");
    else element.setAttribute(attribute, String(value));
  }
  append(element, input.children);
  return element;
}

export const jsxs = jsx;
export const jsxDEV = jsx;
