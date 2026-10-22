import { useEffect } from "react";
import { createTokenStyleMirror, readTokenDeclarations } from "./token-annotation-styles";

type TokenControl = {
  type: "color" | "select";
  label: string;
  callback: string;
  reference: string;
  currentValue: string;
  options?: { label: string; value: string }[];
};
type ControlOptions = { targets: HTMLElement; controlsHeading: string; controlsMode: "extend"; controls: TokenControl[] };
export type AnnotationAPI = {
  registerControls(options: ControlOptions): { dispose(): void; update(options: ControlOptions): void };
  isActive?(): boolean;
};
const labels: Record<string, string> = {
  color: "文字颜色", background: "背景颜色", "background-color": "背景颜色", "font-family": "字体", "font-size": "字号",
  "font-weight": "字重", "line-height": "行高", "letter-spacing": "字距", padding: "内边距", margin: "外边距", gap: "间距",
  "border-radius": "圆角", border: "边框", "box-shadow": "阴影", width: "宽度", height: "高度", opacity: "透明度",
};
const colorProperties = new Set(["color", "background-color", "fill", "stroke", "outline-color"]);
const shorten = (text: string) => text.length > 80 ? `${text.slice(0, 79)}…` : text;

export function installTokenAnnotations() {
  const annotation = (document as Document & { oai?: { annotation?: AnnotationAPI } }).oai?.annotation;
  if (typeof annotation?.registerControls !== "function") return () => {};

  const styles = createTokenStyleMirror();
  const registrations = new Map<HTMLElement, ReturnType<AnnotationAPI["registerControls"]>>();
  const previews = new Map<HTMLElement, Map<string, { property: string; value: string; priority: string }>>();
  let lastTarget: EventTarget | null = null;
  let dirty = false;

  const restore = (target: HTMLElement, property: string) => {
    const original = previews.get(target)?.get(property);
    if (!original) return;
    if (original.value) target.style.setProperty(original.property, original.value, original.priority);
    else target.style.removeProperty(property);
  };
  const inspect = (event: Event) => {
    if (annotation.isActive?.() === false) return;
    let hovered = event.target instanceof Element ? event.target : null;
    while (hovered && !(hovered instanceof HTMLElement)) hovered = hovered.parentElement;
    // The native editor lives in the page, but its own controls cannot be registered.
    if (hovered?.closest("#codex-browser-sidebar-comments-root")) return;
    if (!(hovered instanceof HTMLElement) || (hovered === lastTarget && !dirty)) return;
    lastTarget = hovered;
    if (dirty) { styles.refresh(); dirty = false; }
    const ancestry: HTMLElement[] = [];
    for (let target: HTMLElement | null = hovered; target; target = target.parentElement) ancestry.unshift(target);
    for (const target of ancestry) if (!previews.has(target)) styles.syncInline(target);
    for (const target of ancestry.reverse()) {
      const declarations = readTokenDeclarations(target);
      const computed = getComputedStyle(target);
      const controls: TokenControl[] = declarations.slice(0, 12).map(({ property, expression, tokens }) => {
        const colorProperty = property === "background" ? "background-color" : property;
        const value = tokens.length === 1 ? computed.getPropertyValue(tokens[0]).trim() : "";
        const color = colorProperties.has(colorProperty) && /^#[\da-f]{3,8}$/i.test(value) && /^var\(\s*--[\w-]+\s*\)$/.test(expression);
        return {
          type: color ? "color" : "select",
          label: shorten(`${labels[property] ?? property} · ${tokens.join(" / ")}`),
          callback: `token-${color ? colorProperty : property}`,
          reference: tokens.length === 1 ? tokens[0] : property,
          currentValue: color ? value : expression.slice(0, 512),
          ...(color ? {} : { options: [{ label: shorten(`${tokens.join(" / ")} · ${computed.getPropertyValue(property)}`), value: expression.slice(0, 512) }] }),
        };
      });
      const existing = registrations.get(target);
      if (!controls.length) { existing?.dispose(); registrations.delete(target); continue; }
      const options: ControlOptions = {
        targets: target,
        controlsHeading: declarations.length > 12 ? `YDS Tokens · 12/${declarations.length}` : "YDS Tokens",
        controlsMode: "extend",
        controls,
      };
      while (JSON.stringify({ controls, controlsHeading: options.controlsHeading, controlsMode: options.controlsMode }).length > 16000) controls.pop();
      if (controls.length < declarations.length) options.controlsHeading = `YDS Tokens · ${controls.length}/${declarations.length}`;
      if (existing) existing.update(options);
      else {
        if (registrations.size === 64) {
          const oldest = registrations.keys().next().value!;
          registrations.get(oldest)!.dispose();
          registrations.delete(oldest);
        }
        registrations.set(target, annotation.registerControls(options));
      }
    }
  };
  const onChange = (event: Event) => {
    if (!(event.target instanceof HTMLElement)) return;
    const { callback, value, action } = (event as CustomEvent<{ callback: string; value: string; action: string }>).detail;
    if (!callback.startsWith("token-")) return;
    const property = callback.replace(/^token-/, "");
    if (!colorProperties.has(property)) return; // Other controls report references; built-in controls still edit styles.
    const target = event.target;
    if (action === "preview") {
      if (!previews.has(target)) previews.set(target, new Map());
      const originals = previews.get(target)!;
      if (!originals.has(property)) {
        const originalProperty = property === "background-color" && target.style.background ? "background" : property;
        originals.set(property, { property: originalProperty, value: target.style.getPropertyValue(originalProperty), priority: target.style.getPropertyPriority(originalProperty) });
      }
      target.style.setProperty(property, value, "important");
    } else if (action === "reset" || action === "preview-original") {
      restore(target, property);
      if (action === "reset") {
        previews.get(target)?.delete(property);
        if (!previews.get(target)?.size) previews.delete(target);
      }
    }
  };
  const invalidate = () => { dirty = true; lastTarget = null; };
  const onLoad = (event: Event) => {
    if (event.target instanceof HTMLLinkElement && event.target.relList.contains("stylesheet")) invalidate();
  };
  const observer = new MutationObserver((records) => {
    if (records.some((record) => record.target !== styles.mirror && !styles.mirror.contains(record.target))) invalidate();
  });
  observer.observe(document.head, { childList: true, subtree: true, characterData: true, attributes: true });
  // Inspect before the native annotation selector consumes events at document.
  // Pointerdown also covers entering annotation mode with a stationary pointer.
  for (const event of ["pointerover", "pointerdown", "focusin"]) window.addEventListener(event, inspect, true);
  document.addEventListener("oaiannotationcontrolchange", onChange);
  document.addEventListener("oaiannotationmodechange", invalidate);
  document.addEventListener("load", onLoad, true);
  window.addEventListener("resize", invalidate);

  return () => {
    observer.disconnect();
    for (const event of ["pointerover", "pointerdown", "focusin"]) window.removeEventListener(event, inspect, true);
    document.removeEventListener("oaiannotationcontrolchange", onChange);
    document.removeEventListener("oaiannotationmodechange", invalidate);
    document.removeEventListener("load", onLoad, true);
    window.removeEventListener("resize", invalidate);
    for (const registration of registrations.values()) registration.dispose();
    for (const [target, originals] of previews) for (const property of originals.keys()) restore(target, property);
    styles.dispose();
  };
}

let users = 0;
let dispose: (() => void) | undefined;

export function watchTokenAnnotationMode() {
  const annotation = (document as Document & { oai?: { annotation?: AnnotationAPI } }).oai?.annotation;
  if (typeof annotation?.registerControls !== "function") return () => {};
  let stop: (() => void) | undefined;
  const start = () => {
    if (!stop && annotation.isActive?.() !== false) stop = installTokenAnnotations();
  };
  document.addEventListener("oaiannotationmodechange", start);
  start();
  return () => { document.removeEventListener("oaiannotationmodechange", start); stop?.(); };
}

export function TokenAnnotations() {
  useEffect(() => {
    if (users++ === 0) dispose = watchTokenAnnotationMode();
    return () => { if (--users === 0) { dispose?.(); dispose = undefined; } };
  }, []);
  return null;
}
