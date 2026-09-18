import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { AppDownloadPage } from "./AppDownloadPage";

const meta = {
  id: "yami-pages-app-download-v1",
  title: "YAMI/Pages/App Download/Draft/V1",
  component: AppDownloadPage,
  tags: ["!autodocs", "draft"],
  parameters: {
    viewport: { defaultViewport: "yamiDesktopLg" },
    layout: "fullscreen",
    controls: { disable: true },
    docs: { description: { component: "**Draft · 草稿**：当前页面及全部预览内容尚未定稿或完成 review。" } },
  },
  globals: { theme: "light", ...(import.meta.env.MODE === "test" ? { viewport: { value: "yamiDesktopLg", isRotated: false } } : {}) },
} satisfies Meta<typeof AppDownloadPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const PC: Story = { args: { initialLocale: "ko" } };
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "yamiMobileLg" } },
  args: { initialLocale: "ko" },
  globals: { ...(import.meta.env.MODE === "test" ? { viewport: { value: "yamiMobileLg", isRotated: false } } : {}) },
};
export const Interactions: Story = {
  tags: ["!dev"],
  args: { initialLocale: "en" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("final-payment")).toHaveTextContent("$22.99");
    await userEvent.click(canvas.getByRole("tab", { name: "Cookware" }));
    await expect(canvas.getAllByRole("link", { name: "Round Dutch Oven, White Truffle, 4QT", exact: true }).length).toBeGreaterThan(0);
    await userEvent.click(canvas.getByRole("tab", { name: /Coupon 2/ }));
    await expect(canvas.getByTestId("final-payment")).toHaveTextContent("$0.00");
    await userEvent.click(await canvas.findByRole("checkbox", { name: /Zeus III RF Facial Lifting Device/ }));
    await expect(canvas.getByTestId("final-payment")).toHaveTextContent("$664.72");
    await expect(canvas.getByTestId("total-savings")).toHaveTextContent("$79.85");
    await expect(canvas.getByTestId("total-savings")).not.toHaveTextContent("−");
    await userEvent.click(canvas.getByRole("checkbox", { name: /Zeus III RF Facial Lifting Device/ }));
    await expect(canvas.getByTestId("final-payment")).toHaveTextContent("$0.00");
    await userEvent.click(canvas.getByRole("tab", { name: /Coupon 1/ }));
    await expect(canvas.getByTestId("final-payment")).toHaveTextContent("$22.99");
    await userEvent.click(canvas.getByRole("button", { name: "한국어로 전환" }));
    await expect(canvas.getByRole("heading", { level: 1 })).toHaveTextContent("미국 최대 아시안 마켓 Yami");
  },
};

export const SectionNavigation: Story = {
  tags: ["!dev"],
  args: { initialLocale: "en" },
  play: async ({ canvasElement }) => {
    const nav = within(canvasElement.querySelector("nav")!);
    const target = nav.getByRole("tab", { name: "Calculator", exact: true });
    await userEvent.click(target);
    const deadline = performance.now() + 1500;
    while (performance.now() < deadline) {
      await expect(target).toHaveAttribute("aria-selected", "true");
      await new Promise(requestAnimationFrame);
    }
    const section = canvasElement.querySelector("#savings-calculator")!;
    await expect(Math.abs(section.getBoundingClientRect().top - 128)).toBeLessThan(2);
    const first = nav.getByRole("tab", { name: "Coupon Packs", exact: true });
    await userEvent.click(first);
    const returnDeadline = performance.now() + 1500;
    while (performance.now() < returnDeadline) {
      await expect(first).toHaveAttribute("aria-selected", "true");
      await new Promise(requestAnimationFrame);
    }
  },
};

export const ContentWidth: Story = {
  tags: ["!dev"],
  args: { initialLocale: "en", contentMaxWidth: 1440 },
  play: async ({ canvasElement }) => {
    const page = canvasElement.querySelector<HTMLElement>('[data-slot="app-download-page"]')!;
    const header = page.querySelector<HTMLElement>("header > div")!;
    const products = page.querySelector<HTMLElement>('[data-slot="product-list-container"]')!;
    await expect(header.getBoundingClientRect().width).toBe(1440);
    await expect(products.getBoundingClientRect().width).toBe(1440);
    await expect(getComputedStyle(products).padding).toBe("48px");
    for (const section of page.querySelectorAll<HTMLElement>("main > section:not(#discount-products)")) {
      await expect(getComputedStyle(section).paddingTop).toBe("48px");
      await expect(getComputedStyle(section).paddingBottom).toBe("48px");
    }
    await userEvent.click(within(page.querySelector("nav")!).getByRole("tab", { name: "How to Use" }));
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await expect(within(page).queryByRole("link", { name: "Claim Your App-Only Deal", exact: true })).toBeInTheDocument();
  },
};
