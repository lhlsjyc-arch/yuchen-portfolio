type TransformState = {
  translateX?: string;
  translateY?: string;
  rotate?: string;
  skewX?: string;
  skewY?: string;
  scaleX?: string;
  scaleY?: string;
};

type GradientState = {
  direction?: string;
  from?: string;
  fromStop?: string;
  via?: string;
  viaStop?: string;
  to?: string;
  toStop?: string;
};

const direct: Record<string, [keyof CSSStyleDeclaration, string]> = {
  absolute: ["position", "absolute"],
  relative: ["position", "relative"],
  fixed: ["position", "fixed"],
  sticky: ["position", "sticky"],
  block: ["display", "block"],
  inline: ["display", "inline"],
  "inline-block": ["display", "inline-block"],
  flex: ["display", "flex"],
  grid: ["display", "grid"],
  "inline-grid": ["display", "inline-grid"],
  contents: ["display", "contents"],
  hidden: ["display", "none"],
  "flex-col": ["flexDirection", "column"],
  "flex-row": ["flexDirection", "row"],
  "flex-wrap": ["flexWrap", "wrap"],
  "flex-none": ["flex", "none"],
  "items-start": ["alignItems", "flex-start"],
  "items-center": ["alignItems", "center"],
  "items-end": ["alignItems", "flex-end"],
  "items-stretch": ["alignItems", "stretch"],
  "justify-start": ["justifyContent", "flex-start"],
  "justify-center": ["justifyContent", "center"],
  "justify-end": ["justifyContent", "flex-end"],
  "justify-between": ["justifyContent", "space-between"],
  "justify-around": ["justifyContent", "space-around"],
  "content-start": ["alignContent", "flex-start"],
  "content-center": ["alignContent", "center"],
  "content-stretch": ["alignContent", "stretch"],
  "self-start": ["alignSelf", "flex-start"],
  "self-center": ["alignSelf", "center"],
  "self-end": ["alignSelf", "flex-end"],
  "shrink-0": ["flexShrink", "0"],
  grow: ["flexGrow", "1"],
  "grow-0": ["flexGrow", "0"],
  "overflow-hidden": ["overflow", "hidden"],
  "overflow-clip": ["overflow", "hidden"],
  "overflow-visible": ["overflow", "visible"],
  "overflow-x-hidden": ["overflowX", "hidden"],
  "overflow-y-hidden": ["overflowY", "hidden"],
  "pointer-events-none": ["pointerEvents", "none"],
  "pointer-events-auto": ["pointerEvents", "auto"],
  "select-none": ["userSelect", "none"],
  isolate: ["isolation", "isolate"],
  "object-cover": ["objectFit", "cover"],
  "object-contain": ["objectFit", "contain"],
  "object-fill": ["objectFit", "fill"],
  "object-center": ["objectPosition", "center"],
  "whitespace-nowrap": ["whiteSpace", "nowrap"],
  "whitespace-pre": ["whiteSpace", "pre"],
  "whitespace-pre-wrap": ["whiteSpace", "pre-wrap"],
  "text-left": ["textAlign", "left"],
  "text-center": ["textAlign", "center"],
  "text-right": ["textAlign", "right"],
  "text-ellipsis": ["textOverflow", "ellipsis"],
  uppercase: ["textTransform", "uppercase"],
  capitalize: ["textTransform", "capitalize"],
  italic: ["fontStyle", "italic"],
  "not-italic": ["fontStyle", "normal"],
  "font-normal": ["fontWeight", "400"],
  "font-medium": ["fontWeight", "500"],
  "font-semibold": ["fontWeight", "600"],
  "font-bold": ["fontWeight", "700"],
  "font-light": ["fontWeight", "300"],
  "leading-none": ["lineHeight", "1"],
  "bg-clip-text": ["backgroundClip", "text"],
  "border-solid": ["borderStyle", "solid"],
  "border-dashed": ["borderStyle", "dashed"],
  "cursor-pointer": ["cursor", "pointer"],
  "mix-blend-multiply": ["mixBlendMode", "multiply"],
  "mix-blend-screen": ["mixBlendMode", "screen"],
  "mask-alpha": ["maskMode", "alpha"],
  "mask-no-repeat": ["maskRepeat", "no-repeat"],
  "mask-intersect": ["maskComposite", "intersect"],
  "max-w-none": ["maxWidth", "none"],
  "w-full": ["width", "100%"],
  "h-full": ["height", "100%"],
  "min-w-full": ["minWidth", "100%"],
  "min-h-full": ["minHeight", "100%"],
  "w-px": ["width", "1px"],
  "h-px": ["height", "1px"],
  "min-w-px": ["minWidth", "1px"],
  "min-h-px": ["minHeight", "1px"],
  "top-0": ["top", "0"],
  "right-0": ["right", "0"],
  "bottom-0": ["bottom", "0"],
  "left-0": ["left", "0"],
  "inset-0": ["inset", "0"],
  "left-1/2": ["left", "50%"],
  "right-1/2": ["right", "50%"],
  "top-1/2": ["top", "50%"],
  "bottom-1/2": ["bottom", "50%"],
  "size-full": ["width", "100%"],
  "rounded-full": ["borderRadius", "9999px"],
  "text-white": ["color", "#fff"],
  "text-black": ["color", "#000"],
  "bg-white": ["backgroundColor", "#fff"],
  "bg-black": ["backgroundColor", "#000"],
};

function fallbackFromVar(value: string) {
  let result = value.trim();
  const prefix = result.match(/^(?:color|length|family-name):(.+)$/);
  if (prefix) result = prefix[1];
  if (result.startsWith("var(")) {
    const comma = result.indexOf(",");
    if (comma >= 0 && result.endsWith(")")) result = result.slice(comma + 1, -1).trim();
  }
  return result.replace(/^['"]|['"]$/g, "");
}

function cssValue(value: string) {
  return fallbackFromVar(value)
    .replace(/_/g, " ")
    .replace(/calc\(([^)]*)\)/g, (_whole, inner) => `calc(${String(inner).replace(/([%\w)])([+-])/g, "$1 $2 ")})`);
}

function arbitrary(token: string, prefix: string) {
  const marker = `${prefix}-[`;
  return token.startsWith(marker) && token.endsWith("]") ? token.slice(marker.length, -1) : null;
}

function namedColor(value: string) {
  const colors: Record<string, string> = {
    white: "#fff",
    black: "#000",
    transparent: "transparent",
  };
  if (colors[value]) return colors[value];
  const bracketed = value.match(/^\[(.*)\]$/)?.[1];
  if (bracketed) return cssValue(bracketed);
  return value.startsWith("#") ? value : null;
}

function setTransform(token: string, state: TransformState) {
  const arbitraryRules: Array<[RegExp, keyof TransformState, (value: string) => string]> = [
    [/^-?translate-x-\[(.+)\]$/, "translateX", cssValue],
    [/^-?translate-y-\[(.+)\]$/, "translateY", cssValue],
    [/^-?rotate-\[(.+)\]$/, "rotate", cssValue],
    [/^-?skew-x-\[(.+)\]$/, "skewX", cssValue],
    [/^-?skew-y-\[(.+)\]$/, "skewY", cssValue],
    [/^-?scale-x-\[(.+)\]$/, "scaleX", cssValue],
    [/^-?scale-y-\[(.+)\]$/, "scaleY", cssValue],
  ];
  for (const [pattern, key, convert] of arbitraryRules) {
    const match = token.match(pattern);
    if (!match) continue;
    let value = convert(match[1]);
    if (token.startsWith("-") && !value.startsWith("-")) value = `-${value}`;
    state[key] = value;
    return true;
  }
  const translate = token.match(/^(-)?translate-([xy])-(1\/2|full)$/);
  if (translate) {
    const value = `${translate[1] ? "-" : ""}${translate[3] === "full" ? 100 : 50}%`;
    state[translate[2] === "x" ? "translateX" : "translateY"] = value;
    return true;
  }
  const rotate = token.match(/^(-)?rotate-(\d+(?:\.\d+)?)$/);
  if (rotate) {
    state.rotate = `${rotate[1] ? "-" : ""}${rotate[2]}deg`;
    return true;
  }
  const scale = token.match(/^(-)?scale-([xy])-(\d+)$/);
  if (scale) {
    state[scale[2] === "x" ? "scaleX" : "scaleY"] = `${scale[1] ? "-" : ""}${Number(scale[3]) / 100}`;
    return true;
  }
  return false;
}

function setGradient(token: string, state: GradientState) {
  const directions: Record<string, string> = {
    "bg-gradient-to-r": "to right",
    "bg-gradient-to-l": "to left",
    "bg-gradient-to-b": "to bottom",
    "bg-gradient-to-t": "to top",
    "bg-gradient-to-br": "to bottom right",
    "bg-gradient-to-tr": "to top right",
  };
  if (directions[token]) {
    state.direction = directions[token];
    return true;
  }
  for (const key of ["from", "via", "to"] as const) {
    if (!token.startsWith(`${key}-`)) continue;
    const raw = token.slice(key.length + 1);
    const stop = raw.match(/^\[(\d+(?:\.\d+)?%)\]$/)?.[1] || (raw === "1/4" ? "25%" : raw === "1/2" ? "50%" : null);
    if (stop) state[`${key}Stop` as keyof GradientState] = stop;
    else {
      const color = namedColor(raw);
      if (color) state[key] = color;
    }
    return true;
  }
  return false;
}

function applyFont(element: HTMLElement, token: string) {
  const raw = arbitrary(token, "font");
  if (!raw) return false;
  const value = cssValue(raw);
  if (value.startsWith("var(") || /^(\d|normal|bold)/.test(value)) {
    element.style.fontWeight = fallbackFromVar(value);
    return true;
  }
  const [familyName, styleName = "Regular"] = value.split(":");
  const normalized = familyName.replace(/_/g, " ");
  const family = /Lora|Abhaya|Georgia|Segoe Serif/i.test(normalized)
    ? `"${normalized}", Georgia, "Times New Roman", serif`
    : /SF Pro/i.test(normalized)
      ? `"${normalized}", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
      : /Segoe/i.test(normalized)
        ? `"Segoe UI", Arial, sans-serif`
        : `"${normalized}", Arial, sans-serif`;
  element.style.fontFamily = family;
  if (/italic/i.test(styleName)) element.style.fontStyle = "italic";
  if (/black/i.test(styleName)) element.style.fontWeight = "900";
  else if (/heavy|extra bold/i.test(styleName)) element.style.fontWeight = "800";
  else if (/bold/i.test(styleName)) element.style.fontWeight = "700";
  else if (/semi/i.test(styleName)) element.style.fontWeight = "600";
  else if (/medium/i.test(styleName)) element.style.fontWeight = "500";
  else if (/light/i.test(styleName)) element.style.fontWeight = "300";
  else element.style.fontWeight = "400";
  return true;
}

function applyArbitrary(element: HTMLElement, token: string) {
  const rules: Array<[string, keyof CSSStyleDeclaration]> = [
    ["h", "height"], ["w", "width"], ["min-h", "minHeight"], ["min-w", "minWidth"],
    ["max-h", "maxHeight"], ["max-w", "maxWidth"], ["left", "left"], ["right", "right"],
    ["top", "top"], ["bottom", "bottom"], ["inset", "inset"], ["gap", "gap"],
    ["p", "padding"], ["px", "paddingInline"], ["py", "paddingBlock"], ["pt", "paddingTop"],
    ["pr", "paddingRight"], ["pb", "paddingBottom"], ["pl", "paddingLeft"], ["m", "margin"],
    ["mx", "marginInline"], ["my", "marginBlock"], ["mt", "marginTop"], ["mr", "marginRight"],
    ["mb", "marginBottom"], ["ml", "marginLeft"], ["leading", "lineHeight"], ["tracking", "letterSpacing"],
    ["z", "zIndex"], ["mask-position", "maskPosition"], ["mask-size", "maskSize"],
    ["bg-size", "backgroundSize"], ["text-shadow", "textShadow"], ["aspect", "aspectRatio"],
  ];
  for (const [prefix, property] of rules) {
    const value = arbitrary(token, prefix);
    if (value === null) continue;
    (element.style as unknown as Record<string, string>)[property] = cssValue(value);
    return true;
  }
  const size = arbitrary(token, "size");
  if (size !== null) {
    element.style.width = element.style.height = cssValue(size);
    return true;
  }
  const insetX = arbitrary(token, "inset-x");
  if (insetX !== null) {
    element.style.left = element.style.right = cssValue(insetX);
    return true;
  }
  const insetY = arbitrary(token, "inset-y");
  if (insetY !== null) {
    element.style.top = element.style.bottom = cssValue(insetY);
    return true;
  }
  const radiusRules: Array<[string, keyof CSSStyleDeclaration]> = [
    ["rounded", "borderRadius"], ["rounded-tl", "borderTopLeftRadius"], ["rounded-tr", "borderTopRightRadius"],
    ["rounded-bl", "borderBottomLeftRadius"], ["rounded-br", "borderBottomRightRadius"],
  ];
  for (const [prefix, property] of radiusRules) {
    const value = arbitrary(token, prefix);
    if (value === null) continue;
    (element.style as unknown as Record<string, string>)[property] = cssValue(value);
    return true;
  }
  const background = arbitrary(token, "bg");
  if (background !== null) {
    element.style.backgroundColor = cssValue(background);
    return true;
  }
  const text = arbitrary(token, "text");
  if (text !== null) {
    const value = cssValue(text);
    if (/^-?[\d.]+(?:px|%|rem|em|cqw|cqh)$/.test(value) || value.startsWith("calc(")) element.style.fontSize = value;
    else element.style.color = value;
    return true;
  }
  const border = arbitrary(token, "border");
  if (border !== null) {
    const value = cssValue(border);
    if (/^-?[\d.]+(?:px|rem|em)$/.test(value)) element.style.borderWidth = value;
    else element.style.borderColor = value;
    if (!element.style.borderStyle) element.style.borderStyle = "solid";
    return true;
  }
  const shadow = arbitrary(token, "shadow");
  if (shadow !== null) {
    element.style.boxShadow = cssValue(shadow);
    return true;
  }
  const dropShadow = arbitrary(token, "drop-shadow");
  if (dropShadow !== null) {
    element.style.filter = `drop-shadow(${cssValue(dropShadow)})`;
    return true;
  }
  const blur = arbitrary(token, "blur");
  if (blur !== null) {
    element.style.filter = `blur(${cssValue(blur)})`;
    return true;
  }
  const backdropBlur = arbitrary(token, "backdrop-blur");
  if (backdropBlur !== null) {
    element.style.backdropFilter = `blur(${cssValue(backdropBlur)})`;
    (element.style as unknown as Record<string, string>).webkitBackdropFilter = `blur(${cssValue(backdropBlur)})`;
    return true;
  }
  const gridColumns = arbitrary(token, "grid-cols");
  if (gridColumns !== null) {
    element.style.gridTemplateColumns = cssValue(gridColumns);
    return true;
  }
  const gridRows = arbitrary(token, "grid-rows");
  if (gridRows !== null) {
    element.style.gridTemplateRows = cssValue(gridRows);
    return true;
  }
  const flex = arbitrary(token, "flex");
  if (flex !== null) {
    element.style.flex = cssValue(flex);
    return true;
  }
  return false;
}

function applyOne(element: HTMLElement, token: string, transform: TransformState, gradient: GradientState) {
  const negative = token.startsWith("-");
  const plain = negative ? token.slice(1) : token;
  const directRule = direct[token];
  if (directRule) {
    (element.style as unknown as Record<string, string>)[directRule[0]] = directRule[1];
    if (token === "size-full") element.style.height = "100%";
    return;
  }
  if (setTransform(token, transform) || setGradient(token, gradient) || applyFont(element, token) || applyArbitrary(element, token)) return;

  const positionFraction = plain.match(/^(left|right|top|bottom)-(\d+)\/(\d+)$/);
  if (positionFraction) {
    const value = `${negative ? "-" : ""}${(Number(positionFraction[2]) / Number(positionFraction[3])) * 100}%`;
    (element.style as unknown as Record<string, string>)[positionFraction[1]] = value;
    return;
  }
  const opacity = plain.match(/^opacity-(\d+)$/);
  if (opacity) {
    element.style.opacity = String(Number(opacity[1]) / 100);
    return;
  }
  const borderWidth = plain.match(/^border(?:-([trbl]))?-(\d+)$/);
  if (borderWidth) {
    const key = borderWidth[1] ? `border${({ t: "Top", r: "Right", b: "Bottom", l: "Left" } as Record<string, string>)[borderWidth[1]]}Width` : "borderWidth";
    (element.style as unknown as Record<string, string>)[key] = `${borderWidth[2]}px`;
    if (!element.style.borderStyle) element.style.borderStyle = "solid";
    return;
  }
  if (plain === "border") {
    element.style.border = "1px solid";
    return;
  }
  const colorClass = plain.match(/^(bg|text|border)-(.+)$/);
  if (colorClass) {
    const color = namedColor(colorClass[2]);
    if (!color) return;
    if (colorClass[1] === "bg") element.style.backgroundColor = color;
    else if (colorClass[1] === "text") element.style.color = color;
    else {
      element.style.borderColor = color;
      if (!element.style.borderStyle) element.style.borderStyle = "solid";
    }
    return;
  }
  const namedSize = plain.match(/^(w|h|size)-(0|px)$/);
  if (namedSize) {
    const value = namedSize[2] === "px" ? "1px" : "0";
    if (namedSize[1] !== "h") element.style.width = value;
    if (namedSize[1] !== "w") element.style.height = value;
    return;
  }
  const namedRadius = plain.match(/^rounded(?:-([trbl]{1,2}))?$/);
  if (namedRadius) element.style.borderRadius = "4px";
}

export function applyFigmaUtilities(root: ParentNode) {
  const elements = root instanceof HTMLElement ? [root, ...root.querySelectorAll<HTMLElement>("[class]")] : [...root.querySelectorAll<HTMLElement>("[class]")];
  for (const element of elements) {
    const transform: TransformState = {};
    const gradient: GradientState = {};
    for (const token of [...element.classList]) applyOne(element, token, transform, gradient);

    const transforms = [
      transform.translateX && `translateX(${transform.translateX})`,
      transform.translateY && `translateY(${transform.translateY})`,
      transform.rotate && `rotate(${transform.rotate})`,
      transform.skewX && `skewX(${transform.skewX})`,
      transform.skewY && `skewY(${transform.skewY})`,
      transform.scaleX && `scaleX(${transform.scaleX})`,
      transform.scaleY && `scaleY(${transform.scaleY})`,
    ].filter(Boolean);
    if (transforms.length) element.style.transform = `${element.style.transform || ""} ${transforms.join(" ")}`.trim();

    if (gradient.direction) {
      const stops = [
        `${gradient.from || "transparent"}${gradient.fromStop ? ` ${gradient.fromStop}` : ""}`,
        gradient.via && `${gradient.via}${gradient.viaStop ? ` ${gradient.viaStop}` : ""}`,
        `${gradient.to || "transparent"}${gradient.toStop ? ` ${gradient.toStop}` : ""}`,
      ].filter(Boolean);
      element.style.backgroundImage = `linear-gradient(${gradient.direction}, ${stops.join(", ")})`;
    }
  }
}
