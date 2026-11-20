import { useState } from "react";
import {
  Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem,
  Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose,
  Toaster, createToastManager, TooltipProvider, Tooltip, TooltipTrigger, TooltipContent, type ToastPosition,
} from "@yami/design-system";
import { jsxAttributes, jsxExample, type PropertiesDefinition } from "./component-properties";

type Align = "start" | "center" | "end";
type Side = "top" | "right" | "bottom" | "left";

export const dropdownMenuProperties: PropertiesDefinition<{ align: Align; checked: boolean; disabled: boolean }> = {
  slug: "dropdown-menu",
  previewMode: "document",
  initialValues: () => ({ align: "start", checked: false, disabled: false }),
  fields: (_, locale) => [
    { key: "align", name: "DropdownMenuContent.align", kind: "select", options: ["start", "center", "end"], description: locale === "zh" ? "改变菜单相对触发按钮的对齐方式。" : "Align the menu with its trigger." },
    { key: "checked", name: "DropdownMenuCheckboxItem.defaultChecked", kind: "switch", description: locale === "zh" ? "设置菜单中复选项的初始状态。" : "Set the initial state of the checkbox item." },
    { key: "disabled", name: "DropdownMenuItem.disabled", kind: "switch", description: locale === "zh" ? "禁用菜单中的详情操作。" : "Disable the details action." },
  ],
  example: ({ align, checked, disabled }, locale) => {
    const [trigger, action, option] = locale === "zh" ? ["订单操作", "查看详情", "接收通知"] : ["Order actions", "View details", "Receive notifications"];
    return jsxExample("Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem",
      `<DropdownMenu>
  <DropdownMenuTrigger render={<Button variant="secondary" />}>{${JSON.stringify(trigger)}}</DropdownMenuTrigger>
  <DropdownMenuContent align="${align}">
    <DropdownMenuItem${jsxAttributes({ disabled })}>{${JSON.stringify(action)}}</DropdownMenuItem>
    <DropdownMenuCheckboxItem${jsxAttributes({ defaultChecked: checked })}>{${JSON.stringify(option)}}</DropdownMenuCheckboxItem>
  </DropdownMenuContent>
</DropdownMenu>`,
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="secondary" />}>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align={align}>
          <DropdownMenuItem disabled={disabled}>{action}</DropdownMenuItem>
          <DropdownMenuCheckboxItem key={String(checked)} defaultChecked={checked}>{option}</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>);
  },
};

export const popoverProperties: PropertiesDefinition<{ title: string; align: Align; side: Side }> = {
  slug: "popover",
  previewMode: "document",
  initialValues: locale => ({ title: locale === "zh" ? "配送说明" : "Delivery information", align: "start", side: "bottom" }),
  fields: (_, locale) => [
    { key: "title", name: "PopoverTitle.children", kind: "text", type: "ReactNode", label: locale === "zh" ? "浮层标题" : "Popover title", description: locale === "zh" ? "为浮层提供可访问名称。" : "Name the panel for assistive technology." },
    { key: "align", name: "PopoverContent.align", kind: "select", options: ["start", "center", "end"], description: locale === "zh" ? "沿触发器边缘对齐浮层。" : "Align the panel along the trigger edge." },
    { key: "side", name: "PopoverContent.side", kind: "select", options: ["top", "right", "bottom", "left"], description: locale === "zh" ? "首选展开方向。空间不足时组件可调整方向。" : "Choose the preferred side. The popup can flip to fit." },
  ],
  example: ({ title, align, side }, locale) => {
    const [trigger, name, description, close] = locale === "zh"
      ? ["查看说明", "配送说明", "预计两个工作日内发货。", "关闭"] : ["View information", "Delivery information", "Ships within two business days.", "Close"];
    const label = title.trim() || name;
    return jsxExample("Button, Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose",
      `<Popover>
  <PopoverTrigger render={<Button variant="secondary" />}>{${JSON.stringify(trigger)}}</PopoverTrigger>
  <PopoverContent${jsxAttributes({ align, side })} style={{ gap: "var(--space-150)" }}>
    <div style={{ display: "grid", gap: "var(--space-050)" }}>
      <PopoverTitle>{${JSON.stringify(label)}}</PopoverTitle>
      <PopoverDescription>{${JSON.stringify(description)}}</PopoverDescription>
    </div>
    <PopoverClose render={<Button variant="secondary" size="sm" />}>{${JSON.stringify(close)}}</PopoverClose>
  </PopoverContent>
</Popover>`,
      <Popover>
        <PopoverTrigger render={<Button variant="secondary" />}>{trigger}</PopoverTrigger>
        <PopoverContent align={align} side={side} style={{ gap: "var(--space-150)" }}>
          <div style={{ display: "grid", gap: "var(--space-050)" }}>
            <PopoverTitle>{label}</PopoverTitle>
            <PopoverDescription>{description}</PopoverDescription>
          </div>
          <PopoverClose render={<Button variant="secondary" size="sm" />}>{close}</PopoverClose>
        </PopoverContent>
      </Popover>);
  },
};

type ToastValues = { position: ToastPosition; title: string; description: string; timeout: "3000" | "6000" };
type ToastPreviewProps = Pick<ToastValues, "position" | "title" | "description"> & {
  timeout: number; trigger: string; closeLabel: string; viewportLabel: string;
};

function ToastPreview({ title, description, timeout, trigger, ...toaster }: ToastPreviewProps) {
  const [manager] = useState(createToastManager);
  return <Toaster {...toaster} toastManager={manager}>
    <Button onClick={() => manager.add({ id: "properties-preview", title, description, timeout })}>{trigger}</Button>
  </Toaster>;
}

export const toastProperties: PropertiesDefinition<ToastValues> = {
  slug: "toast",
  previewMode: "document",
  initialValues: locale => locale === "zh"
    ? { position: "bottom-center", title: "已保存", description: "可在收藏夹中查看。", timeout: "6000" }
    : { position: "bottom-center", title: "Saved", description: "Find it in your favorites.", timeout: "6000" },
  fields: (_, locale) => [
    { key: "position", name: "Toaster.position", kind: "select", options: ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"], description: locale === "zh" ? "选择通知在视口中的位置。" : "Choose where notifications appear in the viewport." },
    { key: "title", name: "toast.title", kind: "text", label: locale === "zh" ? "通知标题" : "Notification title", description: locale === "zh" ? "概括操作结果。" : "Summarize the outcome." },
    { key: "description", name: "toast.description", kind: "text", label: locale === "zh" ? "通知说明" : "Notification description", description: locale === "zh" ? "可选的补充信息。" : "Optional supporting information." },
    { key: "timeout", name: "toast.timeout", kind: "select", type: "number", options: ["3000", "6000"], description: locale === "zh" ? "自动关闭的等待时间，单位为毫秒。再次触发可查看最新配置。" : "Milliseconds before dismissal. Trigger a new notification to see the latest settings." },
  ],
  example: ({ position, title, description, timeout }, locale) => {
    const [trigger, closeLabel, viewportLabel, fallback] = locale === "zh"
      ? ["显示通知", "关闭通知", "通知", "已保存"] : ["Show notification", "Close notification", "Notifications", "Saved"];
    const toaster = { position, closeLabel, viewportLabel };
    const options = { id: "properties-preview", title: title.trim() || fallback, description, timeout: Number(timeout) };
    return {
      preview: <ToastPreview {...toaster} title={options.title} description={description} timeout={options.timeout} trigger={trigger} />,
      code: `import { useState } from "react";
import { Button, Toaster, createToastManager } from "@yami/design-system";

export function NotificationExample() {
  const [manager] = useState(createToastManager);
  return (
    <Toaster${jsxAttributes(toaster)} toastManager={manager}>
      <Button onClick={() => manager.add(${JSON.stringify(options)})}>{${JSON.stringify(trigger)}}</Button>
    </Toaster>
  );
}`,
    };
  },
};

export const tooltipProperties: PropertiesDefinition<{ label: string; side: Side; align: Align }> = {
  slug: "tooltip",
  previewMode: "document",
  initialValues: locale => ({ label: locale === "zh" ? "预计两个工作日内发货" : "Ships within two business days", side: "top", align: "center" }),
  fields: (_, locale) => [
    { key: "label", name: "TooltipContent.children", kind: "text", type: "ReactNode", label: locale === "zh" ? "提示文案" : "Tooltip label", description: locale === "zh" ? "将指针悬停或用 Tab 聚焦预览按钮可查看提示。" : "Hover over the preview button or focus it with Tab to see the hint." },
    { key: "side", name: "TooltipContent.side", kind: "select", options: ["top", "right", "bottom", "left"], description: locale === "zh" ? "选择提示相对触发器的首选方向。" : "Choose the preferred side of the trigger." },
    { key: "align", name: "TooltipContent.align", kind: "select", options: ["start", "center", "end"], description: locale === "zh" ? "控制提示沿触发器边缘的位置。" : "Set the position along the trigger edge." },
  ],
  example: ({ label, align, side }, locale) => {
    const trigger = locale === "zh" ? "配送时效" : "Delivery estimate";
    return jsxExample("Button, TooltipProvider, Tooltip, TooltipTrigger, TooltipContent",
      `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button variant="secondary" />}>{${JSON.stringify(trigger)}}</TooltipTrigger>
    <TooltipContent${jsxAttributes({ align, side })}>{${JSON.stringify(label)}}</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
      <TooltipProvider><Tooltip>
        <TooltipTrigger render={<Button variant="secondary" />}>{trigger}</TooltipTrigger>
        <TooltipContent align={align} side={side}>{label}</TooltipContent>
      </Tooltip></TooltipProvider>);
  },
};
