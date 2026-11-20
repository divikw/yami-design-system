"use client";

import { Radio } from "@base-ui/react/radio";
import { PreviewNavigateMessageSchema } from "@yami/contracts";
import {
  Button, ButtonLink, Input, RadioGroup, Select, SelectContent, SelectItem, SelectLabel, SelectList,
  SelectTrigger, SelectValue, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@yami/design-system";
import { isPhonePreviewPage, PhonePreviewShell } from "@yami/prototypes/phone-preview";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Component, ExternalLink, Link, Monitor, Moon, PanelLeft, RotateCcw, Smartphone, Sun, Tablet, type LucideIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type PointerEvent, type ReactElement, type RefObject } from "react";
import { prototypeHref, prototypeProjects, prototypePageLabel, resolvePrototypeVariant } from "../lib/prototype-projects";
import { prototypeSessionKey } from "../lib/prototype-session";
import styles from "./workbench-controls.module.css";

type Locale = "zh" | "en";
type Theme = "light" | "dark";
const MIN_PREVIEW_WIDTH = 360;
const MAX_PREVIEW_WIDTH = 1920;
const STORYBOOK_URL = process.env.NEXT_PUBLIC_STORYBOOK_URL
  ?? (process.env.NODE_ENV === "production"
    ? "https://yds-storybook.vercel.app"
    : "http://localhost:6006");
const STORYBOOK_PAGE_PREFIX = "YAMI/Pages/";
const WORKBENCH_THEME_KEY = "yami-workbench-theme";
const WorkbenchOverlayContext = createContext<RefObject<HTMLDivElement | null> | undefined>(undefined);

interface StorybookPage {
  id: string;
  label: string;
  title: string;
}

interface PreviewHistory {
  scope: string;
  entries: string[];
  index: number;
}

function loadPreviewHistory(scope: string, page: string): PreviewHistory {
  try {
    const saved = JSON.parse(sessionStorage.getItem(scope) ?? "null");
    if (saved && Array.isArray(saved.entries) && saved.entries.every((entry: unknown) => typeof entry === "string")
      && Number.isInteger(saved.index) && saved.index >= 0 && saved.index < saved.entries.length) {
      return { scope, entries: saved.entries, index: saved.index };
    }
  } catch { /* Start a fresh page history if storage is unavailable or invalid. */ }
  return { scope, entries: [page], index: 0 };
}

function readStorybookPages(payload: unknown): StorybookPage[] {
  if (!payload || typeof payload !== "object") return [];
  const entries = (payload as { entries?: unknown }).entries;
  if (!entries || typeof entries !== "object") return [];

  const grouped = new Map<string, { id: string; name: string; title: string }[]>();
  for (const entry of Object.values(entries)) {
    if (!entry || typeof entry !== "object") continue;
    const { id, name, title, type } = entry as Record<string, unknown>;
    if (type !== "story" || typeof id !== "string" || typeof name !== "string" || typeof title !== "string" || !title.toLowerCase().startsWith(STORYBOOK_PAGE_PREFIX.toLowerCase())) continue;
    grouped.set(title, [...(grouped.get(title) ?? []), { id, name, title }]);
  }

  return [...grouped.values()]
    .map((stories) => {
      const story = stories.find((item) => /(^|—|\s)PC$/i.test(item.name)) ?? stories[0];
      return {
        id: story.id,
        label: story.title.slice(STORYBOOK_PAGE_PREFIX.length).replaceAll("/", " / "),
        title: story.title,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

const canvasPages = [
  { value: "/", label: "Ecommerce Home" },
  { value: "/brands/anua", label: "Anua Topic Landing" },
] as const;
const localeOptions = [
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
] as const;
const previewModeOptions = [{ value: "h5", label: "H5" }, { value: "app", label: "App" }] as const;
const viewportOptions = [
  { value: "402", label: "手机", icon: Smartphone },
  { value: "768", label: "平板", icon: Tablet },
  { value: "1440", label: "桌面", icon: Monitor },
] as const;

interface WorkbenchSetting {
  label: string;
  options: readonly { label: string; value: string; icon?: LucideIcon; disabled?: boolean }[];
  value: string;
  valueLabel?: string;
  disabled?: boolean;
  onValueChange: (value: string) => void;
}

function ToolIcon({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return <Icon size={16} strokeWidth={2} className={className} aria-hidden="true" focusable="false" />;
}

function WorkbenchTooltip({ label, children }: { label: string; children: ReactElement }) {
  const container = useContext(WorkbenchOverlayContext);
  return <Tooltip>
    <TooltipTrigger render={children} />
    <TooltipContent container={container} side="bottom">{label}</TooltipContent>
  </Tooltip>;
}

function WorkbenchSettingSelect({ label, options, value, valueLabel, disabled, onValueChange }: WorkbenchSetting) {
  const container = useContext(WorkbenchOverlayContext);
  return <div className={styles.settingSelect}>
    <Select items={options} value={value} disabled={disabled} onValueChange={(next) => { if (next !== null) onValueChange(next); }}>
      <SelectLabel className={styles.label}>{label}</SelectLabel>
      <SelectTrigger data-value={value}>
        <SelectValue>{valueLabel}</SelectValue>
        <ToolIcon icon={ChevronDown} className={styles.settingSelectIcon} />
      </SelectTrigger>
      <SelectContent container={container}>
        <SelectList>
          {options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
        </SelectList>
      </SelectContent>
    </Select>
  </div>;
}

function WorkbenchSettingSegments({ label, options, value, onValueChange }: WorkbenchSetting) {
  const labelId = useId();
  return <>
    <div id={labelId} className={styles.label}>{label}</div>
    <RadioGroup className={styles.segmentGroup} aria-labelledby={labelId} value={value}
      onValueChange={(next) => { if (next !== null) onValueChange(next); }}>
      {options.map((option) => {
        const segment = <Radio.Root key={option.value} value={option.value} className={styles.segment} nativeButton render={<button type="button" />}
          aria-label={option.icon ? option.label : undefined} disabled={option.disabled}>
          {option.icon ? <ToolIcon icon={option.icon} /> : option.label}
        </Radio.Root>;
        return option.icon ? <WorkbenchTooltip key={option.value} label={option.label}>{segment}</WorkbenchTooltip> : segment;
      })}
    </RadioGroup>
  </>;
}

function subscribeToWindowSize(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

function isNarrowWorkbench() {
  return window.innerWidth <= 860;
}

export function CanvasWorkbench() {
  const params = useSearchParams();
  const router = useRouter();
  const projectMode = params.has("project") || !params.has("direction");
  const project = prototypeProjects.find((item) => item.id === (params.get("project") ?? prototypeProjects[0].id));
  const variant = resolvePrototypeVariant(project, params.get("variant"));
  const activePages = projectMode && project ? project.pages : canvasPages;
  const [resetVersion, setResetVersion] = useState(0);
  const [shareStatus, setShareStatus] = useState("");
  const [workbenchTheme, setWorkbenchTheme] = useState<Theme>("light");
  const workbenchOverlays = useRef<HTMLDivElement>(null);
  const narrowWorkbench = useSyncExternalStore(subscribeToWindowSize, isNarrowWorkbench, () => false);
  const [sidebarOverride, setSidebarOverride] = useState<boolean | null>(null);
  const sidebarCollapsed = sidebarOverride ?? narrowWorkbench;
  const previewFrame = useRef<HTMLIFrameElement>(null);
  const [phoneFrame, setPhoneFrame] = useState<HTMLIFrameElement | null>(null);
  const attachPreviewFrame = useCallback((frame: HTMLIFrameElement | null) => {
    previewFrame.current = frame;
    setPhoneFrame(frame);
  }, []);
  const deviceMat = useRef<HTMLDivElement>(null);
  const resizeStart = useRef<{ x: number; edge: number; available: number; width: number } | null>(null);
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const [widthDraft, setWidthDraft] = useState<string | null>(null);
  const [resizing, setResizing] = useState(false);
  const previewHistory = useRef<PreviewHistory | null>(null);
  const pendingPreviewNavigation = useRef(false);
  const [storybookPages, setStorybookPages] = useState<StorybookPage[]>([]);
  const [importedPages, setImportedPages] = useState<StorybookPage[]>([]);
  const storybookIndexRequested = useRef(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const requestedPath = params.get("path") || activePages[0]?.value || "/";
  const pathResult = PreviewNavigateMessageSchema.safeParse({ type: "yami-design-system:v1:navigate", path: requestedPath });
  const path = pathResult.success ? pathResult.data.path : "/";
  const storyId = params.get("story") || "";
  const historyScope = `yami-preview-history:${projectMode ? project?.id ?? "unknown" : "legacy"}`;
  const historyPage = storyId ? `storybook:${storyId}` : path;
  const selectedCanvasPage = path === "/brands/11712"
    ? "/brands/anua"
    : activePages.some((page) => page.value === path) ? path : "";
  const direction = params.get("direction") || "current";
  const projectPreview = projectMode && !storyId ? variant : undefined;
  const fixedLocale = projectPreview?.fixedLocale;
  const locale: Locale = fixedLocale ?? (params.get("locale") === "en" ? "en" : "zh");
  const theme = (params.get("theme") === "dark" ? "dark" : "light") as Theme;
  const fixedPreviewMode = projectPreview?.fixedPreviewMode;
  const previewMode = fixedPreviewMode ?? (params.get("previewMode") === "h5" ? "h5" : "app");
  const maxPreviewWidth = projectPreview?.maxPreviewWidth ?? MAX_PREVIEW_WIDTH;
  const clampPreviewWidth = (width: number) => Math.max(MIN_PREVIEW_WIDTH, Math.min(maxPreviewWidth, Math.round(width)));
  const requestedViewport = params.get("viewport");
  const viewport = requestedViewport && /^\d+$/.test(requestedViewport)
    ? String(clampPreviewWidth(Number(requestedViewport)))
    : viewportOptions[narrowWorkbench || variant?.homeHeader ? 0 : 2].value;
  const previewWidth = clampPreviewWidth(dragWidth ?? Number(viewport));
  const deviceWidth = widthDraft?.trim() && Number.isFinite(Number(widthDraft))
    ? clampPreviewWidth(Number(widthDraft)) : previewWidth;
  const selectedDevice = deviceWidth < 768 ? "402" : deviceWidth < 1024 ? "768" : "1440";
  const previousPreviewState = useRef({ path, direction, storyId });
  const pendingNavigationPath = useRef(path);
  const transition = previousPreviewState.current.path !== path || previousPreviewState.current.storyId !== storyId
    ? "path"
    : previousPreviewState.current.direction !== direction ? "direction" : "none";

  const selectedStorybookPage = storybookPages.find((page) => page.id.split("--")[0] === storyId.split("--")[0]);
  const currentImportedPage = storyId && !importedPages.some((page) => page.id === storyId)
    ? selectedStorybookPage ? { ...selectedStorybookPage, id: storyId } : { id: storyId, label: "Storybook 页面", title: storyId }
    : null;
  const visibleImportedPages = currentImportedPage ? [...importedPages, currentImportedPage] : importedPages;
  const pageOptions = [
    ...activePages,
    ...visibleImportedPages.filter((page) => !projectMode || page.id === storyId)
      .map((page) => ({ value: `storybook:${page.id}`, label: page.label })),
  ];
  const linkedPageLabel = projectMode && project && !storyId && !activePages.some((page) => page.value === path)
    ? prototypePageLabel(path, project) : undefined;
  const selectedPage = storyId
    ? `storybook:${storyId}`
    : projectMode ? path : selectedCanvasPage;

  const update = useCallback((next: Partial<{ path: string | null; story: string | null; direction: string; locale: Locale; theme: Theme; viewport: string | null; previewMode: string; project: string; variant: string | null }>, mode: "push" | "replace" = "replace") => {
    // Read the current URL so consecutive edits cannot overwrite pending settings.
    const query = new URLSearchParams(window.location.search);
    if (projectMode && project && variant) {
      if (!query.has("project")) query.set("project", project.id);
      query.set("variant", variant.id);
      query.delete("direction");
    }
    for (const [key, value] of Object.entries(next)) {
      if (value === null) query.delete(key);
      else query.set(key, value);
    }
    const href = `/design?${query.toString()}`;
    if (mode === "push") {
      const destination = query.get("story") ? `storybook:${query.get("story")}` : query.get("path") || "/";
      pendingPreviewNavigation.current = destination !== historyPage;
      router.push(href, { scroll: false });
      return;
    }
    window.history.replaceState(null, "", href);
  }, [router, projectMode, project, variant, historyPage]);

  useEffect(() => {
    setDragWidth(null);
  }, [viewport]);

  useEffect(() => {
    let history = previewHistory.current?.scope === historyScope
      ? previewHistory.current : loadPreviewHistory(historyScope, historyPage);
    if (history.entries[history.index] !== historyPage) {
      const existingIndex = pendingPreviewNavigation.current ? -1 : history.entries.lastIndexOf(historyPage);
      history = existingIndex >= 0 ? { ...history, index: existingIndex }
        : { ...history, entries: [...history.entries.slice(0, history.index + 1), historyPage], index: history.index + 1 };
    }
    pendingPreviewNavigation.current = false;
    previewHistory.current = history;
    try { sessionStorage.setItem(historyScope, JSON.stringify(history)); } catch { /* Optional persistence. */ }
    setCanGoBack(history.index > 0);
    setCanGoForward(history.index < history.entries.length - 1);
  }, [historyPage, historyScope]);

  function navigatePreview(offset: number) {
    const history = previewHistory.current;
    if (!history || history.scope !== historyScope) return;
    const index = history.index + offset;
    if (index < 0 || index >= history.entries.length) return;
    previewHistory.current = { ...history, index };
    const target = history.entries[index];
    update(target.startsWith("storybook:")
      ? { story: target.slice("storybook:".length), path: null }
      : { path: target, story: null });
  }

  useEffect(() => {
    previousPreviewState.current = { path, direction, storyId };
    pendingNavigationPath.current = path;
  }, [path, direction, storyId]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (previewFrame.current && event.source !== previewFrame.current.contentWindow) return;
      const message = PreviewNavigateMessageSchema.safeParse(event.data);
      if (!message.success) return;
      if (pendingNavigationPath.current === message.data.path) return;
      pendingNavigationPath.current = message.data.path;
      update({ path: message.data.path, story: null }, "push");
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [update]);

  const previewSrc = useMemo(() => {
    if (storyId) {
      const storybookQuery = new URLSearchParams({
        id: storyId,
        viewMode: "story",
        globals: `locale:${locale};theme:${theme}`,
        previewMode,
      });
      return `${STORYBOOK_URL}/iframe.html?${storybookQuery.toString()}`;
    }
    if (projectMode) {
      const previewParams = new URLSearchParams(params);
      previewParams.delete("viewport");
      return `${prototypeHref(previewParams, path)}&embedded=1&reset=${resetVersion}`;
    }
    const previewQuery = new URLSearchParams({ path, direction, locale, theme, transition, previewMode });
    return `/preview?${previewQuery.toString()}`;
  }, [path, direction, locale, theme, transition, previewMode, storyId, projectMode, params, resetVersion]);

  function commitPreviewWidth(value: number) {
    const width = clampPreviewWidth(value);
    setWidthDraft(null);
    setDragWidth(width);
    update({ viewport: String(width) });
  }

  function startResize(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || !deviceMat.current || !previewFrame.current) return;
    const mat = deviceMat.current;
    const style = getComputedStyle(mat);
    const padding = parseFloat(style.paddingLeft);
    resizeStart.current = {
      x: event.clientX,
      edge: previewFrame.current.parentElement!.getBoundingClientRect().right - mat.getBoundingClientRect().left + mat.scrollLeft - padding,
      available: mat.clientWidth - padding - parseFloat(style.paddingRight),
      width: previewWidth,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
    event.currentTarget.focus();
    setWidthDraft(null);
    setResizing(true);
  }

  function moveResize(event: PointerEvent<HTMLDivElement>) {
    const start = resizeStart.current;
    if (!start || !deviceMat.current) return;
    const edge = start.edge + event.clientX - start.x;
    // Centered frames move both edges; overflowing frames are left-aligned.
    start.width = clampPreviewWidth((edge <= start.available ? 2 * edge - start.available : edge) - 2);
    setDragWidth(start.width);
  }

  function finishResize(commit: boolean) {
    const start = resizeStart.current;
    if (!start) return;
    resizeStart.current = null;
    setResizing(false);
    if (commit && start.width !== Number(viewport)) update({ viewport: String(start.width) });
    else setDragWidth(null);
  }

  const loadStorybookPages = useCallback(async () => {
    if (storybookIndexRequested.current) return;
    storybookIndexRequested.current = true;
    try {
      const response = await fetch(`${STORYBOOK_URL}/index.json`);
      if (!response.ok) return;
      const pages = readStorybookPages(await response.json());
      setStorybookPages(pages);
      if (storyId) {
        const selectedStory = pages.find((page) => page.id === storyId);
        if (selectedStory) setImportedPages((current) => current.some((page) => page.id === storyId) ? current : [...current, selectedStory]);
      }
    } catch { /* The direct preview can still use its fallback label. */ }
  }, [storyId]);

  useEffect(() => {
    if (storyId) void loadStorybookPages();
  }, [storyId, loadStorybookPages]);

  function selectPage(value: string) {
    if (value.startsWith("storybook:")) {
      update({ path: null, story: value.slice("storybook:".length) }, "push");
      return;
    }
    update({ path: value, story: null }, "push");
  }

  function resetDemo() {
    if (!project || !variant) return;
    try { sessionStorage.removeItem(prototypeSessionKey(project.id, variant.id)); }
    catch { setShareStatus("浏览器未允许重置存储，请重新打开演示。"); return; }
    setWidthDraft(null);
    setDragWidth(null);
    update({ viewport: null });
    setResetVersion((value) => value + 1);
    setShareStatus("已重置当前方案");
  }

  const shareHref = prototypeHref(new URLSearchParams(params), path);
  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(new URL(shareHref, window.location.origin).href);
      setShareStatus("已复制预览链接");
    } catch { setShareStatus("请打开独立预览并复制地址栏链接。"); }
  }

  useEffect(() => {
    try {
      if (localStorage.getItem(WORKBENCH_THEME_KEY) === "dark") setWorkbenchTheme("dark");
    } catch { /* Use the default theme when storage is unavailable. */ }
  }, []);

  const nextWorkbenchTheme = workbenchTheme === "dark" ? "light" : "dark";
  function toggleWorkbenchTheme() {
    setWorkbenchTheme(nextWorkbenchTheme);
    try {
      localStorage.setItem(WORKBENCH_THEME_KEY, nextWorkbenchTheme);
    } catch { /* The theme remains active for the current page. */ }
  }

  if (projectMode && (!project || !variant)) return <main className="prototype-unavailable"><h1>找不到这个原型方案</h1><ButtonLink href="/design" variant="secondary" size="sm">返回工作台</ButtonLink></main>;

  const showProjectActions = projectMode && !storyId;
  const sidebarToggleLabel = sidebarCollapsed ? "展开侧边栏" : "收起侧边栏";
  const themeToggleLabel = nextWorkbenchTheme === "dark" ? "切换到深色模式" : "切换到浅色模式";
  // The simulated device and the iframe keep their own preview theme.
  const chromeThemeClass = workbenchTheme === "dark" ? " dark" : "";
  return <WorkbenchOverlayContext value={workbenchOverlays}><TooltipProvider>
    <main className="canvas-shell" data-workbench-theme={workbenchTheme}>
      <header className={`canvas-header${chromeThemeClass}`}>
        <div className="brand-lockup">
          <WorkbenchTooltip label={sidebarToggleLabel}>
            <Button form="icon" variant="secondary" size="sm" className="sidebar-toggle" aria-label={sidebarToggleLabel}
              aria-expanded={!sidebarCollapsed} aria-controls="workbench-sidebar" onClick={() => setSidebarOverride(!sidebarCollapsed)}>
              <ToolIcon icon={PanelLeft} />
            </Button>
          </WorkbenchTooltip>
          <strong>PROTOTYPE</strong>
        </div>
        <WorkbenchTooltip label={themeToggleLabel}>
          <Button form="icon" variant="tertiary" size="sm" className="workbench-theme-toggle" aria-label={themeToggleLabel}
            onClick={toggleWorkbenchTheme}>
            <ToolIcon icon={nextWorkbenchTheme === "dark" ? Moon : Sun} />
          </Button>
        </WorkbenchTooltip>
      </header>

      <section className="canvas-grid" data-sidebar-collapsed={sidebarCollapsed || undefined}>
        <aside className={`control-panel${chromeThemeClass}`} id="workbench-sidebar" hidden={sidebarCollapsed}>
          <div className="control-panel-settings">
            {!projectMode && <div className="panel-heading"><span>页面管理</span></div>}
            {projectMode && project && variant ? <>
              <WorkbenchSettingSelect label="项目方案" options={prototypeProjects.map((item) => ({ value: item.id, label: item.name }))} value={project.id}
                onValueChange={(value) => update({
                  project: value, variant: null, story: null,
                  path: prototypeProjects.find((item) => item.id === value)?.pages[0]?.value ?? "/",
                }, "push")} />
              <WorkbenchSettingSelect label="设计方案" options={project.variants.map((item) => ({ value: item.id, label: item.name }))} value={variant.id}
                onValueChange={(value) => update({ variant: value, story: null })} />
            </> : <ButtonLink variant="secondary" size="sm" href="/design?project=global-navigation">打开项目原型</ButtonLink>}

            <WorkbenchSettingSelect
              label="页面"
              options={selectedPage ? pageOptions : [{ value: "", label: "其他路径" }, ...pageOptions]}
              value={selectedPage}
              valueLabel={linkedPageLabel}
              onValueChange={selectPage}
            />
            <WorkbenchSettingSelect
              label="语言"
              options={fixedLocale ? localeOptions.filter((option) => option.value === fixedLocale) : localeOptions}
              value={locale}
              disabled={Boolean(fixedLocale)}
              onValueChange={(value) => update({ locale: value as Locale })}
            />
            <div className={styles.settingGroup}>
              <WorkbenchSettingSegments label="设备"
                options={viewportOptions.map((option) => ({ ...option, disabled: Number(option.value) > maxPreviewWidth }))}
                value={selectedDevice}
                onValueChange={(value) => { setWidthDraft(null); setDragWidth(null); update({ viewport: value }); }} />
              <Input className={styles.widthInput} density="compact" fullWidth aria-label="宽度（px）" type="number"
                min={MIN_PREVIEW_WIDTH} max={maxPreviewWidth} step={1}
                trailingIcon={<span className={styles.widthControls}>
                  <span className={styles.widthStepper}>
                    <button type="button" className={styles.widthStep} aria-label="增大预览宽度" disabled={deviceWidth >= maxPreviewWidth}
                      onClick={() => commitPreviewWidth(deviceWidth + 1)}><ToolIcon icon={ChevronUp} /></button>
                    <button type="button" className={styles.widthStep} aria-label="减小预览宽度" disabled={deviceWidth <= MIN_PREVIEW_WIDTH}
                      onClick={() => commitPreviewWidth(deviceWidth - 1)}><ToolIcon icon={ChevronDown} /></button>
                  </span>
                  <span aria-hidden="true">PX</span>
                </span>}
                value={widthDraft ?? String(previewWidth)}
                onChange={(event) => setWidthDraft(event.target.value)}
                onBlur={() => {
                  if (widthDraft === null) return;
                  const value = Number(widthDraft);
                  if (widthDraft.trim() && Number.isFinite(value)) commitPreviewWidth(value);
                  else setWidthDraft(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                  if (event.key === "Escape") { event.preventDefault(); setWidthDraft(null); }
                }} />
            </div>
            {selectedDevice === viewportOptions[0].value && <div className={styles.settingGroup}>
              <WorkbenchSettingSegments label="预览模式"
                options={previewModeOptions.map((option) => ({
                  ...option, disabled: fixedPreviewMode !== undefined && option.value !== fixedPreviewMode,
                }))}
                value={previewMode} onValueChange={(value) => update({ previewMode: value })} />
            </div>}
            {storyId && <p className="prototype-description">Storybook 单页预览，未加入项目流程。</p>}
            {storyId && <div className="path-readout"><span>Storybook Story</span><code>{storyId}</code></div>}
          </div>
          <a className="control-panel-storybook" href={STORYBOOK_URL} target="_blank" rel="noreferrer">
            <ToolIcon icon={Component} />
            <span>Storybook</span>
          </a>
        </aside>

        <section className="preview-stage" aria-label="原型预览区">
          <div className={`preview-actions${chromeThemeClass}`} role="group" aria-label="预览操作">
            <div className="preview-button-group" role="group" aria-label={showProjectActions ? "页面历史和重置" : "页面历史"}>
              <WorkbenchTooltip label="后退">
                <Button form="icon" variant="tertiary" size="sm" className="preview-history-button" onClick={() => navigatePreview(-1)} disabled={!canGoBack} aria-label="返回上一步"><ToolIcon icon={ArrowLeft} /></Button>
              </WorkbenchTooltip>
              <WorkbenchTooltip label="前进">
                <Button form="icon" variant="tertiary" size="sm" className="preview-history-button" onClick={() => navigatePreview(1)} disabled={!canGoForward} aria-label="前进到下一步"><ToolIcon icon={ArrowRight} /></Button>
              </WorkbenchTooltip>
              {showProjectActions && <>
                <span className="preview-history-divider" aria-hidden="true" />
                <WorkbenchTooltip label="重置演示">
                  <Button form="icon" variant="tertiary" size="sm" onClick={resetDemo} aria-label="重置演示"><ToolIcon icon={RotateCcw} /></Button>
                </WorkbenchTooltip>
              </>}
            </div>
            {showProjectActions && <div className="prototype-actions">
              <span role="status" className="preview-action-status">{shareStatus}</span>
              <div className="preview-button-group" role="group" aria-label="预览链接">
                <WorkbenchTooltip label="独立预览">
                  <ButtonLink form="icon" variant="tertiary" size="sm" href={shareHref} target="_blank" rel="noreferrer"
                    aria-label="独立预览"><ToolIcon icon={ExternalLink} /></ButtonLink>
                </WorkbenchTooltip>
                <WorkbenchTooltip label="复制预览链接">
                  <Button form="icon" variant="tertiary" size="sm" onClick={copyShareLink}
                    aria-label="复制预览链接"><ToolIcon icon={Link} /></Button>
                </WorkbenchTooltip>
              </div>
            </div>}
          </div>
          <div className="device-mat" ref={deviceMat} data-resizing={resizing || undefined}>
            <div className="preview-frame-wrap" style={{ width: `${previewWidth}px`, boxSizing: "content-box" }}>
              <iframe key={previewSrc} id="canvas-preview" ref={attachPreviewFrame} title="YAMI 原型预览" src={previewSrc} />
              <PhonePreviewShell frame={phoneFrame} theme={theme} mode={previewMode}
                enabled={!storyId || isPhonePreviewPage(visibleImportedPages.find((page) => page.id === storyId)?.title ?? "")}
                safari={{ address: phoneFrame ? new URL(phoneFrame.src).host : "", openHref: projectMode && !storyId ? shareHref : previewSrc,
                  canGoBack, onBack: () => navigatePreview(-1),
                  onReload: () => { if (previewFrame.current) previewFrame.current.src = previewSrc; } }} />
              <div className="preview-resize-handle" role="separator" tabIndex={0} aria-label="调整预览宽度" aria-orientation="vertical"
                aria-controls="canvas-preview" aria-valuemin={MIN_PREVIEW_WIDTH} aria-valuemax={maxPreviewWidth} aria-valuenow={previewWidth}
                aria-valuetext={`${previewWidth} 像素`} title="拖动调整宽度；方向键微调，Shift 加速"
                onPointerDown={startResize} onPointerMove={moveResize} onPointerUp={() => finishResize(true)}
                onPointerCancel={() => finishResize(false)} onLostPointerCapture={() => finishResize(false)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") { finishResize(false); return; }
                  const step = event.shiftKey ? 10 : 1;
                  const next = event.key === "ArrowLeft" ? previewWidth - step : event.key === "ArrowRight" ? previewWidth + step
                    : event.key === "Home" ? MIN_PREVIEW_WIDTH : event.key === "End" ? maxPreviewWidth : null;
                  if (next === null) return;
                  event.preventDefault();
                  const width = clampPreviewWidth(next);
                  setDragWidth(width);
                  update({ viewport: String(width) });
                }} />
            </div>
          </div>
        </section>
      </section>

      <div className={`workbench-overlays${chromeThemeClass}`} ref={workbenchOverlays} />
    </main>
  </TooltipProvider></WorkbenchOverlayContext>;
}
