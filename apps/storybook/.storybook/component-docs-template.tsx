import { useContext, useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Copy } from "lucide-react";
import { DocsContext } from "@storybook/addon-docs/blocks";
import { SyntaxHighlighter } from "storybook/internal/components";
import { GLOBALS_UPDATED } from "storybook/internal/core-events";
import { Button } from "@yami/design-system";
import { usesBaseUI } from "./component-docs-scope";
import { ComponentDocsPreview, type DocsPreviewMode } from "./component-docs-preview";
import styles from "./component-docs-template.module.css";

export type DocsLocale = "zh" | "en";
type Locale = DocsLocale;

function CopyButton({ text, locale, page = false }: { text: string; locale: Locale; page?: boolean }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  useEffect(() => {
    if (status === "idle") return;
    const timer = window.setTimeout(() => setStatus("idle"), 2000);
    return () => window.clearTimeout(timer);
  }, [status]);
  const label = status === "copied" ? (locale === "zh" ? "已复制" : "Copied") : status === "failed" ? (locale === "zh" ? "复制失败" : "Copy failed") : page ? (locale === "zh" ? "复制页面" : "Copy Page") : (locale === "zh" ? "复制代码" : "Copy code");
  const Icon = status === "copied" ? Check : Copy;
  const icon = <Icon size={16} strokeWidth={2} aria-hidden="true" />;
  return <Button size="sm" variant="tertiary" leftIcon={page ? icon : undefined} form={page ? "inline" : "icon"} aria-label={label} title={label} onClick={async () => {
    try { await navigator.clipboard.writeText(text); setStatus("copied"); } catch { setStatus("failed"); }
  }}>{page ? label : icon}<span className={styles.srOnly} role="status">{status !== "idle" ? label : ""}</span></Button>;
}

export function CodeBlock({ code, locale, collapsible = false, language = "tsx" }: { code: string; locale: Locale; collapsible?: boolean; language?: "tsx" | "css" | "json" | "bash" | "text" }) {
  const [expanded, setExpanded] = useState(false);
  return <div className={styles.codeBlock} data-expanded={!collapsible || expanded}>
    <div className={styles.codeScroll}>
      <SyntaxHighlighter language={language} useInlineStyles={false} bordered={false} padded={false} copyable={false} showLineNumbers={language === "tsx"} customStyle={{ margin: 0, padding: "var(--space-250)", paddingBlock: "var(--space-150)", background: "transparent", fontSize: "var(--font-size-body-sm)", lineHeight: 1.8 }}>{code}</SyntaxHighlighter>
    </div>
    {(!collapsible || expanded) && <div className={styles.copy}><CopyButton text={code} locale={locale} /></div>}
    {collapsible && <div className={styles.expand}><Button size="sm" variant="primary" inverse aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{locale === "zh" ? (expanded ? "收起代码" : "查看代码") : (expanded ? "Hide Code" : "View Code")}</Button></div>}
  </div>;
}

const installCommand = 'pnpm add "@yami/design-system@workspace:*"';
const installDependency = '{\n  "dependencies": {\n    "@yami/design-system": "workspace:*"\n  }\n}';
const installStyles = 'import "@yami/design-system/styles/fonts.css";\nimport "@yami/design-system/tokens.css";\nimport "@yami/design-system/styles/base.css";';

function installationText(locale: Locale) {
  return {
    intro: locale === "zh" ? "当前组件通过 YAMI 工作区包提供。在同一 monorepo 的消费应用中添加依赖。" : "This component is provided by the YAMI workspace package. Add the dependency in a consuming app within the same monorepo.",
    tabs: locale === "zh" ? ["命令", "手动"] : ["Command", "Manual"],
    styles: locale === "zh" ? "在应用入口引入一次字体、令牌和基础样式。" : "Import fonts, tokens and base styles once in your application entry point.",
  };
}

export function installationMarkdown(locale: Locale) {
  const { intro, tabs, styles } = installationText(locale);
  return [
    intro, tabs[0], "```bash\n" + installCommand + "\n```",
    tabs[1], "```json\n" + installDependency + "\n```",
    styles, "```tsx\n" + installStyles + "\n```",
  ].join("\n\n");
}

export function Installation({ locale }: { locale: Locale }) {
  const [manual, setManual] = useState(false);
  const { intro, tabs, styles: stylesIntro } = installationText(locale);
  return <>
    <p>{intro}</p>
    <div className={styles.tabs} role="group" aria-label={locale === "zh" ? "安装方式" : "Installation method"}>{tabs.map((label, index) => <button key={label} type="button" aria-pressed={manual === Boolean(index)} onClick={() => setManual(Boolean(index))}>{label}</button>)}</div>
    <CodeBlock code={manual ? installDependency : installCommand} language={manual ? "json" : "bash"} locale={locale} />
    <p>{stylesIntro}</p>
    <CodeBlock locale={locale} code={installStyles} />
  </>;
}

export function DocsExampleCard({ code, locale, children, name }: { code?: string; locale: Locale; children: ReactNode; name?: string }) {
  return <div className={styles.example} data-example={name}>
    {children}
    {code && <CodeBlock code={code} locale={locale} collapsible />}
  </div>;
}

export function DocsExample({ code, locale, children, name, previewMode, previewBackground }: { code: string; locale: Locale; children: ReactNode; name?: string; previewMode?: DocsPreviewMode; previewBackground?: string }) {
  return <DocsExampleCard code={code} locale={locale} name={name}>
    <ComponentDocsPreview locale={locale} name={name} mode={previewMode} previewBackground={previewBackground}>{children}</ComponentDocsPreview>
  </DocsExampleCard>;
}

export function DocsApiTable({ locale, rows }: { locale: Locale; rows: [string, string][] }) {
  return <div className={styles.tableScroll}><table><thead><tr><th>{locale === "zh" ? "属性 / 部件" : "Prop / Part"}</th><th>{locale === "zh" ? "说明" : "Description"}</th></tr></thead><tbody>{rows.map(([name, description]) => <tr key={name}><td><code>{name}</code></td><td>{description}</td></tr>)}</tbody></table></div>;
}

export function ComponentDocsTemplate({ name, slug, intro, previous, next, pageText, locale, children }: {
  name: string; slug: string; intro?: ReactNode; previous?: { name: string; path: string }; next?: { name: string; path: string };
  pageText: string; locale: Locale; children: ReactNode;
}) {
  const context = useContext(DocsContext);
  // These examples render directly, so synchronize globals without a story decorator.
  useEffect(() => {
    const sync = ({ globals }: { globals: Record<string, unknown> }) => {
      const root = document.documentElement;
      root.dataset.theme = globals.theme === "dark" ? "dark" : "light";
      root.classList.toggle("dark", globals.theme === "dark");
      root.lang = globals.locale === "en" ? "en" : "zh";
    };
    sync({ globals: context.getStoryContext(context.componentStories()[0]).globals });
    context.channel.on(GLOBALS_UPDATED, sync);
    return () => context.channel.off(GLOBALS_UPDATED, sync);
  }, [context]);
  return <article className={`sb-unstyled ${styles.page}`} data-yami-docs={slug} data-docs-layout={usesBaseUI(slug) ? "base-ui" : undefined}>
    <header className={styles.header}><div><h1>{name}</h1>{typeof intro === "string" ? <p>{intro}</p> : intro}</div><div className={styles.actions}>
      <CopyButton text={pageText} locale={locale} page />
      {previous && <a href={`/?path=/docs/${previous.path}--docs`} target="_top" aria-label={`${locale === "zh" ? "上一个组件：" : "Previous component: "}${previous.name}`}><ArrowLeft size={16} strokeWidth={2} aria-hidden="true" /></a>}
      {next && <a href={`/?path=/docs/${next.path}--docs`} target="_top" aria-label={`${locale === "zh" ? "下一个组件：" : "Next component: "}${next.name}`}><ArrowRight size={16} strokeWidth={2} aria-hidden="true" /></a>}
    </div></header>
    {children}
  </article>;
}
