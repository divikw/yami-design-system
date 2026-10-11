import { useEffect, useRef, useState, type CSSProperties, type MouseEventHandler } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { Card } from "./Card";
import { Button, ButtonLink } from "../Button";
import { ButtonGroup } from "../ButtonGroup";

const copy = {
  zh: {
    content: "卡片内容",
    surfaces: { primary: "主要表面", secondary: "次级表面", inverse: "反色表面" },
    primaryDescription: "独立内容项的默认表面，无边框、无阴影。",
    secondaryDescription: "用于辅助信息，降低视觉权重。",
    inverseDescription: "在与当前主题相反的明暗表面上展示内容。",
    borderedTitle: "边框例外",
    borderedDescription: "仅用于需要明确分隔的密集网格。",
    orderDetails: "查看订单详情",
    deliverySettings: "打开配送设置",
    deliveryUnavailable: "配送设置暂不可用",
    padding: "内边距",
    pageSection: "页面分区：使用标题和间距",
    preferences: "通知偏好",
    preferencesDescription: "这是设置页面中的一个分区，使用普通 section 组织，无需添加卡片表面。",
    independentItem: "独立内容项：使用 Card",
    order: "订单 Y20261011-1234",
    delivery: "预计周二送达",
    viewOrder: "查看订单",
    receipt: "下载收据",
    mixedActions: "使用 ButtonGroup 统一排列入口。查看订单使用 ButtonLink 导航，下载收据使用 Button 执行操作，外容器保持静态。本例仅模拟生成过程，不下载文件。",
    orderActions: "订单操作",
    receiptIdle: "点击下载收据，体验生成反馈。",
    receiptGenerating: "正在生成收据…",
    receiptReady: "收据已生成（演示）。",
    longTitle: "订单参考编号：",
    longReference: "连续编号会换行，不撑宽网格。",
    record: "订单记录",
    recordDescription: "宽代码区域独立滚动；可以聚焦后使用方向键。",
    scrollLabel: "订单记录代码",
    paddingUses: { none: "贴边媒体，内部内容另设间距", sm: "紧凑条目", md: "默认独立内容项", lg: "更宽松的内容留白" },
  },
  en: {
    content: "Card content",
    surfaces: { primary: "Primary surface", secondary: "Secondary surface", inverse: "Inverse surface" },
    primaryDescription: "Default surface for an independent item, without a border or shadow.",
    secondaryDescription: "Lower visual weight for supporting information.",
    inverseDescription: "Content on the opposite-polarity surface.",
    borderedTitle: "Bordered exception",
    borderedDescription: "Reserved for dense grids that need separation.",
    orderDetails: "View order details",
    deliverySettings: "Open delivery settings",
    deliveryUnavailable: "Delivery settings unavailable",
    padding: "Padding",
    pageSection: "Page section: headings and spacing",
    preferences: "Notification preferences",
    preferencesDescription: "A region of the settings page, grouped with a plain section rather than a card surface.",
    independentItem: "Independent item: Card",
    order: "Order Y20261011-1234",
    delivery: "Expected Tuesday",
    viewOrder: "View order",
    receipt: "Download receipt",
    mixedActions: "Arrange entries with ButtonGroup. ButtonLink navigates to the order; Button generates and downloads the receipt. The container stays static. This demo simulates generation without downloading a file.",
    orderActions: "Order actions",
    receiptIdle: "Select Download receipt to try the generation feedback.",
    receiptGenerating: "Generating receipt…",
    receiptReady: "Receipt generated (demo).",
    longTitle: "Order reference: ",
    longReference: "Unbroken references wrap without widening the grid.",
    record: "Order record",
    recordDescription: "Wide code scrolls independently; focus the region and use the arrow keys.",
    scrollLabel: "Order record code",
    paddingUses: { none: "Edge-to-edge media; separate content spacing", sm: "Compact items", md: "Default independent items", lg: "More generous content spacing" },
  },
};

const meta = {
  title: "YAMI/Components/Layout/Card",
  component: Card,
  parameters: {
    layout: "padded",
    docs: {
      playground: "Playground",
      translations: {
        zh: {
          description: "用于呈现订单、商品摘要等独立内容项的基础表面。普通页面分区使用标题、间距和布局容器。默认内边距 16px、圆角 12px，无边框和阴影；支持静态、链接和按钮卡片。",
          argDescriptions: {
            padding: "内边距：none=0、sm=12px、md=16px、lg=24px，默认 md。贴边媒体使用 none，由组合组件管理内部间距；同组卡片保持一致，不随断点自动切换。",
            surface: "背景表面令牌。默认为 'primary'（--surface-primary）。",
            bordered: "是否显示细边框。默认不显示，按设计规范仅用于密集列表或网格。",
            interactive: '启用悬浮和按下反馈，并提供至少 44×44px 的点击区域。as="button" 或 as="a" 且提供 href（含空字符串）时自动启用。自定义元素需自行提供语义和键盘行为。关闭交互反馈后，键盘焦点及禁用样式仍然可用。',
            children: "卡片内容。",
            as: "渲染的元素类型，默认为 'div'。链接卡片使用 'a' 并提供 href；操作卡片使用 'button'。",
            href: "原生链接目标，仅用于 as=a。空字符串指向当前文档；业务导航请提供明确地址。",
            type: "原生按钮类型，仅用于 as=button。默认 button，避免意外提交外层表单。",
            disabled: "原生按钮禁用状态，仅用于 as=button。关闭交互反馈后仍保留禁用样式。",
          },
        },
        en: {
          description: "Surface for independent items such as orders or product summaries. Ordinary page sections use headings, spacing, and layout containers. Defaults to 16px padding, 12px radius, no border or shadow; supports static, link, and button cards.",
          argDescriptions: {
            padding: "Padding: none=0, sm=12px, md=16px, lg=24px; default md. Use none for edge-to-edge media with composite-owned inner spacing. Keep peer cards consistent; no automatic breakpoint changes.",
            surface: "Background surface token. Default: 'primary' (--surface-primary).",
            bordered: "Opt-in hairline border. Off by default; only use in dense lists or grids per the design specification.",
            interactive: 'Adds hover/press styling and a 44×44px minimum target. Inferred for as="button" or as="a" with href, including an empty string. Custom hosts retain responsibility for semantics and keyboard behavior. Focus-visible and disabled styling remain available when interaction feedback is off.',
            children: "Card content.",
            as: "Element type to render. Defaults to 'div'. Use 'a' with href for link cards, 'button' for button cards.",
            href: "Native destination for as=a. An empty string links to the current document; provide an explicit destination for business navigation.",
            type: "Native button type for as=button. Defaults to button to avoid implicit form submission.",
            disabled: "Native disabled state for as=button. Disabled styling remains available when interaction feedback is off.",
          },
        },
      },
      description: {
        component:
          "Surface for independent content items, not ordinary page sections. Default 16px padding, 12px radius, no border or shadow; supports static, link, and button cards.",
      },
    },
  },
  args: {
    padding: "md",
    surface: "primary",
    bordered: false,
    interactive: undefined,
  },
  render: (args, { globals }) => {
    const text = copy[globals.locale === "en" ? "en" : "zh"];
    const content = args.as === "a" ? text.orderDetails : args.as === "button" ? text.deliverySettings : text.content;
    return <Card {...args}>{args.children ?? content}</Card>;
  },
  argTypes: {
    as: { control: "select", options: ["div", "article", "a", "button"] },
    href: { control: "text", if: { arg: "as", eq: "a" } },
    type: { control: "select", options: ["button", "submit", "reset"], if: { arg: "as", eq: "button" } },
    disabled: { control: "boolean", if: { arg: "as", eq: "button" } },
    children: { control: "text" },
    padding: { control: "select", options: ["none", "sm", "md", "lg"] },
    surface: {
      control: "select",
      options: ["primary", "secondary", "inverse"],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const showcaseStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))",
  gap: "var(--space-200)",
  width: "min(760px, 100%)",
};

export const Showcase: Story = {
  render: (_args, { globals }) => {
    const text = copy[globals.locale === "en" ? "en" : "zh"];
    return (
      <div style={showcaseStyle}>
        <Card>
          <strong>{text.surfaces.primary}</strong>
          <p style={{ marginBottom: 0, color: "var(--text-secondary)" }}>
            {text.primaryDescription}
          </p>
        </Card>
        <Card surface="secondary">
          <strong>{text.surfaces.secondary}</strong>
          <p style={{ marginBottom: 0, color: "var(--text-secondary)" }}>
            {text.secondaryDescription}
          </p>
        </Card>
        <Card surface="inverse">
          <strong>{text.surfaces.inverse}</strong>
          <p style={{ marginBottom: 0 }}>{text.inverseDescription}</p>
        </Card>
        <Card bordered padding="sm">
          <strong>{text.borderedTitle}</strong>
          <p style={{ marginBottom: 0, color: "var(--text-secondary)" }}>
            {text.borderedDescription}
          </p>
        </Card>
      </div>
    );
  },
};

export const Playground: Story = { tags: ["!autodocs"] };

export const Interactive: Story = {
  args: {
    as: "button",
    interactive: undefined,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button");
    await expect(button).toHaveAttribute("type", "button");
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Link: Story = {
  args: { as: "a", href: "#order-details" },
};

export const InteractionStates: Story = {
  render: (_args, { globals }) => {
    const text = copy[globals.locale === "en" ? "en" : "zh"];
    return (
      <div style={showcaseStyle}>
        {(["primary", "secondary", "inverse"] as const).map((surface) => (
          <section key={surface} style={{ display: "grid", gap: "var(--space-200)" }}>
            <strong>{text.surfaces[surface]} ({surface})</strong>
            <Card as="a" href="#order-details" surface={surface}>{text.orderDetails}</Card>
            <Card as="button" surface={surface}>{text.deliverySettings}</Card>
            <Card as="button" surface={surface} disabled>{text.deliveryUnavailable}</Card>
          </section>
        ))}
      </div>
    );
  },
};

export const Padding: Story = {
  render: (_args, { globals }) => {
    const text = copy[globals.locale === "en" ? "en" : "zh"];
    return (
      <div style={showcaseStyle}>
        {(["none", "sm", "md", "lg"] as const).map((padding, index) => (
          <Card key={padding} padding={padding} surface="secondary">
            <strong>{text.padding}: {padding} ({[0, 12, 16, 24][index]}px)</strong>
            <p style={{ marginBottom: 0 }}>{text.paddingUses[padding]}</p>
          </Card>
        ))}
      </div>
    );
  },
};

export const UsageBoundaries: Story = {
  render: (_args, { globals }) => {
    const text = copy[globals.locale === "en" ? "en" : "zh"];
    return (
      <div style={showcaseStyle}>
        <section>
          <p>{text.pageSection}</p>
          <h3>{text.preferences}</h3>
          <p>{text.preferencesDescription}</p>
        </section>
        <section>
          <p>{text.independentItem}</p>
          <Card as="article" surface="secondary">
            <h3 style={{ marginTop: 0 }}>{text.order}</h3>
            <p style={{ marginBottom: 0 }}>{text.delivery}</p>
          </Card>
        </section>
      </div>
    );
  },
};

function OrderActionsDemo({ locale, onReceipt }: { locale: "zh" | "en"; onReceipt?: MouseEventHandler<HTMLButtonElement> }) {
  const text = copy[locale];
  const [state, setState] = useState<"idle" | "generating" | "ready">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <div style={{ maxWidth: 480 }}>
      <p style={{ marginTop: 0 }}>{text.mixedActions}</p>
      <Card as="article" surface="secondary">
        <h3 style={{ marginTop: 0 }}>{text.order}</h3>
        <p>{text.delivery}</p>
        <ButtonGroup aria-label={text.orderActions}>
          <ButtonLink href="/orders/Y20261011-1234" variant="primary" size="md">{text.viewOrder}</ButtonLink>
          <Button variant="secondary" size="md" loading={state === "generating"} loadingDelay={150} onClick={(event) => {
            if (timer.current !== undefined) return;
            setState("generating");
            onReceipt?.(event);
            timer.current = setTimeout(() => {
              timer.current = undefined;
              setState("ready");
            }, 700);
          }}>{text.receipt}</Button>
        </ButtonGroup>
        <p role="status" style={{ marginBottom: 0, color: "var(--text-secondary)" }}>
          {state === "generating" ? text.receiptGenerating : state === "ready" ? text.receiptReady : text.receiptIdle}
        </p>
      </Card>
    </div>
  );
}

export const MultipleActions: Story = {
  args: { onClick: fn() },
  render: ({ onClick }, { globals }) => <OrderActionsDemo locale={globals.locale === "en" ? "en" : "zh"} onReceipt={onClick} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("article");
    const link = canvas.getByRole("link");
    const receipt = canvas.getByRole("button");
    await expect(card.tabIndex).toBe(-1);
    await expect(card).not.toHaveAttribute("href");
    await expect(link).toHaveAttribute("href", "/orders/Y20261011-1234");
    await expect(canvas.getByRole("group")).toHaveAccessibleName(/订单操作|Order actions/);
    await expect(link.getBoundingClientRect().height).toBe(receipt.getBoundingClientRect().height);
    await userEvent.click(card);
    await expect(args.onClick).not.toHaveBeenCalled();
    await userEvent.click(receipt);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await expect(receipt).toHaveAttribute("aria-busy", "true");
    await expect(canvas.getByRole("status")).toHaveTextContent(/正在生成收据|Generating receipt/);
    await userEvent.click(receipt);
    await userEvent.keyboard("{Enter} ");
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent(/收据已生成|Receipt generated/));
    await expect(receipt).not.toHaveAttribute("aria-busy");
    await expect(receipt).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(link).toHaveFocus();
    await userEvent.tab();
    await expect(receipt).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await expect(args.onClick).toHaveBeenLastCalledWith(expect.objectContaining({ target: receipt }));
    await userEvent.keyboard(" ");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(receipt).not.toHaveAttribute("aria-busy"));
    await userEvent.keyboard(" ");
    await expect(args.onClick).toHaveBeenCalledTimes(3);
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent(/收据已生成|Receipt generated/));
  },
};

export const ResponsiveContent: Story = {
  render: (_args, { globals }) => {
    const text = copy[globals.locale === "en" ? "en" : "zh"];
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--space-200)", width: "min(375px, 100%)" }}>
        <Card as="article" surface="secondary" padding="sm">
          <h3 style={{ marginTop: 0 }}>{text.longTitle}Y20261011-123456789012345678901234567890</h3>
          <p style={{ marginBottom: 0 }}>{text.longReference}</p>
        </Card>
        <Card as="article" surface="secondary" padding="sm">
          <h3 style={{ marginTop: 0 }}>{text.record}</h3>
          <p>{text.recordDescription}</p>
          <div role="region" aria-label={text.scrollLabel} tabIndex={0} style={{ maxWidth: "100%", overflowX: "auto" }}>
            <pre style={{ margin: 0 }}>{'order: Y20261011-1234\nitems: ["noodles", "tea", "rice", "snacks"]\nstatus: "confirmed"'}</pre>
          </div>
        </Card>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cards = canvas.getAllByRole("article");
    const grid = cards[0].parentElement!;
    const gridRect = grid.getBoundingClientRect();
    await expect(gridRect.width).toBeLessThanOrEqual(375);
    await expect(grid.scrollWidth).toBeLessThanOrEqual(grid.clientWidth);
    for (const card of cards) {
      await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
      await expect(card.getBoundingClientRect().width).toBeLessThan(gridRect.width / 2);
    }
    const region = canvas.getByRole("region");
    await expect(region).toHaveAccessibleName();
    await expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
    region.focus();
    await expect(region).toHaveFocus();
  },
};
