"use client";

import { PreviewNavigateMessageSchema } from "@yami/contracts";
import { ArrowLeft02Icon, ArrowRight02Icon, Cancel01Icon, Copy01Icon, ImportIcon, LinkSquare02Icon, RefreshCcwIcon, SidebarLeftIcon } from "@hugeicons/core-free-icons";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { prototypeHref, prototypeProjects, prototypePageLabel } from "../lib/prototype-projects";
import { prototypeSessionKey } from "../lib/prototype-session";
import { SegmentedControl, WorkbenchButton, WorkbenchIcon, WorkbenchLink, WorkbenchSelect, WorkbenchTextField } from "./workbench-controls";

type Locale = "zh" | "en";
type Theme = "light" | "dark";
const MIN_PREVIEW_WIDTH = 320;
const MAX_PREVIEW_WIDTH = 1920;
const clampPreviewWidth = (width: number) => Math.max(MIN_PREVIEW_WIDTH, Math.min(MAX_PREVIEW_WIDTH, Math.round(width)));
const STORYBOOK_URL = process.env.NEXT_PUBLIC_STORYBOOK_URL
  ?? (process.env.NODE_ENV === "production"
    ? "https://yds-storybook.vercel.app"
    : "http://localhost:6006");
const STORYBOOK_PAGE_PREFIX = "YAMI/Pages/";

interface StorybookPage {
  id: string;
  label: string;
  title: string;
}

type StorybookLoadState = "idle" | "loading" | "ready" | "error";

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
    if (type !== "story" || typeof id !== "string" || typeof name !== "string" || typeof title !== "string" || !title.startsWith(STORYBOOK_PAGE_PREFIX)) continue;
    grouped.set(title, [...(grouped.get(title) ?? []), { id, name, title }]);
  }

  return [...grouped.values()]
    .map((stories) => {
      const story = stories.find((item) => /(^|—|\s)PC$/.test(item.name)) ?? stories[0];
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
const viewportOptions = [
  { value: "402", label: "手机" },
  { value: "768", label: "平板" },
  { value: "1440", label: "桌面" },
] as const;

export function CanvasWorkbench() {
  const params = useSearchParams();
  const router = useRouter();
  const projectMode = params.has("project") || !params.has("direction");
  const project = prototypeProjects.find((item) => item.id === (params.get("project") ?? prototypeProjects[0].id));
  const variant = project?.variants.find((item) => item.id === (params.get("variant") ?? "current"));
  const activePages = projectMode && project ? project.pages : canvasPages;
  const [resetVersion, setResetVersion] = useState(0);
  const [shareStatus, setShareStatus] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const importDialog = useRef<HTMLDialogElement>(null);
  const previewFrame = useRef<HTMLIFrameElement>(null);
  const deviceMat = useRef<HTMLDivElement>(null);
  const resizeStart = useRef<{ x: number; edge: number; available: number; width: number } | null>(null);
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const [widthDraft, setWidthDraft] = useState<string | null>(null);
  const [resizing, setResizing] = useState(false);
  const previewHistory = useRef<PreviewHistory | null>(null);
  const pendingPreviewNavigation = useRef(false);
  const [storybookPages, setStorybookPages] = useState<StorybookPage[]>([]);
  const [importedPages, setImportedPages] = useState<StorybookPage[]>([]);
  const [storybookLoadState, setStorybookLoadState] = useState<StorybookLoadState>("idle");
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const requestedPath = params.get("path") || "/";
  const pathResult = PreviewNavigateMessageSchema.safeParse({ type: "yami-design-system:v1:navigate", path: requestedPath });
  const path = pathResult.success ? pathResult.data.path : "/";
  const storyId = params.get("story") || "";
  const historyScope = `yami-preview-history:${projectMode ? project?.id ?? "unknown" : "legacy"}`;
  const historyPage = storyId ? `storybook:${storyId}` : path;
  const selectedCanvasPage = path === "/brands/11712"
    ? "/brands/anua"
    : activePages.some((page) => page.value === path) ? path : "";
  const direction = params.get("direction") || "current";
  const locale = (params.get("locale") === "en" ? "en" : "zh") as Locale;
  const theme = (params.get("theme") === "dark" ? "dark" : "light") as Theme;
  const requestedViewport = params.get("viewport");
  const viewport = requestedViewport && /^\d+$/.test(requestedViewport)
    ? String(clampPreviewWidth(Number(requestedViewport))) : "1440";
  const previewWidth = dragWidth ?? Number(viewport);
  const deviceWidth = widthDraft?.trim() && Number.isFinite(Number(widthDraft))
    ? clampPreviewWidth(Number(widthDraft)) : previewWidth;
  const selectedDevice = deviceWidth < 768 ? "402" : deviceWidth < 1024 ? "768" : "1440";
  const previousPreviewState = useRef({ path, direction, storyId });
  const pendingNavigationPath = useRef(path);
  const transition = previousPreviewState.current.path !== path || previousPreviewState.current.storyId !== storyId
    ? "path"
    : previousPreviewState.current.direction !== direction ? "direction" : "none";

  const currentImportedPage = storyId && !importedPages.some((page) => page.id === storyId)
    ? storybookPages.find((page) => page.id === storyId) ?? { id: storyId, label: "Storybook 页面", title: storyId }
    : null;
  const visibleImportedPages = currentImportedPage ? [...importedPages, currentImportedPage] : importedPages;
  const pageOptions = [
    ...(projectMode && project && !activePages.some((page) => page.value === path) && !storyId ? [{ value: path, label: prototypePageLabel(path, project) }] : []),
    ...activePages,
    ...visibleImportedPages.map((page) => ({ value: `storybook:${page.id}`, label: page.label })),
  ];
  const selectedPage = storyId
    ? `storybook:${storyId}`
    : projectMode ? path : selectedCanvasPage;

  const update = useCallback((next: Partial<{ path: string | null; story: string | null; direction: string; locale: Locale; theme: Theme; viewport: string; project: string; variant: string }>, mode: "push" | "replace" = "replace") => {
    // Read the current URL so consecutive edits cannot overwrite pending settings.
    const query = new URLSearchParams(window.location.search);
    if (projectMode && project && variant) {
      if (!query.has("project")) query.set("project", project.id);
      if (!query.has("variant")) query.set("variant", variant.id);
      query.delete("direction");
    }
    for (const [key, value] of Object.entries(next)) {
      if (value === null) query.delete(key);
      else query.set(key, value);
    }
    const href = `/workbench?${query.toString()}`;
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
      });
      return `${STORYBOOK_URL}/iframe.html?${storybookQuery.toString()}`;
    }
    if (projectMode) {
      const previewParams = new URLSearchParams(params);
      previewParams.delete("viewport");
      return `${prototypeHref(previewParams, path)}&embedded=1&reset=${resetVersion}`;
    }
    const previewQuery = new URLSearchParams({ path, direction, locale, theme, transition });
    return `/preview?${previewQuery.toString()}`;
  }, [path, direction, locale, theme, transition, storyId, projectMode, params, resetVersion]);

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
    if (storybookLoadState === "loading" || storybookLoadState === "ready") return;
    setStorybookLoadState("loading");
    try {
      const response = await fetch(`${STORYBOOK_URL}/index.json`);
      if (!response.ok) throw new Error(`Storybook returned ${response.status}`);
      const pages = readStorybookPages(await response.json());
      if (pages.length === 0) throw new Error("Storybook has no page stories");
      setStorybookPages(pages);
      if (storyId) {
        const selectedStory = pages.find((page) => page.id === storyId);
        if (selectedStory) setImportedPages((current) => current.some((page) => page.id === storyId) ? current : [...current, selectedStory]);
      }
      setStorybookLoadState("ready");
    } catch {
      setStorybookLoadState("error");
    }
  }, [storybookLoadState, storyId]);

  useEffect(() => {
    if (storyId) void loadStorybookPages();
  }, [storyId, loadStorybookPages]);

  function openStorybookImporter() {
    if (!importDialog.current?.open) importDialog.current?.showModal();
    void loadStorybookPages();
  }

  function importStorybookPage(page: StorybookPage) {
    setImportedPages((current) => current.some((item) => item.id === page.id) ? current : [...current, page]);
    importDialog.current?.close();
    update({ path: null, story: page.id }, "push");
  }

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
    setResetVersion((value) => value + 1);
    setShareStatus("已重置当前方案");
  }

  const shareHref = prototypeHref(new URLSearchParams(params), path);
  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(new URL(shareHref, window.location.origin).href);
      setShareStatus("已复制方案链接");
    } catch { setShareStatus("请打开独立预览并复制地址栏链接。"); }
  }

  if (projectMode && (!project || !variant)) return <main className="prototype-unavailable"><h1>找不到这个原型方案</h1><WorkbenchLink href="/workbench">返回工作台</WorkbenchLink></main>;

  return (
    <main className="canvas-shell">
      <header className="canvas-header">
        <div className="brand-lockup">
          <WorkbenchButton className="sidebar-toggle" aria-label={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
            title={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"} aria-expanded={!sidebarCollapsed} aria-controls="workbench-sidebar"
            onClick={() => setSidebarCollapsed((value) => !value)}>
            <WorkbenchIcon icon={SidebarLeftIcon} />
          </WorkbenchButton>
          <strong>PROTOTYPE</strong>
        </div>
        <div className="header-actions"><WorkbenchButton onClick={openStorybookImporter}><WorkbenchIcon icon={ImportIcon} />导入</WorkbenchButton><WorkbenchLink href={STORYBOOK_URL} target="_blank" rel="noreferrer">Storybook<WorkbenchIcon icon={LinkSquare02Icon} /></WorkbenchLink></div>
      </header>

      <section className="canvas-grid" data-sidebar-collapsed={sidebarCollapsed || undefined}>
        <aside className="control-panel" id="workbench-sidebar" hidden={sidebarCollapsed}>
          <div className="panel-heading"><span>{projectMode ? "项目与方案" : "页面管理"}</span></div>
          {projectMode && project && variant ? <>
            <WorkbenchSelect label="项目" options={prototypeProjects.map((item) => ({ value: item.id, label: item.name }))} value={project.id}
              onValueChange={(value) => update({ project: value, variant: "current", path: "/", story: null }, "push")} />
            <WorkbenchSelect label="设计方案" options={project.variants.map((item) => ({ value: item.id, label: item.name }))} value={variant.id}
              onValueChange={(value) => update({ variant: value, story: null })} />
          </> : <WorkbenchLink href="/workbench?project=global-navigation&variant=current">打开项目原型</WorkbenchLink>}

          <WorkbenchSelect
            label="页面"
            options={selectedPage ? pageOptions : [{ value: "", label: "其他路径" }, ...pageOptions]}
            value={selectedPage}
            onValueChange={selectPage}
          />
          <WorkbenchSelect
            label="语言"
            options={localeOptions}
            value={locale}
            onValueChange={(value) => update({ locale: value as Locale })}
          />
          <SegmentedControl
            label="设备"
            options={viewportOptions}
            value={selectedDevice}
            onValueChange={(value) => { setWidthDraft(null); setDragWidth(null); update({ viewport: value }); }}
          >
            <WorkbenchTextField label="宽度（px）" hideLabel suffix="px" type="number" min={MIN_PREVIEW_WIDTH} max={MAX_PREVIEW_WIDTH} step={1}
              value={widthDraft ?? String(previewWidth)}
              onChange={(event) => setWidthDraft(event.target.value)}
              onBlur={() => {
                if (widthDraft === null) return;
                const value = Number(widthDraft);
                setWidthDraft(null);
                if (!widthDraft.trim() || !Number.isFinite(value)) return;
                const width = clampPreviewWidth(value);
                setDragWidth(width);
                update({ viewport: String(width) });
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
                if (event.key === "Escape") { event.preventDefault(); setWidthDraft(null); }
              }} />
          </SegmentedControl>
          {storyId && <p className="prototype-description">Storybook 单页预览，未加入项目流程。</p>}
          <div className="path-readout"><span>{storyId ? "Storybook Story" : "当前路径"}</span><code>{storyId || path}</code></div>
        </aside>

        <section className="preview-stage" aria-label="原型预览区">
          <div className="preview-actions" role="group" aria-label="预览操作">
            <div className="preview-history" role="group" aria-label="页面历史">
              <WorkbenchButton onClick={() => navigatePreview(-1)} disabled={!canGoBack} aria-label="返回上一步" title="后退"><WorkbenchIcon icon={ArrowLeft02Icon} /></WorkbenchButton>
              <WorkbenchButton onClick={() => navigatePreview(1)} disabled={!canGoForward} aria-label="前进到下一步" title="前进"><WorkbenchIcon icon={ArrowRight02Icon} /></WorkbenchButton>
            </div>
            {projectMode && !storyId && <div className="prototype-actions">
              <span role="status" className="preview-action-status">{shareStatus}</span>
              <WorkbenchLink href={shareHref} target="_blank" rel="noreferrer">独立预览<WorkbenchIcon icon={LinkSquare02Icon} /></WorkbenchLink>
              <WorkbenchButton onClick={copyShareLink}><WorkbenchIcon icon={Copy01Icon} />复制方案链接</WorkbenchButton>
              <WorkbenchButton onClick={resetDemo}><WorkbenchIcon icon={RefreshCcwIcon} />重置演示</WorkbenchButton>
            </div>}
          </div>
          <div className="device-mat" ref={deviceMat} data-resizing={resizing || undefined}>
            <div className="preview-frame-wrap" style={{ width: `${previewWidth}px`, boxSizing: "content-box" }}>
              <iframe key={previewSrc} id="canvas-preview" ref={previewFrame} title="YAMI 原型预览" src={previewSrc} />
              <div className="preview-resize-handle" role="separator" tabIndex={0} aria-label="调整预览宽度" aria-orientation="vertical"
                aria-controls="canvas-preview" aria-valuemin={MIN_PREVIEW_WIDTH} aria-valuemax={MAX_PREVIEW_WIDTH} aria-valuenow={previewWidth}
                aria-valuetext={`${previewWidth} 像素`} title="拖动调整宽度；方向键微调，Shift 加速"
                onPointerDown={startResize} onPointerMove={moveResize} onPointerUp={() => finishResize(true)}
                onPointerCancel={() => finishResize(false)} onLostPointerCapture={() => finishResize(false)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") { finishResize(false); return; }
                  const step = event.shiftKey ? 10 : 1;
                  const next = event.key === "ArrowLeft" ? previewWidth - step : event.key === "ArrowRight" ? previewWidth + step
                    : event.key === "Home" ? MIN_PREVIEW_WIDTH : event.key === "End" ? MAX_PREVIEW_WIDTH : null;
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

      <dialog ref={importDialog} className="storybook-import-dialog" aria-labelledby="storybook-import-title">
        <div className="storybook-import-header">
          <div>
            <h2 id="storybook-import-title">从 Storybook 导入页面</h2>
            <p>选择一个页面并在 Canvas 中预览。</p>
          </div>
          <button type="button" aria-label="关闭导入页面弹窗" onClick={() => importDialog.current?.close()}><WorkbenchIcon icon={Cancel01Icon} /></button>
        </div>
        <div className="storybook-page-list">
          {storybookLoadState === "loading" && <p role="status">正在读取 Storybook 页面…</p>}
          {storybookLoadState === "error" && <div className="storybook-import-error"><p role="alert">无法读取 Storybook 页面，请确认 Storybook 已启动。</p><WorkbenchButton onClick={loadStorybookPages}>重试</WorkbenchButton></div>}
          {storybookLoadState === "ready" && storybookPages.map((page) => (
            <button key={page.id} type="button" className="storybook-page-option" aria-label={page.label} onClick={() => importStorybookPage(page)}>
              <strong>{page.label}</strong>
              <span>{page.title}</span>
            </button>
          ))}
        </div>
      </dialog>
    </main>
  );
}
