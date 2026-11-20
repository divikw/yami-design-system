import {
  EmptyState, EmptyStateHeader, EmptyStateTitle, EmptyStateDescription, EmptyStateMedia,
  Progress, ProgressLabel, ProgressValue, Skeleton, Spinner, Tag, type TagContext, type TagMode, type TagVariant,
} from "@yami/design-system";
import { jsxAttributes, jsxExample, type PropertiesDefinition } from "./component-properties";

export const emptyStateProperties: PropertiesDefinition<{ title: string; description: string; media: "none" | "default" | "icon" }> = {
  slug: "emptystate",
  initialValues: locale => locale === "zh" ? { title: "暂无订单", description: "下单后可在这里查看配送进度。", media: "none" }
    : { title: "No orders yet", description: "Track your deliveries here after you order.", media: "none" },
  fields: (_, locale) => [
    { key: "title", name: "EmptyStateTitle.children", kind: "text", type: "ReactNode", label: locale === "zh" ? "空状态标题" : "Empty state title", description: locale === "zh" ? "说明哪里没有内容。" : "Explain what is empty." },
    { key: "description", name: "EmptyStateDescription.children", kind: "text", type: "ReactNode", label: locale === "zh" ? "空状态说明" : "Empty state description", description: locale === "zh" ? "说明后续会发生什么。" : "Explain what happens next." },
    { key: "media", name: "EmptyStateMedia.variant", kind: "select", type: '"default" | "icon"', options: ["none", "default", "icon"], description: locale === "zh" ? "none 省略媒体区域。" : "None removes the media slot." },
  ],
  example: ({ title, description, media }) => {
    const icon = <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path d="M4 7l8-4 8 4v10l-8 4-8-4V7Zm0 0 8 4 8-4m-8 4v10" /></svg>;
    return jsxExample(`EmptyState, EmptyStateHeader, EmptyStateTitle, EmptyStateDescription${media === "none" ? "" : ", EmptyStateMedia"}`,
      `<EmptyState>
  <EmptyStateHeader>${media === "none" ? "" : `
    <EmptyStateMedia variant="${media}">
      <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path d="M4 7l8-4 8 4v10l-8 4-8-4V7Zm0 0 8 4 8-4m-8 4v10" />
      </svg>
    </EmptyStateMedia>`}
    <EmptyStateTitle>{${JSON.stringify(title)}}</EmptyStateTitle>
    <EmptyStateDescription>{${JSON.stringify(description)}}</EmptyStateDescription>
  </EmptyStateHeader>
</EmptyState>`,
      <EmptyState><EmptyStateHeader>
        {media !== "none" && <EmptyStateMedia variant={media}>{icon}</EmptyStateMedia>}
        <EmptyStateTitle>{title}</EmptyStateTitle><EmptyStateDescription>{description}</EmptyStateDescription>
      </EmptyStateHeader></EmptyState>);
  },
};

export const progressProperties: PropertiesDefinition<{ value: "indeterminate" | "0" | "25" | "60" | "100"; label: string }> = {
  slug: "progress",
  initialValues: locale => ({ value: "60", label: locale === "zh" ? "上传进度" : "Upload progress" }),
  fields: (_, locale) => [
    { key: "value", kind: "select", type: "number | null", options: ["indeterminate", "0", "25", "60", "100"], description: locale === "zh" ? "indeterminate 将 value 传为 null。" : "Indeterminate passes null as the value." },
    { key: "label", name: "ProgressLabel.children", kind: "text", type: "ReactNode", label: locale === "zh" ? "进度标签" : "Progress label", description: locale === "zh" ? "说明正在执行的任务。" : "Name the task in progress." },
  ],
  example: ({ value, label }, locale) => {
    const progress = value === "indeterminate" ? null : Number(value);
    const name = label.trim() || (locale === "zh" ? "上传进度" : "Upload progress");
    return jsxExample("Progress, ProgressLabel, ProgressValue",
      `<Progress value={${progress}} locale="${locale}">
  <ProgressLabel>{${JSON.stringify(name)}}</ProgressLabel>
  <ProgressValue />
</Progress>`,
      <div style={{ width: "min(100%, 320px)" }}><Progress value={progress} locale={locale}>
        <ProgressLabel>{name}</ProgressLabel><ProgressValue />
      </Progress></div>);
  },
};

const skeletonWidths = { short: "40%", medium: "70%", full: "100%" };
const skeletonHeights = { line: "var(--space-200)", block: "var(--space-600)" };

export const skeletonProperties: PropertiesDefinition<{ width: keyof typeof skeletonWidths; height: keyof typeof skeletonHeights }> = {
  slug: "skeleton",
  initialValues: () => ({ width: "medium", height: "line" }),
  fields: (_, locale) => [
    { key: "width", name: "style.width", kind: "select", type: "CSS length", options: ["short", "medium", "full"], description: locale === "zh" ? "选择相对于内容区的长度。" : "Choose the width relative to the content area." },
    { key: "height", name: "style.height", kind: "select", type: "CSS length", options: ["line", "block"], description: locale === "zh" ? "按最终内容的高度设置占位。" : "Match the height of the eventual content." },
  ],
  example: ({ width, height }) => {
    const style = { width: skeletonWidths[width], height: skeletonHeights[height] };
    return jsxExample("Skeleton",
      `<div aria-busy="true" style={{ width: "min(100%, 320px)" }}>
  <Skeleton style={${JSON.stringify(style)}} />
</div>`,
      <div aria-busy="true" style={{ width: "min(100%, 320px)" }}><Skeleton style={style} /></div>);
  },
};

const spinnerSizes = { "16px": "var(--space-200)", "24px": "var(--space-300)", "32px": "var(--space-400)" };

export const spinnerProperties: PropertiesDefinition<{ size: keyof typeof spinnerSizes; label: string }> = {
  slug: "spinner",
  initialValues: locale => ({ size: "24px", label: locale === "zh" ? "正在加载" : "Loading" }),
  fields: (_, locale) => [
    { key: "size", name: "style.fontSize", kind: "select", type: "CSS length", options: ["16px", "24px", "32px"], description: locale === "zh" ? "圆环使用 1em，随字体大小缩放。" : "The ring is 1em and scales with the font size." },
    { key: "label", name: "aria-label", kind: "text", label: locale === "zh" ? "加载状态名称" : "Loading status name", description: locale === "zh" ? "填写后会以状态通知辅助技术。已有加载文案时可留空。" : "Name a standalone loading status. Leave empty when another label describes the loading state." },
  ],
  example: ({ size, label }) => {
    const name = label.trim() || undefined;
    const style = { fontSize: spinnerSizes[size] };
    return jsxExample("Spinner", `<Spinner${jsxAttributes({ "aria-label": name })} style={${JSON.stringify(style)}} />`, <Spinner aria-label={name} style={style} />);
  },
};

export const tagProperties: PropertiesDefinition<{ label: string; context: TagContext; mode: TagMode; variant: TagVariant }> = {
  slug: "tag",
  initialValues: locale => ({ label: locale === "zh" ? "低糖" : "Low sugar", context: "content", mode: "light", variant: "filled" }),
  fields: (_, locale) => [
    { key: "label", name: "children", kind: "text", type: "ReactNode", label: locale === "zh" ? "标签文案" : "Tag label" },
    { key: "context", kind: "select", options: ["content", "overlay"] },
    { key: "mode", kind: "select", options: ["light", "dark"] },
    { key: "variant", kind: "select", options: ["filled", "outline"] },
  ],
  example: ({ label, ...props }) => {
    const style = { padding: "var(--space-200)", background: "var(--surface-primary)", borderRadius: "var(--radius-surface-default)" };
    return jsxExample("Tag",
      `<div data-theme="${props.mode}" style={${JSON.stringify(style)}}>
  <Tag${jsxAttributes(props)}>{${JSON.stringify(label)}}</Tag>
</div>`,
      <div data-theme={props.mode} style={style}><Tag {...props}>{label}</Tag></div>);
  },
};
