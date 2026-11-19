import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button";
import { Input } from "../Input";
import { Drawer, type DrawerProps } from "./Drawer";

type Mode = "default" | "empty" | "loading" | "error" | "long" | "child";
function Demo({ locale = "zh", states = false }: { locale?: "zh" | "en"; states?: boolean }) {
  const zh = locale === "zh";
  const [mode, setMode] = useState<Mode | null>(null);
  const [child, setChild] = useState(false);
  const entry = useRef<HTMLButtonElement>(null);
  const labels: Record<Mode, string> = zh
    ? { default: "默认", empty: "空内容", loading: "加载中", error: "错误", long: "长内容与固定操作栏", child: "子页面" }
    : { default: "Default", empty: "Empty", loading: "Loading", error: "Error", long: "Long content and fixed footer", child: "Child view" };
  function back() {
    setChild(false);
    requestAnimationFrame(() => entry.current?.focus());
  }
  return <div lang={locale} style={{ display: "grid", minHeight: "100dvh", boxSizing: "border-box", placeItems: "center", padding: "var(--space-300)" }}>
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "var(--space-200)" }}>
      {(states ? Object.keys(labels) as Mode[] : ["default" as const]).map((value) => <Button key={value} onClick={() => { setMode(value); setChild(value === "child"); }}>{states ? labels[value] : zh ? "打开" : "Open"}</Button>)}
    </div>
    <Drawer size="half" lang={locale} open={mode !== null} title={child ? zh ? "详情" : "Details" : zh ? "抽屉" : "Drawer"} closeLabel={zh ? "关闭" : "Close"} onClose={() => setMode(null)}
      back={child ? { label: zh ? "返回" : "Back", onClick: back } : undefined}
      footer={<div style={{ padding: "var(--space-200)" }}><Button size="lg" form="full" onClick={() => setMode(null)}>{zh ? "完成" : "Done"}</Button></div>}>
      <div hidden={child}>
        {mode === "empty" ? <p>{zh ? "暂无内容" : "No content available"}</p>
          : mode === "loading" ? <p role="status">{zh ? "正在加载…" : "Loading…"}</p>
            : mode === "error" ? <><p role="alert">{zh ? "内容加载失败" : "Could not load content"}</p><Button onClick={() => setMode("default")}>{zh ? "重试" : "Retry"}</Button></>
              : <><p>{zh ? "填写备注，或打开详情查看补充说明。" : "Add a note or open the details for more information."}</p><Input fullWidth label={zh ? "备注" : "Note"} />
                <Button ref={entry} onClick={() => setChild(true)}>{zh ? "查看详情" : "View details"}</Button>
                {mode === "long" && Array.from({ length: 24 }, (_, index) => <p key={index}>{zh ? `第 ${index + 1} 项` : `Item ${index + 1}`}</p>)}</>}
      </div>
      {child && <p>{zh ? "使用返回按钮回到上一级。" : "Use Back to return to the previous view."}</p>}
    </Drawer>
  </div>;
}

const meta = {
  id: "yami-components-layout-drawer",
  title: "YAMI/Components/Drawer",
  component: Drawer,
  parameters: { layout: "fullscreen", controls: { disable: true }, docs: { showStories: false, translations: {
    zh: { description: "PC 右侧贴边抽屉，Mobile 底部弹层。移动端可从半屏拖到全屏，正文独立滚动，底部操作保持可见。" },
    en: { description: "Right-edge desktop drawer and mobile bottom sheet. Drag from half to full height on mobile. Content scrolls independently above the fixed footer." },
  } } },
  args: { size: "half", open: false, title: "抽屉", closeLabel: "关闭", onClose: () => {} },
} satisfies Meta<typeof Drawer>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Showcase: Story = { name: "Overview", render: (_args, { globals }) => <Demo locale={globals.locale === "en" ? "en" : "zh"} /> };
export const PC: Story = { ...Showcase, globals: { viewport: { value: "yamiDesktop", isRotated: false } } };
export const Mobile: Story = { ...Showcase, globals: { viewport: { value: "yamiMobile", isRotated: false } } };
export const States: Story = { render: (_args, { globals }) => <Demo locale={globals.locale === "en" ? "en" : "zh"} states /> };
export const Interaction: Story = {
  tags: ["!dev"],
  render: () => <Demo locale="en" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const opener = canvas.getByRole("button", { name: "Open" });
    await userEvent.click(opener);
    const dialog = within(canvasElement.ownerDocument.body).getByRole("dialog", { name: "Drawer" });
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await userEvent.click(within(dialog).getByRole("button", { name: "View details" }));
    await expect(within(dialog).getByRole("button", { name: "Back" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(within(dialog).getByRole("button", { name: "View details" })).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(opener).toHaveFocus());
    await expect(canvasElement.ownerDocument.querySelector("[data-drawer]")).toBeNull();
  },
};

export const PCPreview: Story = {
  ...PC,
  name: "PC",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiDesktop", isRotated: false } },
  play: undefined,
};

export const MobilePreview: Story = {
  ...Mobile,
  name: "Mobile",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
  play: undefined,
};

function DrawerPlayground(args: DrawerProps & { opener: string }) {
  const [open, setOpen] = useState(args.open);
  return <>
    <Button onClick={() => setOpen(true)}>{args.opener}</Button>
    <Drawer {...args} open={open} onClose={() => setOpen(false)}>
      {args.children ?? args.title}
    </Drawer>
  </>;
}

export const Playground: Story = {
  tags: ["!dev", "!test"],
  render: (args, { globals }) => (
    <DrawerPlayground lang={globals.locale === "en" ? "en" : "zh"} key={String(args.open)} {...args} opener={globals.locale === "en" ? "Open" : "打开"} />
  ),
};
