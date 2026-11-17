import { SheetExample, SheetFilterExample } from "../../../packages/design-system/components/Sheet/examples";
import { ComponentGuide, type GuideExample } from "./component-guide";
import type { DocsLocale } from "./component-docs-template";
import styles from "./component-guide.module.css";

export function SheetDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const examples: GuideExample[] = [false, true].map(full => ({
    id: full ? "full-height" : "basic",
    title: full ? (zh ? "全高与滚动" : "Full height and scrolling") : (zh ? "基础用法" : "Basic"),
    description: full
      ? (zh ? "移动端填满安全高度，顶部至少保留 48px。标题、说明和操作区固定，正文独立滚动；桌面端贴右满高。" : "Fills the safe mobile height with at least 48px above. The heading, description and actions stay fixed while content scrolls; desktop stays right-aligned and full-height.")
      : (zh ? "移动端贴底显示，至少半屏；桌面端贴右满高，宽度 480px。点击遮罩、关闭按钮或按 Escape 请求关闭。" : "Bottom-aligned on mobile with a half-screen minimum; right-aligned and full-height on desktop, 480px wide. Outside presses, Close and Escape request dismissal."),
    preview: <div className={styles.row}><SheetExample locale={locale} full={full} /></div>,
    code: `import { useState } from "react";
import { Sheet, Button } from "@yami/design-system";

function Example() {
  const [open, setOpen] = useState(false);
  return <div lang="${locale}">
    <Button variant="secondary" onClick={() => setOpen(true)}>${zh ? "查看说明" : "View details"}</Button>
    <Sheet open={open} title="${zh ? "配送说明" : "Delivery details"}" closeLabel="${zh ? "关闭" : "Close"}"
      description="${zh ? "下单前请核对以下信息。" : "Review these details before ordering."}"
      size="${full ? "full" : "content"}" lang="${locale}" onClose={() => setOpen(false)}
      footer={<div style={{ padding: "var(--space-200)" }}>
        <Button form="full" size="md" onClick={() => setOpen(false)}>${zh ? "知道了" : "Got it"}</Button>
      </div>}>
      {Array.from({ length: ${full ? 24 : 1} }, (_, index) => <p key={index} style={{ margin: 0 }}>
        ${zh ? "请核对配送地址和联系电话。配送进度可在订单详情中查看。" : "Check your delivery address and phone number. Track delivery in your order details."}
      </p>)}
    </Sheet>
  </div>;
}`,
  }));
  examples.push({
    id: "child-view", title: zh ? "子页面返回" : "Child view",
    description: zh ? "子页面复用同一个弹层。返回按钮与 Escape 回到父页面，遮罩关闭整个弹层。选中状态与返回后的入口焦点由宿主管理。" : "A child view reuses the same sheet. Back and Escape return to the parent; outside presses close the sheet. The host owns selection and restores the parent entry focus.",
    preview: <div className={styles.row}><SheetFilterExample locale={locale} /></div>,
    code: `import { useRef, useState } from "react";
import { Sheet, Button, Checkbox } from "@yami/design-system";

function Filters() {
  const [open, setOpen] = useState(false);
  const [child, setChild] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const entry = useRef<HTMLButtonElement>(null);
  const goBack = () => {
    setChild(false);
    requestAnimationFrame(() => entry.current?.focus());
  };
  return <div lang="${locale}">
    <Button variant="secondary" onClick={() => { setChild(false); setOpen(true); }}>${zh ? "全部筛选" : "All filters"}</Button>
    <Sheet open={open} title={child ? "${zh ? "品牌" : "Brand"}" : "${zh ? "全部筛选" : "All filters"}"}
      closeLabel="${zh ? "关闭筛选" : "Close filters"}" onClose={() => setOpen(false)} lang="${locale}" contentPadding="compact"
      back={child ? { label: "${zh ? "返回全部筛选" : "Back to filters"}", onClick: goBack } : undefined}
      footer={<div style={{ padding: "var(--space-200)" }}><Button form="full" size="md" onClick={() => setOpen(false)}>${zh ? "查看结果" : "View results"}</Button></div>}>
      <div hidden={child}>
        <Button ref={entry} variant="tertiary" form="full" onClick={() => setChild(true)}>${zh ? "品牌" : "Brand"} ({brands.length})</Button>
      </div>
      {child && <div role="group" aria-label="${zh ? "品牌选项" : "Brand options"}">
        {["SKIN1004", "COSRX", "Anua"].map(brand => <label key={brand} style={{ display: "flex", alignItems: "center", gap: "var(--space-100)", minHeight: 48, padding: "var(--space-100)" }}>
          <Checkbox checked={brands.includes(brand)} onCheckedChange={checked => setBrands(current => checked ? [...current, brand] : current.filter(item => item !== brand))} />{brand}
        </label>)}
      </div>}
    </Sheet>
  </div>;
}`,
  });
  return <ComponentGuide previewMode="document" name="Sheet" slug="sheet" locale={locale}
    intro={zh ? "用于详情、筛选和子页面的响应式模态容器。移动端从底部展示，桌面端从右侧展示，交互由 Base UI 管理。" : "A responsive modal for details, filters and child views. Bottom-aligned on mobile and right-aligned on desktop, powered by Base UI."}
    previous={{ name: "Select", path: "yami-components-forms-select" }} next={{ name: "Shortcut Rail", path: "yami-components-navigation-shortcut-rail" }}
    composition={"Sheet (open / title / onClose)\n├── Header + Close / Back + Description (internal)\n├── children (scrolling content)\n└── footer (caller-owned actions)"}
    examples={examples}
    apiNote={zh ? "保持 YAMI 的受控接口，内部使用 Base UI Dialog。根节点为 Portal 中的 div，原生 showModal、close 和 method=dialog 不再适用。Sheet 不管理筛选草稿、保存或业务导航；简单短任务使用 Dialog，重要确认使用 AlertDialog。" : "Preserves the YAMI controlled API, backed by Base UI Dialog. The root is a portalled div; native showModal, close and method=dialog no longer apply. Hosts own drafts, saving and navigation. Use Dialog for short tasks and AlertDialog for critical confirmation."}
    api={[
      ["initialFocus / finalFocus", zh ? "覆盖默认初始和返回焦点；用于自定义标题区或快捷键入口。" : "Override initial/return focus targets for custom headers or shortcut openers."],
      ["open / onClose", zh ? "必填；受控可见性与关闭请求，宿主设置 open=false 完成关闭。" : "Required controlled visibility and close request; set open=false to close."],
      ["title / closeLabel / description", zh ? "可见标题、关闭按钮名称及可选的固定标题说明。" : "Visible heading, localized Close name and optional fixed supporting description."],
      ["size", zh ? "content（默认）：至少 50dvh；full：填满安全高度。PC 贴右满高，宽度 480px。" : "content (default): at least 50dvh; full: fills safe height. Desktop is right-aligned, full-height and 480px wide."],
      ["contentPadding", zh ? "default：左右 16px；compact：8px；none：由内容提供内边距。" : "default: 16px horizontal padding; compact: 8px; none: content owns its padding."],
      ["back", zh ? "{ label, onClick }；替换关闭按钮。Escape 返回父页面，遮罩关闭整个弹层。" : "{ label, onClick } replaces Close. Escape returns to the parent; outside presses close the sheet."],
      ["children / footer", zh ? "可滚动正文与可选固定操作区。footer 自行提供按钮布局和内边距。" : "Scrolling body and optional fixed actions. The footer owns its button layout and padding."],
      ["desktopPlacement", zh ? "right（默认）：桌面端贴右满高；center 保留兼容已有调用。新的居中任务使用 Dialog。" : "right (default): a full-height desktop edge panel; center remains for existing callers. Use Dialog for new centered tasks."],
      ["id / className / style / lang", zh ? "传递到弹层 div；保留 data-sheet 和 data-slot 钩子。" : "Passed to the popup div; data-sheet and data-slot hooks remain."],
    ]}
    reference={{ label: "Base UI Dialog", href: "https://base-ui.com/react/components/dialog" }} />;
}
