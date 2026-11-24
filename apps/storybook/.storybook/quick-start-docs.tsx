import { useContext, useEffect, useState } from "react";
import { DocsContext } from "@storybook/addon-docs/blocks";
import { GLOBALS_UPDATED } from "storybook/internal/core-events";
import { CodeBlock, ComponentDocsTemplate } from "./component-docs-template";

const installCommand = 'pnpm add "@yami/design-system@workspace:*"';
const packageJson = JSON.stringify({ dependencies: { "@yami/design-system": "workspace:*" } }, null, 2);
const styleImports = `import "@yami/design-system/styles/fonts.css";
import "@yami/design-system/tokens.css";
import "@yami/design-system/styles/base.css";`;

export function QuickStartDocsPage() {
  const { channel } = useContext(DocsContext);
  const [locale, setLocale] = useState<"zh" | "en">(() =>
    channel.last(GLOBALS_UPDATED)?.[0]?.userGlobals?.locale === "en" ? "en" : "zh",
  );
  useEffect(() => {
    const sync = ({ userGlobals }: { userGlobals: Record<string, unknown> }) => setLocale(userGlobals.locale === "en" ? "en" : "zh");
    channel.on(GLOBALS_UPDATED, sync);
    return () => channel.off(GLOBALS_UPDATED, sync);
  }, [channel]);

  const zh = locale === "zh";
  return <ComponentDocsTemplate name={zh ? "快速开始" : "Quick Start"} slug="quick-start" locale={locale}>
    <section>
      <h2 id="添加工作区依赖--add-the-workspace-dependency">{zh ? "添加工作区依赖" : "Add the workspace dependency"}</h2>
      <p>{zh ? "在同一个 monorepo 中，从使用组件的应用目录运行以下命令。" : "Run this command from the consuming app’s directory in the same monorepo."}</p>
      <CodeBlock code={installCommand} locale={locale} language="bash" />
      <p>{zh ? <>也可以在应用的 <code>package.json</code> 中添加以下依赖，再运行 <code>pnpm install</code>。</>
        : <>You can also add this dependency to the app’s <code>package.json</code> and run <code>pnpm install</code>.</>}</p>
      <CodeBlock code={packageJson} locale={locale} language="json" />
    </section>
    <section>
      <h2 id="引入全局样式--import-global-styles">{zh ? "引入全局样式" : "Import global styles"}</h2>
      <p>{zh ? "在应用入口按以下顺序引入字体、设计令牌和基础样式。每个应用只需配置一次。"
        : "Import the fonts, design tokens, and base styles in this order once at the app entry point."}</p>
      <CodeBlock code={styleImports} locale={locale} />
    </section>
  </ComponentDocsTemplate>;
}
