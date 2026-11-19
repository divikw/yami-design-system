import type { ReactNode } from "react";
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@yami/design-system";
import { ComponentGuide, type GuideExample } from "./component-guide";
import type { DocsLocale } from "./component-docs-template";
import { LibraryHint } from "../../../packages/design-system/components/Tooltip/examples";
import { SaveExample } from "./tooltip-save-example";
import saveSource from "./tooltip-save-example.tsx?raw";

const outline = { border: "var(--stroke-default) solid var(--border-default)" };
const imports = 'import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@yami/design-system";';
const button = `<Button variant="tertiary" size="sm" style={${JSON.stringify(outline, null, 2)}} />`;
const sides = ["left", "top", "bottom", "right"] as const;

function center(preview: ReactNode) {
  return <div style={{ display: "grid", justifyItems: "center" }}>{preview}</div>;
}

export function TooltipDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const hover = zh ? "悬停" : "Hover";
  const hint = zh ? "添加到资料库" : "Add to library";
  const disabled = zh ? "已禁用" : "Disabled";
  const reason = zh ? "请先选择商品。" : "Select a product first.";
  const names = zh ? ["左", "上", "下", "右"] : ["Left", "Top", "Bottom", "Right"];
  const leadCode = `${imports}\n\n<TooltipProvider>\n  <Tooltip>\n    <TooltipTrigger render={${button}}>${hover}</TooltipTrigger>\n    <TooltipContent>${hint}</TooltipContent>\n  </Tooltip>\n</TooltipProvider>`;
  const samples: GuideExample[] = [
    { id: "dismissible", title: zh ? "默认显示，可关闭" : "Initially open with a close button",
      description: zh ? "提示默认展开，点击页面其他区域时继续显示。点击关闭按钮或按 Escape 收起，再点击触发器可重新打开。" : "The tip opens on arrival and stays visible when you click elsewhere. Close it with the close button or Escape, then press the trigger to reopen it.",
      code: `import { Button, DismissibleTooltip } from "@yami/design-system";

<DismissibleTooltip
  trigger={<Button variant="secondary" size="sm">${zh ? "资料库提示" : "Library tips"}</Button>}
  closeLabel="${zh ? "关闭提示" : "Close tip"}"
>
  ${zh ? "可以将喜欢的内容添加到资料库。" : "Save favorites to your library."}
</DismissibleTooltip>`,
      preview: <LibraryHint locale={locale} /> },
    { id: "side", title: zh ? "显示方向" : "Side", description: zh ? "悬停或用 Tab 聚焦按钮可比较四个方向。空间不足时，箭头随浮层一起调整。" : "Hover or tab through the four triggers. The arrow follows the popup when the preferred side cannot fit.",
      code: `${imports}\n\n<TooltipProvider>\n  <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-100)" }}>\n    {(["left", "top", "bottom", "right"] as const).map((side, index) => (\n      <Tooltip key={side}>\n        <TooltipTrigger render={${button}}>{${JSON.stringify(names)}[index]}</TooltipTrigger>\n        <TooltipContent side={side}>{${JSON.stringify(names)}[index]}</TooltipContent>\n      </Tooltip>\n    ))}\n  </div>\n</TooltipProvider>`,
      preview: <TooltipProvider><div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "var(--space-100)" }}>{sides.map((side, i) =>
        <Tooltip key={side}><TooltipTrigger render={<Button size="sm" variant="tertiary" style={outline} />}>{names[i]}</TooltipTrigger><TooltipContent side={side}>{names[i]}</TooltipContent></Tooltip>
      )}</div></TooltipProvider> },
    { id: "shortcut", title: zh ? "键盘快捷键" : "With keyboard shortcut",
      description: zh ? "聚焦保存按钮后可使用提示中的快捷键。示例内会显示保存成功的勾选图标。" : "Focus the save button to use its displayed shortcut. A checkmark confirms the action in this example.",
      code: saveSource, preview: <SaveExample locale={locale} /> },
    { id: "disabled", title: zh ? "禁用按钮" : "Disabled button",
      description: zh ? "由可聚焦的外层元素接收悬停和键盘焦点，按钮保持禁用。触屏上的必要说明也应放在控件旁。" : "A focusable wrapper receives hover and keyboard focus while the action stays disabled. Keep essential explanations visible on touch screens.",
      code: `${imports}\n\n<TooltipProvider>\n  <Tooltip>\n    <TooltipTrigger render={<span tabIndex={0} role="button" aria-disabled="true" aria-label="${disabled}" style={{ display: "inline-flex" }} />}>\n      <Button disabled size="sm" tabIndex={-1} aria-hidden="true" style={{ pointerEvents: "none" }}>${disabled}</Button>\n    </TooltipTrigger>\n    <TooltipContent>${reason}</TooltipContent>\n  </Tooltip>\n</TooltipProvider>`,
      preview: <TooltipProvider><Tooltip><TooltipTrigger render={<span tabIndex={0} role="button" aria-disabled="true" aria-label={disabled} style={{ display: "inline-flex" }} />}>
        <Button disabled size="sm" tabIndex={-1} aria-hidden="true" style={{ pointerEvents: "none" }}>{disabled}</Button>
      </TooltipTrigger><TooltipContent>{reason}</TooltipContent></Tooltip></TooltipProvider> },
  ];
  return <ComponentGuide name="Tooltip" slug="tooltip" locale={locale} previewMode="document"
    previous={{ name: "Toast", path: "yami-components-data-display-toast" }}
    intro={zh ? "为可聚焦控件提供简短提示，支持悬停、键盘聚焦和 Escape 关闭。" : "Show a short supplementary hint on hover or keyboard focus. Escape dismisses it."}
    leadExample={{ code: leadCode, preview: center(<TooltipProvider><Tooltip><TooltipTrigger render={<Button variant="tertiary" size="sm" style={outline} />}>{hover}</TooltipTrigger><TooltipContent>{hint}</TooltipContent></Tooltip></TooltipProvider>) }}
    usageCode={leadCode} composition={"TooltipProvider\n└── Tooltip\n    ├── TooltipTrigger\n    └── TooltipContent"} examples={samples.map(example => ({ ...example, preview: center(example.preview) }))}
    apiNote={zh ? "触发器需要自己的可访问名称。" : "Give every trigger its own accessible name."}
    api={[
      ["DismissibleTooltip", zh ? "trigger 指定触发按钮，closeLabel 命名关闭按钮。defaultOpen 默认为 true，也可使用 open 和 onOpenChange 受控管理。" : "Supply a trigger button and a closeLabel. defaultOpen defaults to true. Use open and onOpenChange for controlled visibility."],
      ["TooltipProvider.delay", zh ? "悬停打开的延迟，默认 0ms。" : "Hover delay in milliseconds. Defaults to 0."],
      ["Tooltip.open / defaultOpen / onOpenChange", zh ? "受控或非受控的开关状态和回调。" : "Controlled or uncontrolled open state and change callback."],
      ["TooltipContent.alignOffset", zh ? "沿对齐轴的偏移量，默认 0px。" : "Offset along the alignment axis, default 0px."],
      ["TooltipTrigger.render", zh ? "组合自定义触发器。" : "Compose a custom trigger."],
      ["TooltipContent.side / align / sideOffset", zh ? "默认上方居中，偏移 4px。空间有限时自动避让。" : "Defaults to top, center and a 4px offset. Placement adapts to available space."],
    ]} reference={{ label: "Base UI Tooltip", href: "https://base-ui.com/react/components/tooltip" }} />;
}
