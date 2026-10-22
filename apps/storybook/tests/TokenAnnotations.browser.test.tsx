import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test, vi } from "vitest";
import { AppDownloadPage } from "../../../packages/prototypes/pages/AppDownloadPage/AppDownloadPage";
import { Button } from "../../../packages/design-system/components/Button/Button";
import { Badge } from "../../../packages/design-system/components/Badge/Badge";
import { installTokenAnnotations, watchTokenAnnotationMode, type AnnotationAPI } from "../.storybook/token-annotations";
import { createTokenStyleMirror, readTokenDeclarations } from "../.storybook/token-annotation-styles";
import "@yami/design-system/tokens.css";

const annotationDocument = document as Document & { oai?: { annotation?: AnnotationAPI } };
const originalOai = annotationDocument.oai;
const container = document.createElement("div");
document.body.append(container);
let root = createRoot(container);
let dispose: (() => void) | undefined;
let fixture: HTMLStyleElement | undefined;

afterEach(() => {
  dispose?.(); dispose = undefined;
  flushSync(() => root.unmount());
  root = createRoot(container);
  fixture?.remove(); fixture = undefined;
  annotationDocument.oai = originalOai;
  document.documentElement.classList.remove("dark");
});

function mockAnnotations() {
  const controls = new Map<HTMLElement, Parameters<AnnotationAPI["registerControls"]>[0]>();
  const active = new Set<HTMLElement>();
  const disposeRegistration = vi.fn();
  const registerControls = vi.fn<AnnotationAPI["registerControls"]>((options) => {
    controls.set(options.targets, options);
    active.add(options.targets);
    return { dispose: () => { active.delete(options.targets); disposeRegistration(); }, update: (next) => { controls.set(next.targets, next); } };
  });
  annotationDocument.oai = { annotation: { registerControls } };
  dispose = installTokenAnnotations();
  const inspect = (target: HTMLElement) => {
    target.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
    return controls.get(target)!;
  };
  return { controls, active, registerControls, disposeRegistration, inspect };
}

test("ignores the browser's own annotation editor and its shadow descendants", () => {
  flushSync(() => root.render(<Button>Action</Button>));
  const editor = document.createElement("div");
  editor.id = "codex-browser-sidebar-comments-root";
  editor.style.color = "var(--text-primary)";
  const editorControl = document.createElement("button");
  editorControl.style.color = "var(--text-secondary)";
  editor.attachShadow({ mode: "open" }).append(editorControl);
  document.body.append(editor);
  try {
    const { inspect, registerControls } = mockAnnotations();
    inspect(container.querySelector("button")!);
    registerControls.mockClear();
    editorControl.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, composed: true }));
    editorControl.dispatchEvent(new FocusEvent("focusin", { bubbles: true, composed: true }));
    expect(registerControls).not.toHaveBeenCalled();
    expect(editor.style.getPropertyValue("--yds-annotation-color")).toBe("");
  } finally {
    editor.remove();
  }
});

test("registers the App Download deals link before native annotation selection consumes pointer events", () => {
  flushSync(() => root.render(<AppDownloadPage initialLocale="ko" />));
  const link = container.querySelector<HTMLAnchorElement>('#welcome-coupon a[href="#discount-products"]')!;
  let selected: Parameters<AnnotationAPI["registerControls"]>[0] | undefined;
  let controls: ReturnType<typeof mockAnnotations>["controls"];
  const consumeHover = (event: Event) => event.stopImmediatePropagation();
  const select = (event: Event) => {
    selected = controls.get(link);
    event.stopImmediatePropagation();
  };
  // The desktop installs these capture listeners before the page's scripts.
  document.addEventListener("pointerover", consumeHover, true);
  document.addEventListener("pointerdown", select, true);
  try {
    ({ controls } = mockAnnotations());
    link.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
    link.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(selected?.controls).toEqual(expect.arrayContaining([
      expect.objectContaining({ reference: "--button-primary" }),
      expect.objectContaining({ reference: "--text-primary-inverse" }),
      expect.objectContaining({ reference: "--radius-component-default" }),
    ]));
  } finally {
    document.removeEventListener("pointerover", consumeHover, true);
    document.removeEventListener("pointerdown", select, true);
  }
});

test("registers a stationary pointer's target before the first annotation click", () => {
  flushSync(() => root.render(<AppDownloadPage initialLocale="ko" />));
  const link = container.querySelector<HTMLAnchorElement>('#welcome-coupon a[href="#discount-products"]')!;
  const { controls } = mockAnnotations();
  link.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  expect(controls.get(link)?.controls).toEqual(expect.arrayContaining([
    expect.objectContaining({ reference: "--button-primary" }),
    expect.objectContaining({ reference: "--text-primary-inverse" }),
  ]));
});

test("discovers actual tokens on App Download, Button, and Badge without page-specific configuration", () => {
  flushSync(() => root.render(<><AppDownloadPage initialLocale="ko" /><Button>Action</Button><Badge color="blue" emphasis="secondary">Status</Badge></>));
  const badge = container.querySelector<HTMLElement>("[data-campaign-hero] span")!;
  const before = { color: getComputedStyle(badge).color, padding: getComputedStyle(badge).padding, width: badge.getBoundingClientRect().width };
  const { inspect } = mockAnnotations();
  const offer = inspect(badge);
  expect(offer.controlsMode).toBe("extend");
  expect(offer.controls).toEqual(expect.arrayContaining([
    expect.objectContaining({ label: "文字颜色 · --badge-fg-secondary-red", currentValue: "#9b000d" }),
    expect.objectContaining({ label: "背景颜色 · --badge-bg-secondary-red", currentValue: "#fbf1ef" }),
    expect.objectContaining({ reference: "--radius-button-primary" }),
    expect.objectContaining({ reference: "--font-weight-emphasize" }),
  ]));
  expect({ color: getComputedStyle(badge).color, padding: getComputedStyle(badge).padding, width: badge.getBoundingClientRect().width }).toEqual(before);
  const button = Array.from(container.querySelectorAll<HTMLElement>('[data-slot="button"]')).find((element) => element.textContent === "Action")!;
  expect(inspect(button).controls).toEqual(expect.arrayContaining([
    expect.objectContaining({ reference: "--button-primary" }),
    expect.objectContaining({ reference: "--space-500" }),
    expect.objectContaining({ reference: "--font-family-ios" }),
  ]));
  const status = Array.from(container.querySelectorAll<HTMLElement>('[data-slot="badge"]')).find((element) => element.textContent === "Status")!;
  expect(inspect(status).controls).toEqual(expect.arrayContaining([expect.objectContaining({ reference: "--badge-fg-secondary-blue" })]));
});

test("preserves CSS cascade, important declarations, inheritance, literal overrides, and responsive rules", () => {
  fixture = document.createElement("style");
  fixture.textContent = `
    .token-parent { color: var(--text-secondary); font-size: var(--font-size-body-md); padding: var(--space-400); }
    .token-child { background: var(--surface-primary); padding: var(--space-100); border-radius: var(--radius-button-primary); }
    .token-child.override { background: #ffffff; padding-inline: 2px; border-radius: 0; }
    .token-child.important { color: var(--text-error) !important; }
    .token-child { color: var(--text-primary); }
    @media (min-width: 1px) { .token-child { margin: var(--space-200); } }
    @media (min-width: 99999px) { .token-child { margin: var(--space-500); } }
  `;
  document.head.append(fixture);
  flushSync(() => root.render(<div className="token-parent"><span className="token-child override important" style={{ fontSize: "var(--font-size-body-xl)" }}>Sample</span><span className="inheriting-child">Inherited</span></div>));
  const mirror = createTokenStyleMirror();
  dispose = () => mirror.dispose();
  const target = container.querySelector<HTMLElement>(".token-child")!;
  mirror.syncInline(target);
  const declarations = readTokenDeclarations(target);
  expect(declarations).toEqual(expect.arrayContaining([
    expect.objectContaining({ property: "color", tokens: ["--text-error"] }),
    expect.objectContaining({ property: "font-size", tokens: ["--font-size-body-xl"] }),
    expect.objectContaining({ property: "margin", tokens: ["--space-200"] }),
    expect.objectContaining({ property: "padding", tokens: ["--space-100"] }),
  ]));
  expect(declarations.some(({ property }) => property === "background" || property === "border-radius")).toBe(false);
  const inherited = readTokenDeclarations(container.querySelector<HTMLElement>(".inheriting-child")!);
  expect(inherited).toEqual(expect.arrayContaining([expect.objectContaining({ property: "color", tokens: ["--text-secondary"] })]));
  expect(inherited.some(({ property }) => property === "padding")).toBe(false);
});

test("refreshes theme and dynamic elements, and keeps registration counts within the native limit", () => {
  flushSync(() => root.render(<div>{Array.from({ length: 80 }, (_, i) => <Badge key={i} color="red" emphasis="secondary">{i}</Badge>)}</div>));
  const { inspect, active, disposeRegistration } = mockAnnotations();
  const targets = container.querySelectorAll<HTMLElement>('[data-slot="badge"]');
  expect(inspect(targets[0]).controls.find(({ reference }) => reference === "--badge-fg-secondary-red")!.currentValue).toBe("#9b000d");
  document.documentElement.classList.add("dark");
  document.dispatchEvent(new Event("oaiannotationmodechange"));
  expect(inspect(targets[0]).controls.find(({ reference }) => reference === "--badge-fg-secondary-red")!.currentValue).not.toBe("#9b000d");
  for (const target of targets) {
    expect(inspect(target).controls.length).toBeLessThanOrEqual(12);
    expect(active.size).toBeLessThanOrEqual(64);
  }
  expect(disposeRegistration).toHaveBeenCalled();
});

test("discovers logical spacing and border tokens used by horizontal LTR YDS layouts", () => {
  flushSync(() => root.render(<div style={{ paddingInlineStart: "var(--space-050)", paddingInlineEnd: "var(--space-100)", borderInline: "var(--stroke-default) solid var(--border-default)" }}>Logical layout</div>));
  const { inspect } = mockAnnotations();
  const target = container.firstElementChild as HTMLElement;
  expect(inspect(target).controls).toEqual(expect.arrayContaining([
    expect.objectContaining({ reference: "--space-050" }),
    expect.objectContaining({ reference: "--space-100" }),
    expect.objectContaining({ reference: "border-inline" }),
  ]));
});

test("registers an icon button when the pointer lands on its SVG path", () => {
  flushSync(() => root.render(<Button form="icon" aria-label="Favorite"><svg><path d="M0 0h10v10H0z" /></svg></Button>));
  const { controls } = mockAnnotations();
  container.querySelector("path")!.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
  const button = container.querySelector("button")!;
  expect(controls.get(button)!.controls).toEqual(expect.arrayContaining([expect.objectContaining({ reference: "--button-primary" })]));
});

test("previews only the selected element and restores its token binding on comparison, reset, and cleanup", () => {
  flushSync(() => root.render(<><Badge color="red" emphasis="secondary">First</Badge><Badge color="red" emphasis="secondary">Second</Badge></>));
  const { inspect, disposeRegistration } = mockAnnotations();
  const [target, other] = container.querySelectorAll<HTMLElement>('[data-slot="badge"]');
  inspect(target);
  const change = (action: string, value = "#123456") => target.dispatchEvent(new CustomEvent("oaiannotationcontrolchange", {
    bubbles: true, detail: { callback: "token-color", value, action },
  }));
  change("preview");
  expect(getComputedStyle(target).color).toBe("rgb(18, 52, 86)");
  expect(getComputedStyle(other).color).toBe("rgb(155, 0, 13)");
  change("preview-original");
  expect(target.style.color).toBe("");
  change("preview");
  change("reset");
  expect(target.style.color).toBe("");
  change("preview");
  dispose!(); dispose = undefined;
  expect(target.style.color).toBe("");
  expect(disposeRegistration).toHaveBeenCalled();
  change("preview");
  expect(target.style.color).toBe("");
  expect(document.querySelector("style[data-yds-token-annotations]")).toBeNull();
});

test("adds no styles or listeners in browsers without the annotation API", () => {
  annotationDocument.oai = undefined;
  const listener = vi.spyOn(document, "addEventListener");
  dispose = installTokenAnnotations();
  expect(listener).not.toHaveBeenCalled();
  expect(document.querySelector("style[data-yds-token-annotations]")).toBeNull();
  listener.mockRestore();
});

test("restores an inline background shorthand after a color preview", () => {
  flushSync(() => root.render(<div style={{ background: "var(--brand-tertiary)" }}>Inline background</div>));
  const target = container.firstElementChild as HTMLElement;
  const { inspect } = mockAnnotations();
  inspect(target);
  const change = (action: string) => target.dispatchEvent(new CustomEvent("oaiannotationcontrolchange", {
    bubbles: true, detail: { callback: "token-background-color", value: "#123456", action },
  }));
  change("preview");
  expect(getComputedStyle(target).backgroundColor).toBe("rgb(18, 52, 86)");
  change("reset");
  expect(target.style.background).toBe("var(--brand-tertiary)");
  expect(getComputedStyle(target).backgroundColor).toBe("rgb(251, 241, 239)");
});

test("previews important colors and restores their original inline priority", () => {
  fixture = document.createElement("style");
  fixture.textContent = ".important-preview { color: var(--text-error) !important; }";
  document.head.append(fixture);
  flushSync(() => root.render(<div className="important-preview">Important color</div>));
  const target = container.firstElementChild as HTMLElement;
  target.style.setProperty("color", "var(--text-secondary)", "important");
  const { inspect } = mockAnnotations();
  inspect(target);
  const change = (action: string) => target.dispatchEvent(new CustomEvent("oaiannotationcontrolchange", {
    bubbles: true, detail: { callback: "token-color", value: "#123456", action },
  }));
  change("preview");
  expect(getComputedStyle(target).color).toBe("rgb(18, 52, 86)");
  change("reset");
  expect(target.style.color).toBe("var(--text-secondary)");
  expect(target.style.getPropertyPriority("color")).toBe("important");
});

test("defers all style parsing and control registration until annotation mode is entered", () => {
  let active = false;
  const registerControls = vi.fn<AnnotationAPI["registerControls"]>(() => ({ dispose() {}, update() {} }));
  annotationDocument.oai = { annotation: { registerControls, isActive: () => active } };
  dispose = watchTokenAnnotationMode();
  expect(document.querySelector("style[data-yds-token-annotations]")).toBeNull();
  expect(registerControls).not.toHaveBeenCalled();
  active = true;
  document.dispatchEvent(new Event("oaiannotationmodechange"));
  expect(document.querySelector("style[data-yds-token-annotations]")).not.toBeNull();
  active = false;
  flushSync(() => root.render(<Badge color="red">Outside annotations</Badge>));
  container.querySelector("span")!.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
  expect(registerControls).not.toHaveBeenCalled();
});

test("keeps App Download computed styles and element geometry unchanged when annotations initialize", async () => {
  flushSync(() => root.render(<AppDownloadPage initialLocale="ko" />));
  await document.fonts.ready;
  const elements = Array.from(container.querySelectorAll("*"));
  const properties = ["color", "background-color", "font-family", "font-size", "font-weight", "line-height", "padding", "margin", "gap", "border-radius", "width", "height", "display", "position"];
  const snapshot = () => elements.map((element) => {
    const style = getComputedStyle(element);
    const bounds = element.getBoundingClientRect();
    return properties.map((property) => style.getPropertyValue(property)).concat([bounds.x, bounds.y, bounds.width, bounds.height].map(String));
  });
  const before = snapshot();
  const start = performance.now();
  const { inspect } = mockAnnotations();
  const initialized = performance.now();
  inspect(container.querySelector<HTMLElement>("[data-campaign-hero] span")!);
  const inspected = performance.now();
  expect(snapshot()).toEqual(before);
  console.info(`Token annotation check: ${elements.length} elements unchanged; initialization ${(initialized - start).toFixed(1)} ms; first inspection ${(inspected - initialized).toFixed(1)} ms`);
});
