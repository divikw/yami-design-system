import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { CartPage } from "./CartPage";
import { createCartPageFixture } from "./fixtures";
import type { CartLocale, CartPageProps } from "./CartPage.types";

type Scenario = "default" | "selected" | "empty" | "loading" | "error" | "long" | "no-coupons" | "shipping-partial" | "shipping-qualified";
type View = "cart" | "reorder" | "saved" | "coupons" | "unavailable" | "protection" | "summary";
type Account = "scenario" | "guest" | "signed-in";
type CartStoryArgs = CartPageProps & { scenario: Scenario; view: View; account: Account };
function Demo({ locale, scenario = "default", view = "cart", account = "scenario" }: { locale: CartLocale; scenario?: Scenario; view?: View; account?: Account }) {
  const [failed, setFailed] = useState(scenario === "error");
  const signedIn = account === "scenario" ? scenario !== "empty" : account === "signed-in";
  const fixture = createCartPageFixture(locale);
  if (scenario === "selected") fixture.initialItems = fixture.initialItems.map((item) => ({ ...item, selected: item.availability === "available" }));
  if (scenario === "shipping-partial" || scenario === "shipping-qualified") fixture.initialItems = fixture.initialItems.map((item, index) => ({ ...item, selected: index === (scenario === "shipping-qualified" ? 0 : 1) }));
  if (scenario === "empty") fixture.initialItems = [];
  if (scenario === "no-coupons") fixture.coupons = [];
  if (scenario === "long") fixture.initialItems = Array.from({ length: 8 }, (_, index) => fixture.initialItems.filter((item) => item.availability === "available").map((item) => ({ ...item, id: `${item.id}-${index}` }))).flat();
  return <CartPage {...fixture} signedIn={signedIn} initialPageTab={view === "reorder" ? "reorder" : "cart"} initialCollection={view === "saved" ? "saved" : "recommended"}
    initialDrawer={view === "coupons" || view === "unavailable" || view === "protection" || view === "summary" ? view : null} loading={scenario === "loading"} error={failed ? locale === "zh" ? "购物车加载失败，请重试" : "Could not load your cart. Try again." : undefined} onRetry={() => setFailed(false)} />;
}
const meta = {
  id: "yami-pages-cart",
  title: "YAMI/Pages/Cart",
  component: CartPage,
  tags: ["!autodocs", "draft"],
  argTypes: {
    account: { control: "select", options: ["scenario", "guest", "signed-in"], description: "scenario：空购物车默认游客，其余默认已登录。手动切换只改变示例账户状态，不执行真实登录。" },
    scenario: { control: "select", options: ["default", "selected", "empty", "loading", "error", "long", "no-coupons", "shipping-partial", "shipping-qualified"],
      description: "选择页面数据状态；切换后重置本地预览操作。" },
    view: { control: "select", options: ["cart", "reorder", "saved", "coupons", "unavailable", "protection", "summary"],
      description: "Reorder 仅适用于 Mobile；其余区域同时支持 PC 和 Mobile。" },
  },
  render: ({ scenario, view, account }, { globals }) => <Demo key={`${globals.locale}-${scenario}-${view}-${account}`} locale={globals.locale === "en" ? "en" : "zh"} scenario={scenario} view={view} account={account} />,
  parameters: { layout: "fullscreen", controls: { include: ["scenario", "view", "account"] }, docs: {
    description: { component: "**Draft · 草稿**：基于 2026-10-13 线上 PC 购物车观察的响应式原型。商品图片和可见价格为来源快照；库存、数量、优惠券和集合是可重复的示例数据，所有操作仅在本次预览内生效。Mobile 参考 Figma Cart / Reorder App 方案；购买次数与分类为本地示例。去结算打开订单摘要，不提交订单。" },
    story: { inline: false, height: "1200px" },
  } },
  globals: { theme: "light", viewport: { value: "yamiDesktopLg", isRotated: false } },
  args: { ...createCartPageFixture("zh"), scenario: "default", view: "cart", account: "scenario" },
} satisfies Meta<CartStoryArgs>;
export default meta;
type Story = StoryObj<typeof meta>;
function renderScenario(scenario: Scenario): NonNullable<Story["render"]> {
  return (_args, { globals }) => <Demo key={`${globals.locale}-${scenario}`} locale={globals.locale === "en" ? "en" : "zh"} scenario={scenario} />;
}
export const PC: Story = { argTypes: { view: { options: ["cart", "saved", "coupons", "unavailable", "protection", "summary"] } } };
export const Mobile: Story = { globals: { viewport: { value: "yamiMobile", isRotated: false } } };
export const MobileOrderDetails: Story = { name: "Mobile — Order Details", args: { scenario: "shipping-partial", view: "summary", account: "signed-in" }, globals: { viewport: { value: "yamiMobile", isRotated: false } } };
export const MobileReorder: Story = { tags: ["!dev", "!autodocs"], render: renderScenario("default"), globals: { viewport: { value: "yamiMobile", isRotated: false } },
  play: async ({ canvasElement }) => { await userEvent.click(within(canvasElement).getByRole("tab", { name: /^(再次购买|Reorder)$/ })); },
};
export const Selected: Story = { tags: ["!dev", "!autodocs"], render: renderScenario("selected") };
export const Empty: Story = { tags: ["!dev", "!autodocs"], render: renderScenario("empty") };
export const Loading: Story = { tags: ["!dev", "!autodocs"], render: renderScenario("loading") };
export const Failure: Story = { tags: ["!dev", "!autodocs"], render: renderScenario("error") };
export const LongCart: Story = { tags: ["!dev", "!autodocs"], render: renderScenario("long") };
export const NoCoupons: Story = { tags: ["!dev", "!autodocs"], render: renderScenario("no-coupons") };
export const CouponDrawer: Story = { tags: ["!dev", "!autodocs"],
  render: renderScenario("selected"),
  play: async ({ canvasElement }) => { await userEvent.click(within(canvasElement).getByRole("button", { name: /^(编辑 优惠券|Edit Coupons)$/ })); },
};
export const EmptyCouponDrawer: Story = { tags: ["!dev", "!autodocs"],
  render: renderScenario("no-coupons"),
  play: async ({ canvasElement }) => { await userEvent.click(within(canvasElement).getByRole("button", { name: /^(编辑 优惠券|Edit Coupons)$/ })); },
};
export const UnavailableDrawer: Story = { tags: ["!dev", "!autodocs"],
  render: renderScenario("selected"),
  play: async ({ canvasElement }) => { await userEvent.click(within(canvasElement).getByRole("button", { name: /^(查看全部 以下商品已失效|View all Unavailable items)$/ })); },
};
export const ProtectionDrawer: Story = { tags: ["!dev", "!autodocs"],
  render: renderScenario("selected"),
  play: async ({ canvasElement }) => { await userEvent.click(within(canvasElement).getByRole("button", { name: /^(了解更多|Learn more)$/ })); },
};
export const SavedForLater: Story = { tags: ["!dev", "!autodocs"],
  render: renderScenario("selected"),
  play: async ({ canvasElement }) => { await userEvent.click(within(canvasElement).getByRole("tab", { name: /^(稍后购买|Save for later) \(2\)$/ })); },
};
export const Interaction: Story = { tags: ["!dev", "!autodocs"], render: () => <Demo locale="en" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fixture = createCartPageFixture("en");
    const first = fixture.initialItems[0];
    const summary = within(canvas.getByRole("complementary", { name: "Order summary" }));
    await expect(summary.getByRole("button", { name: "Checkout" })).not.toHaveAttribute("aria-disabled", "true");
    await userEvent.click(summary.getByRole("button", { name: "Checkout" }));
    await expect(summary.getByRole("alert")).toHaveTextContent("Please select at least one item to Checkout");
    await userEvent.click(canvas.getByRole("checkbox", { name: /^Select all/ }));
    await expect(summary.getByText("$293.67")).toBeVisible();
    await userEvent.click(summary.getByRole("textbox", { name: "Promo code" }));
    await userEvent.type(summary.getByRole("textbox", { name: "Promo code" }), "BAD", { skipClick: true });
    await userEvent.click(summary.getByRole("button", { name: "Redeem" }));
    await expect(summary.getByText("Invalid promo code. Check it and try again.")).toBeVisible();
    await userEvent.clear(summary.getByRole("textbox", { name: "Promo code" }));
    await userEvent.click(summary.getByRole("textbox", { name: "Promo code" }));
    await userEvent.type(summary.getByRole("textbox", { name: "Promo code" }), "DEMO10", { skipClick: true });
    await userEvent.click(summary.getByRole("button", { name: "Redeem" }));
    await expect(summary.getByText("$283.67")).toBeVisible();
    await userEvent.click(canvas.getByRole("combobox", { name: `${first.title} quantity` }));
    await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole("option", { name: "2", exact: true }));
    await expect(summary.getByText("$413.66")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: `Save for later ${first.title}`, exact: true }));
    await expect(summary.getByText("$153.68")).toBeVisible();
    await userEvent.click(canvas.getByRole("tab", { name: "Save for later (3)" }));
    const savedPanel = canvas.getByRole("tabpanel", { name: "Save for later (3)" });
    await expect(within(savedPanel).getAllByRole("link", { name: first.title, exact: true })).toHaveLength(2);
    await userEvent.click(within(savedPanel).getByRole("button", { name: `Move to cart ${first.title}`, exact: true }));
    await expect(canvas.getByRole("checkbox", { name: `Select ${first.title}` })).not.toBeChecked();
    await expect(canvas.getByRole("combobox", { name: `${first.title} quantity` })).toHaveTextContent("2");
    await userEvent.click(canvas.getByRole("button", { name: "View all Unavailable items" }));
    const dialog = within(canvasElement.ownerDocument.body).getByRole("dialog", { name: "Unavailable items" });
    await expect(within(dialog).getByText("Sold out")).toBeVisible();
    await expect(within(dialog).getByText("No longer available")).toBeVisible();
    await expect(within(dialog).getAllByRole("button", { name: /^Notify me/ })).toHaveLength(1);
    await userEvent.click(within(dialog).getByRole("button", { name: /^Notify me/ }));
    await expect(within(dialog).getByRole("button", { name: /^Notification set/ })).toHaveAttribute("aria-disabled", "true");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvasElement.ownerDocument.querySelector("dialog[open]")).toBeNull());
  },
};

export const SecurityCarousel: Story = { tags: ["!dev", "!autodocs"],
  render: renderScenario("selected"),
  play: async ({ canvasElement }) => {
    const track = canvasElement.querySelector('[data-slot="cart-security-track"]')!;
    await expect(track.children).toHaveLength(5);
    await waitFor(() => {
      const carouselTop = track.parentElement!.getBoundingClientRect().top;
      const secondSlideTop = track.children[1].getBoundingClientRect().top;
      expect(Math.abs(secondSlideTop - carouselTop)).toBeLessThan(1);
    }, { timeout: 5000 });
  },
};

export const ShippingPartial: Story = { tags: ["!dev", "!autodocs"], render: renderScenario("shipping-partial") };
export const ShippingQualified: Story = { tags: ["!dev", "!autodocs"], render: renderScenario("shipping-qualified") };
