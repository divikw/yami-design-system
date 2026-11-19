import type { DocsLocale } from "./component-docs-template";

export const popoverApi: Record<DocsLocale, [string, string][]> = {
  zh: [
    ["Popover.open", "受控打开状态。传入时，由调用方更新状态。"],
    ["Popover.defaultOpen", "非受控模式下的初始打开状态，默认为 false。"],
    ["Popover.onOpenChange", "请求打开或关闭时触发，接收新的打开状态和事件详情。"],
    ["Popover.children", "组合触发器与浮层内容。使用 PopoverTitle 或 aria-label 为内容命名。"],
    ["PopoverTrigger.render", "使用 YAMI Button 等组件作为触发器，并保留触发器的交互和无障碍属性。"],
    ["PopoverContent.side / align", "设置浮层相对于触发器的位置，默认在下方起始对齐（bottom / start）。"],
    ["PopoverContent.sideOffset / alignOffset", "设置主轴和对齐轴的偏移量，默认分别为 4px 和 0px。"],
    ["PopoverContent.collisionPadding", "浮层与碰撞边界之间的留白，默认为 16px。"],
    ["PopoverContent.style / className", "内容四周默认使用 12px 内边距。可通过 padding 统一设置，或用 paddingBlock 和 paddingInline 分别设置上下和左右间距。"],
    ["PopoverContent.container", "指定 Portal 的挂载容器，可用于嵌套在原生 dialog 内的浮层。"],
    ["PopoverTitle", "提供浮层标题和可访问名称。"],
    ["PopoverDescription", "提供与浮层关联的补充说明。"],
    ["PopoverClose", "可选的关闭按钮。通过 render 组合 YAMI Button；仅显示图标时，用 aria-label 提供名称。"],
  ],
  en: [
    ["Popover.open", "Controlled open state. When supplied, the caller updates the state."],
    ["Popover.defaultOpen", "Initial open state in uncontrolled mode. Defaults to false."],
    ["Popover.onOpenChange", "Called when opening or closing is requested, with the next open state and event details."],
    ["Popover.children", "Compose the trigger and content. Name the content with PopoverTitle or aria-label."],
    ["PopoverTrigger.render", "Use a component such as YAMI Button as the trigger while retaining trigger behavior and accessibility attributes."],
    ["PopoverContent.side / align", "Position the popup relative to the trigger. Defaults to bottom / start."],
    ["PopoverContent.sideOffset / alignOffset", "Set the offsets along the side and alignment axes. Defaults to 4px and 0px, respectively."],
    ["PopoverContent.collisionPadding", "Space between the popup and its collision boundary. Defaults to 16px."],
    ["PopoverContent.style / className", "Content padding defaults to 12px on all sides. Set padding for all sides, or paddingBlock and paddingInline for each axis."],
    ["PopoverContent.container", "Set the Portal container, for example when nesting the popup in a native dialog."],
    ["PopoverTitle", "Provide the popup title and accessible name."],
    ["PopoverDescription", "Provide an accessible description of the popup."],
    ["PopoverClose", "Optional close control. Compose it with a YAMI Button using render. Give icon-only buttons an accessible name with aria-label."],
  ],
};
