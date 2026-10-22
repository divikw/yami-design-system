const inherited = new Set(["color", "font-family", "font-size", "font-weight", "line-height", "letter-spacing", "text-align", "fill", "stroke"]);
const sides = ["top", "right", "bottom", "left"];
const borderProperties = sides.flatMap((side) => ["color", "width", "style"].map((part) => `border-${side}-${part}`));

export const tokenProperties = [
  "color", "background-color", "font-family", "font-size", "font-weight", "line-height", "letter-spacing", "text-align",
  ...sides.map((side) => `padding-${side}`), ...sides.map((side) => `margin-${side}`),
  "row-gap", "column-gap", ...["top-left", "top-right", "bottom-right", "bottom-left"].map((corner) => `border-${corner}-radius`),
  ...borderProperties, "box-shadow", "outline-color", "outline-width", "outline-style", "outline-offset",
  "width", "min-width", "max-width", "height", "min-height", "max-height", "opacity", "fill", "stroke", "stroke-width",
];
const shorthands: Record<string, string[]> = {
  background: ["background-color"],
  font: ["font-family", "font-size", "font-weight", "line-height"],
  padding: sides.map((side) => `padding-${side}`),
  margin: sides.map((side) => `margin-${side}`),
  gap: ["row-gap", "column-gap"],
  "border-radius": tokenProperties.filter((property) => property.endsWith("-radius")),
  border: borderProperties,
  outline: ["outline-color", "outline-width", "outline-style"],
};
for (const side of sides) shorthands[`border-${side}`] = borderProperties.filter((property) => property.startsWith(`border-${side}-`));
for (const part of ["color", "width", "style"]) shorthands[`border-${part}`] = sides.map((side) => `border-${side}-${part}`);
for (const property of ["padding", "margin"]) {
  shorthands[`${property}-inline`] = ["left", "right"].map((side) => `${property}-${side}`);
  shorthands[`${property}-block`] = ["top", "bottom"].map((side) => `${property}-${side}`);
  for (const [logical, physical] of [["inline-start", "left"], ["inline-end", "right"], ["block-start", "top"], ["block-end", "bottom"]]) {
    shorthands[`${property}-${logical}`] = [`${property}-${physical}`];
  }
}
// YDS's maintained locales use horizontal LTR layouts.
for (const [axis, physicalSides] of [["inline", ["left", "right"]], ["block", ["top", "bottom"]]] as const) {
  shorthands[`border-${axis}`] = physicalSides.flatMap((side) => shorthands[`border-${side}`]);
  for (const [index, edge] of ["start", "end"].entries()) shorthands[`border-${axis}-${edge}`] = shorthands[`border-${physicalSides[index]}`];
}
for (const property of ["width", "min-width", "max-width"]) shorthands[property.replace("width", "inline-size")] = [property];
for (const property of ["height", "min-height", "max-height"]) shorthands[property.replace("height", "block-size")] = [property];

export const markerName = (property: string) => `--yds-annotation-${property}`;

// CSSStyleDeclaration iteration expands var()-based shorthands into empty
// longhands. Read its serialized declarations to retain the original reference.
function authoredDeclarations(style: CSSStyleDeclaration) {
  const declarations: string[] = [];
  let start = 0;
  let depth = 0;
  let quote = "";
  const text = style.cssText;
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (character === "\\") { index++; continue; }
    if (quote) { if (character === quote) quote = ""; continue; }
    if (character === '"' || character === "'") quote = character;
    else if (character === "(") depth++;
    else if (character === ")") depth--;
    else if (character === ";" && depth === 0) { declarations.push(text.slice(start, index)); start = index + 1; }
  }
  declarations.push(text.slice(start));
  return declarations.filter((declaration) => declaration.includes(":")).map((declaration) => {
    const separator = declaration.indexOf(":");
    const raw = declaration.slice(separator + 1).trim();
    return { property: declaration.slice(0, separator).trim(), value: raw.replace(/\s*!important$/, ""), priority: /!important$/.test(raw) ? "important" : "" };
  });
}

// Preserve authored var() expressions in CSS strings. The browser applies the
// same selectors, importance, media/container queries, and cascade to these markers.
function declarations(style: CSSStyleDeclaration) {
  const markers = new Map<string, { value: string; priority: string }>();
  for (const { property, value, priority } of authoredDeclarations(style)) {
    const affected = shorthands[property] ?? (tokenProperties.includes(property) ? [property] : []);
    const keyword = /^(inherit|initial|unset|revert|revert-layer)$/.test(value) ? value : null;
    for (const target of affected) {
      if (markers.get(target)?.priority === "important" && priority !== "important") continue;
      markers.set(target, {
        value: keyword ?? JSON.stringify(value.includes("var(") ? `${property}: ${value}` : ""),
        priority,
      });
    }
  }
  return markers;
}

function mirrorRules(rules: CSSRuleList): string {
  return Array.from(rules, (rule) => {
    if (rule instanceof CSSStyleRule) {
      const own = Array.from(declarations(rule.style), ([property, { value, priority }]) =>
        `${markerName(property)}:${value}${priority ? " !important" : ""};`).join("");
      const children = mirrorRules(rule.cssRules);
      return own || children ? `${rule.selectorText}{${own}${children}}` : "";
    }
    if (rule instanceof CSSKeyframesRule) return "";
    if (rule instanceof CSSImportRule) {
      try {
        const content = rule.styleSheet ? mirrorRules(rule.styleSheet.cssRules) : "";
        return rule.media.mediaText ? `@media ${rule.media.mediaText}{${content}}` : content;
      } catch { return ""; } // Cross-origin sheets cannot expose authored declarations.
    }
    if ("cssRules" in rule) {
      const content = mirrorRules((rule as CSSGroupingRule).cssRules);
      return content ? `${rule.cssText.slice(0, rule.cssText.indexOf("{"))}{${content}}` : "";
    }
    return "";
  }).join("\n");
}

export function createTokenStyleMirror() {
  const mirror = document.createElement("style");
  mirror.dataset.ydsTokenAnnotations = "";
  const definitions = tokenProperties.map((property) =>
    `@property ${markerName(property)}{syntax:"*";inherits:${inherited.has(property)};initial-value:"";}`).join("\n");
  const touched = new Set<HTMLElement>();
  const refresh = () => {
    mirror.textContent = definitions + Array.from(document.styleSheets, (sheet) => {
      if (sheet.ownerNode === mirror || sheet.disabled) return "";
      try {
        const rules = mirrorRules(sheet.cssRules);
        return sheet.media.mediaText ? `@media ${sheet.media.mediaText}{${rules}}` : rules;
      } catch { return ""; }
    }).join("\n");
  };
  refresh();
  document.head.append(mirror);

  return {
    mirror,
    refresh,
    syncInline(target: HTMLElement) {
      const markers = declarations(target.style);
      // Only our private markers are removed; ordinary inline styles stay intact.
      for (const property of tokenProperties) target.style.removeProperty(markerName(property));
      if (markers.size) touched.add(target);
      for (const [property, { value, priority }] of markers) target.style.setProperty(markerName(property), value, priority);
    },
    dispose() {
      mirror.remove();
      for (const target of touched) for (const property of tokenProperties) target.style.removeProperty(markerName(property));
    },
  };
}

export function readTokenDeclarations(target: HTMLElement) {
  const style = getComputedStyle(target);
  const sources = new Map<string, { property: string; expression: string; tokens: string[] }>();
  for (const property of tokenProperties) {
    const encoded = style.getPropertyValue(markerName(property)).trim();
    if (!encoded || encoded === '""') continue;
    const source: string = JSON.parse(encoded);
    const separator = source.indexOf(": ");
    const expression = source.slice(separator + 2);
    const tokens = [...new Set(Array.from(expression.matchAll(/var\(\s*(--[\w-]+)/g), (match) => match[1]))];
    if (tokens.length) sources.set(source, { property: source.slice(0, separator), expression, tokens });
  }
  return [...sources.values()];
}
