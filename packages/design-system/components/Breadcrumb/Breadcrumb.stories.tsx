import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { Breadcrumb, type BreadcrumbItem } from "./Breadcrumb";

function productPath(locale: "zh" | "en"): BreadcrumbItem[] {
  return [
    { label: locale === "zh" ? "美妆护肤" : "Beauty", href: `https://www.yami.com/us/${locale}/c/beauty/2` },
    { label: locale === "zh" ? "面膜" : "Masks", href: `https://www.yami.com/us/${locale}/c/masks/59` },
    { label: locale === "zh" ? "贴片面膜" : "Sheet Masks" },
  ];
}

const descriptions = {
  zh: {
    description: "从商品详情页和文档站抽取的面包屑导航。复用斜杠分隔、原生链接、紧凑 PC 点击区域及移动端 44px 点击区域，支持蓝色键盘焦点、反色背景与中英文。是否显示由页面决定。",
    argDescriptions: {
      items: "按层级排列的路径；只有实际当前页设置 current: true，分类文字不会自动标记为当前页。",
      locale: "导航名称的语言；示例跟随工具栏语言。路径文案与地址由使用方提供。",
      size: "sm 沿用商品详情页 caption-md；md 沿用文档站 body-md。",
      inverse: "在当前主题的反色背景上使用。",
      underline: "是否为链接保留下划线；商品详情页开启，文档站关闭。",
      renderLink: "框架链接适配器；保留传入的 href、className、children 和 ARIA 属性。",
    },
  },
  en: {
    description: "Breadcrumb navigation extracted from product pages and the docsite. Preserves slash separators, native links, compact PC targets, 44px mobile targets and blue keyboard focus, with inverse surfaces and bilingual guidance. The host controls visibility.",
    argDescriptions: {
      items: "Ordered path items. Set current: true only on the actual page; a category is not automatically current.",
      locale: "Language of the navigation name; examples follow the toolbar. The host supplies labels and URLs.",
      size: "sm uses the PDP caption-md size; md uses the docsite body-md size.",
      inverse: "Use on the active theme's opposite-polarity surface.",
      underline: "Keep link underlines for product pages; disable for the docsite treatment.",
      renderLink: "Framework-link adapter; preserve href, className, children and ARIA attributes.",
    },
  },
};

const meta = {
  title: "YAMI/Components/Navigation/Breadcrumb",
  component: Breadcrumb,
  parameters: { layout: "padded", docs: { playground: "Playground", showStories: false, translations: descriptions } },
  args: { items: [], size: "sm", inverse: false, underline: true },
  argTypes: {
    items: { control: false },
    locale: { control: false },
    size: { control: "inline-radio", options: ["sm", "md"] },
    inverse: { control: "boolean" },
    underline: { control: "boolean" },
    renderLink: { control: false },
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  name: "Overview",
  render: (_args, { globals }) => {
    const locale = globals.locale === "en" ? "en" : "zh";
    return (
      <div style={{ display: "grid", gap: "var(--space-400)", padding: "var(--space-200)", fontFamily: "var(--font-family-ios)", color: "var(--text-primary)" }}>
        <section>
          <p>{locale === "zh" ? "商品分类路径 · 不标记当前页" : "Product category path · no current-page marker"}</p>
          <Breadcrumb items={productPath(locale)} locale={locale}
            aria-label={locale === "zh" ? "商品分类路径" : "Product category path"} />
        </section>
        <section>
          <p>{locale === "zh" ? "文档路径 · 显式标记当前页" : "Documentation path · explicit current page"}</p>
          <Breadcrumb locale={locale} size="md" underline={false}
            aria-label={locale === "zh" ? "文档路径" : "Documentation path"} items={[
            { label: locale === "zh" ? "文档" : "Documentation", href: `/${locale}/docs/getting-started` },
            { label: locale === "zh" ? "查看组件与页面" : "Explore components and pages", current: true },
          ]} />
        </section>
        <section style={{ padding: "var(--space-200)", background: "var(--surface-inverse)", color: "var(--text-primary-inverse)" }}>
          <p>{locale === "zh" ? "反色背景" : "Inverse surface"}</p>
          <Breadcrumb items={productPath(locale)} locale={locale} inverse
            aria-label={locale === "zh" ? "反色商品分类路径" : "Inverse product category path"} />
        </section>
      </div>
    );
  },
};

export const Playground: Story = {
  render: (args, { globals }) => {
    const locale = globals.locale === "en" ? "en" : "zh";
    return <div style={{ padding: "var(--space-200)", background: args.inverse ? "var(--surface-inverse)" : "var(--surface-primary)" }}>
      <Breadcrumb {...args} items={productPath(locale)} locale={locale} />
    </div>;
  },
  play: async ({ canvasElement, globals }) => {
    if (import.meta.env.MODE !== "test") return;
    const locale = globals.locale === "en" ? "en" : "zh";
    const nav = within(canvasElement).getByRole("navigation", { name: locale === "zh" ? "面包屑导航" : "Breadcrumb" });
    const links = within(nav).getAllByRole("link");
    await expect(links).toHaveLength(2);
    await expect(nav.querySelector('[aria-current]')).toBeNull();
    await expect(nav.querySelector(":focus-visible")).toBeNull();
    await userEvent.tab();
    await expect(links[0]).toHaveFocus();
    links[0].addEventListener("click", (event) => event.preventDefault(), { once: true });
    await userEvent.keyboard("{Enter}");
    await expect(links[0]).toHaveAttribute("href", `https://www.yami.com/us/${locale}/c/beauty/2`);
    await userEvent.tab();
    await expect(links[1]).toHaveFocus();
  },
};

export const LongLabels: Story = {
  name: "Long labels",
  render: (_args, { globals }) => {
    const locale = globals.locale === "en" ? "en" : "zh";
    return <div style={{ maxWidth: 320, padding: "var(--space-200)" }}>
      <Breadcrumb locale={locale} items={[
        ...productPath(locale).slice(0, 2),
        { label: locale === "zh" ? "低分子玻尿酸深层补水贴片面膜产品使用说明" : "Low-molecular-weight-hyaluronic-acid-sheet-mask-product-guide", current: true },
      ]} />
    </div>;
  },
};

export const States: Story = {
  render: (_args, { globals }) => {
    const locale = globals.locale === "en" ? "en" : "zh";
    return <div style={{ display: "grid", gap: "var(--space-400)", padding: "var(--space-200)", fontFamily: "var(--font-family-ios)", color: "var(--text-primary)" }}>
      <section>
        <p>{locale === "zh" ? "单层当前页 · 无链接" : "Single current page · no link"}</p>
        <Breadcrumb locale={locale} items={[{ label: locale === "zh" ? "首页" : "Home", current: true }]} />
      </section>
      <section>
        <p>{locale === "zh" ? "空路径 · 不渲染导航" : "Empty path · no navigation rendered"}</p>
        <Breadcrumb locale={locale} items={[]} />
      </section>
    </div>;
  },
};
