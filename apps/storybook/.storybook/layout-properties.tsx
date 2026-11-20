import { useState } from "react";
import {
  Button, Card, CardHeader, CardTitle, CardDescription,
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Divider, Drawer, type CardPadding, type CardSurface, type DividerOrientation, type DividerStrength, type DrawerProps,
} from "@yami/design-system";
import type { DocsLocale } from "./component-docs-template";
import { jsxAttributes, jsxExample, type PropertiesDefinition } from "./component-properties";

export const cardProperties: PropertiesDefinition<{ padding: CardPadding; surface: CardSurface; bordered: boolean }> = {
  slug: "card",
  initialValues: () => ({ padding: "md", surface: "primary", bordered: false }),
  fields: () => [
    { key: "padding", kind: "select", options: ["none", "sm", "md", "lg"] },
    { key: "surface", kind: "select", options: ["primary", "secondary", "inverse"] },
    { key: "bordered", kind: "switch" },
  ],
  example: (props, locale) => {
    const title = locale === "zh" ? "配送信息" : "Delivery details";
    const description = locale === "zh" ? "预计两天内送达。" : "Expected within two days.";
    return jsxExample("Card, CardHeader, CardTitle, CardDescription",
      `<Card${jsxAttributes(props)} style={{ width: "100%" }}>
  <CardHeader>
    <CardTitle>{${JSON.stringify(title)}}</CardTitle>
    <CardDescription>{${JSON.stringify(description)}}</CardDescription>
  </CardHeader>
</Card>`,
      <Card {...props} style={{ width: "100%" }}>
        <CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
      </Card>);
  },
};

export const dialogProperties: PropertiesDefinition<{ title: string; showCloseButton: boolean }> = {
  slug: "dialog",
  previewMode: "document",
  initialValues: locale => ({ title: locale === "zh" ? "配送信息" : "Delivery details", showCloseButton: true }),
  fields: (_, locale) => [
    { key: "title", name: "DialogTitle.children", kind: "text", type: "ReactNode", label: locale === "zh" ? "对话框标题" : "Dialog title", description: locale === "zh" ? "显示标题并提供可访问名称。" : "Visible title and accessible name." },
    { key: "showCloseButton", kind: "switch", description: locale === "zh" ? "显示右上角关闭按钮。" : "Show the close button in the upper corner." },
  ],
  example: ({ title, showCloseButton }, locale) => {
    const zh = locale === "zh";
    const trigger = zh ? "查看配送信息" : "View delivery details";
    const description = zh ? "你可以在订单详情中查看最新配送时间。" : "See your order details for the latest delivery estimate.";
    const close = zh ? "关闭" : "Close";
    const name = title.trim() || (zh ? "配送信息" : "Delivery details");
    const content = { showCloseButton, closeLabel: close, lang: locale };
    return jsxExample("Button, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter",
      `<Dialog>
  <DialogTrigger render={<Button />}>{${JSON.stringify(trigger)}}</DialogTrigger>
  <DialogContent${jsxAttributes(content)}>
    <DialogHeader>
      <DialogTitle>{${JSON.stringify(name)}}</DialogTitle>
      <DialogDescription>{${JSON.stringify(description)}}</DialogDescription>
    </DialogHeader>
    <DialogFooter showCloseButton${jsxAttributes({ closeLabel: close })} />
  </DialogContent>
</Dialog>`,
      <Dialog>
        <DialogTrigger render={<Button />}>{trigger}</DialogTrigger>
        <DialogContent {...content}>
          <DialogHeader><DialogTitle>{name}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
          <DialogFooter showCloseButton closeLabel={close} />
        </DialogContent>
      </Dialog>);
  },
};

export const dividerProperties: PropertiesDefinition<{ strength: DividerStrength; orientation: DividerOrientation; inverse: boolean }> = {
  slug: "divider",
  initialValues: () => ({ strength: "default", orientation: "horizontal", inverse: false }),
  fields: () => [
    { key: "strength", kind: "select", options: ["default", "emphasis"] },
    { key: "orientation", kind: "select", options: ["horizontal", "vertical"] },
    { key: "inverse", kind: "switch" },
  ],
  example: (props, locale) => {
    const vertical = props.orientation === "vertical";
    const [first, second] = locale === "zh" ? ["配送", "退货"] : ["Delivery", "Returns"];
    const style = {
      display: "flex",
      flexDirection: vertical ? "row" as const : "column" as const,
      gap: "var(--space-150)",
      color: props.inverse ? "var(--text-inverse)" : undefined,
      background: props.inverse ? "var(--surface-inverse)" : undefined,
      padding: "var(--space-200)",
      width: "min(100%, 320px)",
    };
    const line = vertical ? { height: "var(--space-200)" } : undefined;
    return jsxExample("Divider",
      `<div style={${JSON.stringify(style)}}>
  <span>{${JSON.stringify(first)}}</span>
  <Divider${jsxAttributes(props)}${line ? ` style={${JSON.stringify(line)}}` : ""} />
  <span>{${JSON.stringify(second)}}</span>
</div>`,
      <div style={style}><span>{first}</span><Divider {...props} style={line} /><span>{second}</span></div>);
  },
};

type DrawerValues = {
  direction: "responsive" | "up" | "right" | "down" | "left";
  size: NonNullable<DrawerProps["size"]>;
  showSwipeHandle: boolean;
};

function DrawerPreview({ locale, trigger, title, close, description, drawer }: {
  locale: DocsLocale; trigger: string; title: string; close: string; description: string;
  drawer: Pick<DrawerProps, "size" | "swipeDirection" | "showSwipeHandle">;
}) {
  const [open, setOpen] = useState(false);
  return <>
    <Button onClick={() => setOpen(true)}>{trigger}</Button>
    <Drawer {...drawer} open={open} onClose={() => setOpen(false)} title={title} closeLabel={close} lang={locale}>
      <p>{description}</p>
    </Drawer>
  </>;
}

export const drawerProperties: PropertiesDefinition<DrawerValues> = {
  slug: "drawer",
  previewMode: "document",
  initialValues: () => ({ direction: "responsive", size: "full", showSwipeHandle: false }),
  fields: (_, locale) => [
    { key: "direction", name: "swipeDirection", kind: "select", type: '"up" | "right" | "down" | "left"', options: ["responsive", "up", "right", "down", "left"],
      description: locale === "zh" ? "responsive 使用默认方向。桌面端从右侧打开，移动端从底部打开。" : "Responsive uses the default edge: right on desktop and bottom on mobile." },
    { key: "size", kind: "select", options: ["full", "half", "content"] },
    { key: "showSwipeHandle", kind: "switch" },
  ],
  example: ({ direction, size, showSwipeHandle }, locale) => {
    const [trigger, title, close, description] = locale === "zh"
      ? ["查看配送选项", "配送选项", "关闭", "在这里选择适合的配送方式。"]
      : ["View delivery options", "Delivery options", "Close", "Choose the delivery method that works for you."];
    const drawer = { size, swipeDirection: direction === "responsive" ? undefined : direction, showSwipeHandle };
    return {
      preview: <DrawerPreview {...{ locale, trigger, title, close, description, drawer }} />,
      code: `import { useState } from "react";
import { Button, Drawer } from "@yami/design-system";

export function DeliveryDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{${JSON.stringify(trigger)}}</Button>
      <Drawer open={open} onClose={() => setOpen(false)}${jsxAttributes({ ...drawer, title, closeLabel: close, lang: locale })}>
        <p>{${JSON.stringify(description)}}</p>
      </Drawer>
    </>
  );
}`,
    };
  },
};
