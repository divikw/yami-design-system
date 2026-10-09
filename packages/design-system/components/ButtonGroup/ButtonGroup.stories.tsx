import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button";
import styles from "./ButtonGroup.stories.module.css";

import { ButtonGroup } from "./ButtonGroup";

function PairedDemo({ inverse = false }: { inverse?: boolean }) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "cancelled">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return <div className={styles.demo}>
    <ButtonGroup aria-label={inverse ? "反色表面保存设置" : "保存偏好设置"}>
      <Button inverse={inverse} variant="secondary" disabled={state === "saving"} onClick={() => setState("cancelled")}>取消</Button>
      <Button inverse={inverse} loading={state === "saving"} loadingDelay={150} onClick={() => {
        if (timer.current !== undefined) return;
        setState("saving");
        timer.current = setTimeout(() => {
          timer.current = undefined;
          setState("saved");
        }, 700);
      }}>保存设置</Button>
    </ButtonGroup>
    <p className={styles.feedback} role="status">{{ idle: "等待操作", saving: "正在保存…", saved: "设置已保存", cancelled: "已取消修改" }[state]}</p>
  </div>;
}

function PurchaseDemo() {
  const [message, setMessage] = useState("示例操作不会修改购物车。");
  return <div className={styles.purchase}>
    <div className={styles.orderInfo}><span>购物车 · 3 件商品</span><strong>$38.90</strong></div>
    <ButtonGroup full aria-label="购物车操作">
      <Button form="full" size="lg" variant="secondary" onClick={() => setMessage("已模拟继续购物。")}>继续购物</Button>
      <Button form="full" size="lg" variant="emphasis" onClick={() => setMessage("已模拟前往结算。")}>前往结算</Button>
    </ButtonGroup>
    <p className={styles.feedback} role="status">{message}</p>
  </div>;
}

function Section({ title, description, children }: {
  title: string; description: string; children: ReactNode;
}) {
  return <section className={styles.section}>
    <div className={styles.explanation}><h2>{title}</h2><p>{description}</p></div>
    {children}
  </section>;
}

function Proposal() {
  return <main className={styles.page} lang="zh">
    <header className={styles.header}>
      <div className={styles.eyebrow}><span>YAMI / ACTIONS</span></div>
      <h1>ButtonGroup 按钮组</h1>
      <p>相关操作成组展示，统一 8px 间距。</p>
    </header>
    <Section title="内容宽度" description="按钮随内容伸展，用主要与次要层级区分保存和取消。">
      <div className={styles.preview}><PairedDemo /></div>
    </Section>
    <Section title="填满容器" description="同组按钮等宽，操作区最大 480px，红色留给结算。">
      <div className={styles.preview}><PurchaseDemo /></div>
    </Section>
    <Section title="状态与背景" description="保存时锁定本组操作；加载期间保持焦点与按钮宽度。">
      <div className={styles.states}>
        {[false, true].map((inverse) => <div key={String(inverse)} className={`${styles.statePanel} ${inverse ? styles.inverse : ""}`}>
          <h3>{inverse ? "反色背景" : "默认背景"}</h3>
          <div className={styles.stateRow}><span className={styles.caption}>默认</span><ButtonGroup aria-label={`${inverse ? "反色" : "默认"}设置操作`}><Button inverse={inverse} variant="secondary">取消</Button><Button inverse={inverse}>保存设置</Button></ButtonGroup></div>
          <div className={styles.stateRow}><span className={styles.caption}>尚无改动</span><ButtonGroup aria-label={`${inverse ? "反色" : "默认"}尚无改动的设置操作`}><Button inverse={inverse} variant="secondary">取消</Button><Button inverse={inverse} disabled>保存设置</Button></ButtonGroup></div>
          <div className={styles.stateRow}><span className={styles.caption}>正在保存</span><ButtonGroup aria-label={`${inverse ? "反色" : "默认"}正在保存设置`}><Button inverse={inverse} variant="secondary" disabled>取消</Button><Button inverse={inverse} loading>保存设置</Button></ButtonGroup></div>
        </div>)}
      </div>
    </Section>
  </main>;
}

const meta = {
  id: "yami-components-actions-button-group",
  title: "YAMI/Components/Actions/ButtonGroup",
  component: ButtonGroup,
  parameters: {
    layout: "centered",
    docs: {
      playground: "Playground",
      interactionStory: "yami-components-actions-button-group--interaction",
      showStories: false,
      description: { component: "按钮组用于组织相关操作。支持内容宽度与等宽布局，统一 8px 间距，沿用 Button 的层级、尺寸与状态。" },
    },
  },
  args: { full: false, "aria-label": "设置操作" },
  argTypes: {
    full: { control: "boolean", description: "等宽填满容器，最大 480px。" },
    "aria-label": { control: "text", description: "描述整组操作的用途。" },
    children: { control: false },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Showcase: Story = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => <Proposal />,
  play: async ({ canvasElement }) => {
    if (import.meta.env.MODE !== "test") return;
    const canvas = within(canvasElement);
    for (const group of canvas.getAllByRole("group")) {
      const buttons = group.querySelectorAll("button");
      const full = group.dataset.full === "true";
      const height = full ? (window.innerWidth >= 1024 ? 56 : 48) : 40;
      for (const button of buttons) {
        expect(button.getBoundingClientRect().height).toBe(height);
        expect(button.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
        if (!full) expect(parseFloat(getComputedStyle(button, "::before").height)).toBeGreaterThanOrEqual(44);
      }
      expect(buttons[1].getBoundingClientRect().left - buttons[0].getBoundingClientRect().right).toBeCloseTo(8, 0);
      if (full) {
        expect(group.getBoundingClientRect().width).toBeLessThanOrEqual(480);
        expect(buttons[0].getBoundingClientRect().width).toBeCloseTo(buttons[1].getBoundingClientRect().width, 0);
      }
    }
    expect(canvasElement.ownerDocument.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};
export const Playground: Story = {
  render: (args) => <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "min(480px, 100vw - 32px)", maxWidth: "100%" }}>
    <ButtonGroup {...args}>
      <Button variant="secondary" form={args.full ? "full" : "inline"}>取消</Button>
      <Button form={args.full ? "full" : "inline"}>保存设置</Button>
    </ButtonGroup>
  </div>,
};
export const Interaction: Story = {
  parameters: { controls: { disable: true } },
  render: () => <PairedDemo />,
  play: async ({ canvasElement }) => {
    if (import.meta.env.MODE !== "test") return;
    const canvas = within(canvasElement);
    const firstGroup = canvas.getByRole("group", { name: "保存偏好设置" });
    const save = within(firstGroup).getByRole("button", { name: "保存设置" });
    await userEvent.click(save);
    await expect(save).toHaveFocus();
    await expect(within(firstGroup).getByRole("button", { name: "保存设置" })).toHaveAttribute("aria-busy", "true");
    await expect(within(firstGroup).getByRole("button", { name: "取消" })).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(within(firstGroup).getByRole("button", { name: "取消" }));
    await expect(canvas.getByText("正在保存…")).toBeVisible();
    await waitFor(() => expect(canvas.getByText("设置已保存")).toBeVisible());
    const cancel = within(firstGroup).getByRole("button", { name: "取消" });
    await userEvent.click(cancel);
    await expect(canvas.getByText("已取消修改")).toBeVisible();
    await userEvent.tab();
    await expect(within(firstGroup).getByRole("button", { name: "保存设置" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(save).toHaveAttribute("aria-busy", "true");
    await expect(save).toHaveFocus();
    await waitFor(() => expect(canvas.getByText("设置已保存")).toBeVisible());
    await expect(save).toHaveFocus();

  },
};
