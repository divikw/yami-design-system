import { DrawerExample } from "../../../packages/design-system/components/Drawer/examples";
import type { ComponentProps } from "react";
import { NestedDrawers } from "./drawer-nested-example";
import nestedSource from "./drawer-nested-example.tsx?raw";
import { ResponsivePanel } from "./drawer-responsive-example";
import responsiveSource from "./drawer-responsive-example.tsx?raw";
import responsiveStyles from "./drawer-responsive-example.module.css?raw";
import { ComponentGuide, type GuideExample } from "./component-guide";
import type { DocsLocale } from "./component-docs-template";
import styles from "./component-guide.module.css";

export function DrawerDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const title = zh ? "抽屉" : "Drawer";
  const snippet = (props: string, trigger = zh ? "打开" : "Open") => `import { useState } from "react";
import { Button, Drawer, useDesktopViewport } from "@yami/design-system";

function DrawerExample() {
  const actionSize = useDesktopViewport() ? "md" : "sm";
  const [open, setOpen] = useState(false);
  return <>
    <Button size={actionSize} onClick={() => setOpen(true)}>${trigger}</Button>
    <Drawer open={open}${props ? " " + props : ""} lang="${locale}" title="${title}"
      closeLabel="${zh ? "关闭" : "Close"}" onClose={() => setOpen(false)}>
      <p>${zh ? "按 Escape 或点击关闭按钮返回页面。" : "Press Escape or use the close button to return to the page."}</p>
    </Drawer>
  </>;
}`;
  const row = (children: React.ReactNode) => <div className={styles.row}>{children}</div>;
  function example(id: string, heading: string, description: string, props: ComponentProps<typeof DrawerExample>, codeProps: string): GuideExample {
    return { id, title: heading, description, preview: row(<DrawerExample {...props} locale={locale} />), code: snippet(codeProps) };
  }
  const directions = [
    ["up", zh ? "上" : "Top"], ["right", zh ? "右" : "Right"],
    ["down", zh ? "下" : "Bottom"], ["left", zh ? "左" : "Left"],
  ] as const;
  const examples: GuideExample[] = [
    example("basic", zh ? "基础用法" : "Basic", zh ? "默认在桌面端贴右展示，在移动端从底部展开至可用全高。" : "By default, the drawer opens on the right on desktop and at full available height from the bottom on mobile.", {}, ""),
    example("content-height", zh ? "内容高度" : "Content height", zh ? "垂直面板按正文调整高度，最小为半屏。内容超出可用高度时独立滚动。" : "Vertical panels fit the content with a half-screen minimum. Overflowing content scrolls independently.", { swipeDirection: "down", size: "content" }, 'swipeDirection="down" size="content"'),
    example("custom-sizes", zh ? "自定义尺寸" : "Custom sizes", zh ? "通过 style 或 className 调整面板尺寸。此侧栏最大宽度为 320px。" : "Use style or className to size the panel. This side drawer is at most 320px wide.", { swipeDirection: "right", style: { width: "min(320px, 85vw)" } }, 'swipeDirection="right" style={{ width: "min(320px, 85vw)" }}'),
    {
      id: "position", title: zh ? "打开方向" : "Position",
      description: zh ? "选择一侧打开抽屉。沿面板所在边缘的方向拖动可以关闭。" : "Choose an edge to open the drawer. Swipe toward that edge to dismiss it.",
      preview: row(directions.map(([direction, label]) => <DrawerExample key={direction} locale={locale} swipeDirection={direction} size="content" trigger={label} />)),
      code: snippet('swipeDirection={direction} size="content"', "{label}").replace("function DrawerExample()", 'function DirectionExample({ direction, label }: { direction: "up" | "right" | "down" | "left"; label: string })') + "\n\n<>\n" + directions.map(([direction, label]) => `  <DirectionExample direction="${direction}" label="${label}" />`).join("\n") + "\n</>",
    },
    example("swipe-handle", zh ? "拖动手柄" : "Swipe handle", zh ? "向下拖动面板顶部的手柄可以关闭抽屉。" : "Drag the handle at the top of the panel down to dismiss it.", { swipeDirection: "down", size: "content", showSwipeHandle: true }, 'swipeDirection="down" size="content" showSwipeHandle'),
    { id: "nested", title: zh ? "嵌套抽屉" : "Nested drawers", description: zh ? "填写备注后打开详情。关闭内层抽屉，焦点回到父面板的入口，备注仍然保留。" : "Enter a note and open the details. Closing the inner drawer restores focus to its opener and preserves the note.", preview: row(<NestedDrawers lang={locale} />), code: nestedSource.trim() + `\n\n<NestedDrawers lang="${locale}" />` },
    example("snap-points", zh ? "多档停靠" : "Snap points", zh ? "拖动手柄，在半屏、四分之三屏和可用全高之间切换。也可聚焦手柄后按方向键。" : "Drag between half, three-quarter and full available height, or focus the handle and use the arrow keys.", { swipeDirection: "down", snapPoints: [0.5, 0.75, 1] }, 'swipeDirection="down" snapPoints={[0.5, 0.75, 1]}'),
    { id: "responsive", title: zh ? "响应式组合" : "Responsive dialog", description: zh ? "桌面端打开居中的 Dialog，移动端打开可从半屏拖到全屏的 Drawer。" : "Use a centered Dialog on desktop and a bottom Drawer with half and full snap points on mobile.", preview: row(<ResponsivePanel lang={locale} />), code: responsiveSource.trim() + `\n\n<ResponsivePanel lang="${locale}" />\n\n/* drawer-responsive-example.module.css\n${responsiveStyles.trim()}\n*/` },
  ];
  return <ComponentGuide name="Drawer" slug="drawer" locale={locale} previewMode="document"
    intro={zh ? "在当前页面展示补充内容。抽屉在桌面端从右侧打开，在移动端从底部打开。" : "Show additional content on the current page. The drawer opens from the right on desktop and from the bottom on mobile."}
    previous={{ name: "Divider", path: "yami-components-layout-divider" }}
    next={{ name: "DropdownMenu", path: "yami-components-layout-dropdown-menu" }}
    composition={zh ? "Drawer\n├── 标题、说明与关闭或返回按钮\n├── children（可滚动正文）\n└── footer（固定操作区）" : "Drawer\n├── Title, description and Close or Back\n├── children (scrolling content)\n└── footer (fixed actions)"}
    examples={examples}
    apiNote={zh ? "PC 从 1024px 起展示 480px 宽的右侧面板。移动端展开后，顶部至少留出 48px。" : "From 1024px wide, the desktop panel occupies 480px on the right. Expanded mobile panels leave at least 48px above them."}
    api={[
      ["open / onClose", zh ? "由宿主管理打开状态。点击关闭、按 Escape 或点击遮罩会请求关闭。" : "The host controls visibility. Close, Escape or an outside press requests dismissal."],
      ["size", zh ? "full（默认）以可用全高打开，content 随内容调整，half 以半屏打开并支持拖动。" : "full (default) opens at the available full height, content fits the body, and half starts at a draggable half height."],
      ["title / description / closeLabel", zh ? "标题、可选说明和带本地化名称的关闭按钮。标题栏与默认正文对齐。" : "The header aligns with the default body and contains the title, optional description and localized Close button."],
      ["children / contentPadding / footer", zh ? "正文为 16px，独立滚动。默认四边内边距在 PC（≥1024px）为 24px，移动端为 16px。也可选 compact 或 none。footer 固定在底部。" : "The 16px body scrolls independently. Default padding on all sides is 24px from 1024px wide and 16px below. Other padding options are compact and none. The footer stays visible."],
      ["swipeDirection / showSwipeHandle", zh ? "指定 up、right、down 或 left。showSwipeHandle 显示拖动手柄，有停靠点时默认显示。" : "Set up, right, down or left. showSwipeHandle displays a grip and defaults on for snap points."],
      ["modal / disablePointerDismissal", zh ? "modal 默认为 true。false 允许页面交互，trap-focus 仅限制焦点。disablePointerDismissal 可阻止外部点击关闭。" : "modal defaults to true. false allows page interaction and trap-focus confines focus only. disablePointerDismissal prevents outside dismissal."],
      ["snapPoints / snapPoint / onSnapPointChange", zh ? "垂直方向支持从小到大排列的视口比例或 px、rem 高度。通过 snapPoint 控制当前档位，或用 defaultSnapPoint 指定初始档位。" : "Vertical drawers accept ascending viewport fractions or px/rem heights. Control the active stop with snapPoint or set the initial stop with defaultSnapPoint."],
      ["back", zh ? "传入 label 和 onClick 后，返回按钮及 Escape 返回上一级。" : "Pass label and onClick to return to a parent view with Back or Escape."],
      ["initialFocus / finalFocus / onAfterClose", zh ? "指定打开及关闭时的焦点。原入口消失时，可在退场后聚焦其他元素。" : "Override the focus targets. When the opener disappears, use onAfterClose to focus a fallback."],
    ]}
    reference={{ label: "shadcn/ui · Base UI Drawer", href: "https://ui.shadcn.com/docs/components/base/drawer" }} />;
}
