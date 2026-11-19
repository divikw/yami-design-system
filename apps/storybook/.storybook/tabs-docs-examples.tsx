import { Tabs, TabsContent, TabsList, TabsTrigger, type TabsListProps, type TabsProps } from "@yami/design-system";
import type { DocsLocale } from "./component-docs-template";
import type { GuideExample } from "./component-guide";
import { TabsLevels } from "./tabs-levels-example";
import levelsSource from "./tabs-levels-example.tsx?raw";
import { AccountTabs } from "./tabs-icons-example";
import iconsSource from "./tabs-icons-example.tsx?raw";

const imports = 'import { Tabs, TabsContent, TabsList, TabsTrigger } from "@yami/design-system";';

export function tabsDocsExamples(locale: DocsLocale) {
  const zh = locale === "zh";
  const group = zh ? "商品信息" : "Product information";
  const items = [
    { value: "details", label: zh ? "商品详情" : "Details" },
    { value: "shipping", label: zh ? "配送" : "Shipping" },
    { value: "reviews", label: zh ? "评价" : "Reviews" },
  ];
  function sample(list: Pick<TabsListProps, "variant" | "styleVariant" | "inverse">,
    root: Pick<TabsProps, "orientation" | "activationMode"> = {}, disableReviews = false) {
    const attributes = (props: Record<string, unknown>) => Object.entries(props)
      .map(([key, value]) => value === true ? ` ${key}` : ` ${key}="${value}"`).join("");
    const demo = <Tabs defaultValue="details" {...root}>
      <TabsList {...list} aria-label={group}>
        {items.map(item => <TabsTrigger key={item.value} value={item.value} disabled={disableReviews && item.value === "reviews"}>{item.label}</TabsTrigger>)}
      </TabsList>
      <div hidden>
        {items.map(item => <TabsContent key={item.value} value={item.value} />)}
      </div>
    </Tabs>;
    const jsx = `<Tabs defaultValue="details"${attributes(root)}>
  <TabsList${attributes(list)} aria-label="${group}">
${items.map(item => `    <TabsTrigger value="${item.value}"${disableReviews && item.value === "reviews" ? " disabled" : ""}>${item.label}</TabsTrigger>`).join("\n")}
  </TabsList>
  <div hidden>
${items.map(item => `    <TabsContent value="${item.value}" />`).join("\n")}
  </div>
</Tabs>`;
    return { preview: demo, code: imports + "\n\n" + (list.inverse
      ? '<div style={{ background: "var(--surface-inverse)" }}>\n' + jsx.replace(/^/gm, "  ") + "\n</div>" : jsx) };
  }
  const examples: GuideExample[] = [
    { id: "primary-a", title: zh ? "一级 A · 下划线" : "Primary A · Line",
      description: zh ? "用下划线标出当前商品分区。variant=\"line\" 也可使用此样式。" : 'An underline marks the active section. You can also use variant="line".', ...sample({ variant: "primary", styleVariant: "a" }) },
    { id: "primary-b", title: zh ? "一级 B · 分段" : "Primary B · Segmented",
      description: zh ? "选中项在分段底板上高亮。variant=\"default\" 也可使用此样式。" : 'Highlight the selected segment on a shared track. You can also use variant="default".', ...sample({ variant: "primary", styleVariant: "b" }) },
    { id: "secondary", title: zh ? "二级标签页" : "Secondary",
      description: zh ? "标签栏和底线随标签内容定宽，列表默认无左右内边距。" : "The tab list and its divider size to the labels, with no default side padding.", ...sample({ variant: "secondary" }) },
    { id: "tertiary", title: zh ? "三级标签页" : "Tertiary",
      description: zh ? "用紧凑的胶囊标签切换内容。" : "Use compact pills to switch content.", ...sample({ variant: "tertiary" }) },
    { id: "vertical", title: zh ? "纵向排列" : "Vertical",
      description: zh ? "用上下方向键切换纵向排列的标签。" : "Navigate the vertical tabs with the up and down arrows.", ...sample({ variant: "secondary" }, { orientation: "vertical" }) },
    { id: "disabled", title: zh ? "禁用项" : "Disabled",
      description: zh ? "评价分区暂不可用，方向键会跳过该项。" : "Reviews is unavailable and is skipped during keyboard navigation.", ...sample({ variant: "primary", styleVariant: "b" }, {}, true) },
    { id: "icons", title: zh ? "带图标" : "Icons", description: zh ? "图标与文字一起标识账户分区。" : "Pair icons with text to identify account sections.",
      preview: <AccountTabs locale={locale} />, code: iconsSource.trim() + `\n\n<AccountTabs locale="${locale}" />` },
    { id: "inverse", title: zh ? "反色背景" : "Inverse surface", description: zh ? "在反色表面上使用 inverse，选中项和文字随主题适配。" : "Use inverse on an inverse surface to adapt the active tab and text to the theme.",
      previewBackground: "var(--surface-inverse)", ...sample({ variant: "tertiary", inverse: true }) },
    { id: "skeleton", title: zh ? "骨架加载" : "Loading skeleton", description: zh ? "商品分区加载时显示占位标签。" : "Show placeholder tabs while product sections load.",
      preview: <Tabs><TabsList variant="primary" styleVariant="b" skeleton skeletonCount={3} /></Tabs>,
      code: 'import { Tabs, TabsList } from "@yami/design-system";\n\n<Tabs>\n  <TabsList variant="primary" styleVariant="b" skeleton skeletonCount={3} />\n</Tabs>' },
    { id: "manual", title: zh ? "手动激活" : "Manual activation", description: zh ? "用方向键移动焦点，再按 Enter 或空格切换内容。" : "Move focus with the arrow keys, then press Enter or Space to switch panels.",
      ...sample({ variant: "secondary" }, { activationMode: "manual" }) },
  ];
  return { lead: { preview: <TabsLevels locale={locale} />, code: levelsSource.trim() + `\n\n<TabsLevels locale="${locale}" />` }, examples };
}
