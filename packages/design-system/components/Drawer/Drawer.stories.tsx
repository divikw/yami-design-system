import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button";
import { Input } from "../Input";
import { Drawer } from "./Drawer";

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
  return <div lang={locale} style={{ padding: "var(--space-300)" }}>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-200)" }}>
      {(states ? Object.keys(labels) as Mode[] : ["default" as const]).map((value) => <Button key={value} onClick={() => { setMode(value); setChild(value === "child"); }}>{states ? labels[value] : zh ? "打开优惠券" : "Open coupons"}</Button>)}
    </div>
    <Drawer open={mode !== null} title={child ? zh ? "使用条件" : "Conditions" : zh ? "优惠券" : "Coupons"} closeLabel={zh ? "关闭优惠券" : "Close coupons"} onClose={() => setMode(null)}
      back={child ? { label: zh ? "返回优惠券" : "Back to coupons", onClick: back } : undefined}
      footer={<div style={{ padding: "var(--space-200)" }}><Button form="full" onClick={() => setMode(null)}>{zh ? "完成" : "Done"}</Button></div>}>
      <div hidden={child}>
        {mode === "empty" ? <p>{zh ? "暂无可用优惠券" : "No available coupons"}</p>
          : mode === "loading" ? <p role="status">{zh ? "正在加载优惠券…" : "Loading coupons…"}</p>
            : mode === "error" ? <><p role="alert">{zh ? "优惠券加载失败" : "Could not load coupons"}</p><Button onClick={() => setMode("default")}>{zh ? "重试" : "Retry"}</Button></>
              : <><p>{zh ? "这里仅显示可用于当前购物车中商品的优惠券" : "Only coupons applicable to your cart are shown here."}</p><Input label={zh ? "折扣码" : "Promo code"} />
                <Button ref={entry} onClick={() => setChild(true)}>{zh ? "查看使用条件" : "View conditions"}</Button>
                {mode === "long" && Array.from({ length: 24 }, (_, index) => <p key={index}>{zh ? `优惠券 ${index + 1} · 使用前请核对适用商家和商品。` : `Coupon ${index + 1} · Check eligible sellers and items before applying.`}</p>)}</>}
      </div>
      {child && <p>{zh ? "优惠不与其他折扣码叠加。具体条件由业务内容提供。" : "Cannot be combined with other promo codes. The host supplies offer conditions."}</p>}
    </Drawer>
  </div>;
}

const meta = {
  title: "YAMI/Components/Layout/Drawer",
  component: Drawer,
  globals: { theme: "light" },
  parameters: { layout: "fullscreen", controls: { disable: true }, docs: { showStories: false, translations: {
    zh: { description: "PC 右侧贴边抽屉，Mobile 底部弹层。复用 Sheet 的模态、独立滚动、固定操作栏、焦点管理和子页面返回。" },
    en: { description: "Right-edge desktop drawer and mobile bottom sheet. Shares Sheet modal behavior, scrolling, fixed footer, focus management and child-view navigation." },
  } } },
  args: { open: false, title: "优惠券", closeLabel: "关闭", onClose: () => {} },
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
    const opener = canvas.getByRole("button", { name: "Open coupons" });
    await userEvent.click(opener);
    const dialog = within(canvasElement.ownerDocument.body).getByRole("dialog", { name: "Coupons" });
    await expect(dialog).toHaveAttribute("open");
    await userEvent.click(within(dialog).getByRole("button", { name: "View conditions" }));
    await expect(within(dialog).getByRole("button", { name: "Back to coupons" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(within(dialog).getByRole("button", { name: "View conditions" })).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(opener).toHaveFocus());
    await expect(canvasElement.ownerDocument.querySelector("dialog[open]")).toBeNull();
  },
};
