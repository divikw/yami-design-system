import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Pagination, type PaginationProps } from "./Pagination";
import styles from "./Pagination.stories.module.css";

const descriptions = {
  zh: {
    description: "仅 PC 使用的数字分页，1024px 起显示。优先显示前 9 页、一个省略号和末页，支持受控更新、原生链接、中英文及独立蓝色键盘焦点。",
    argDescriptions: {
      page: "当前页，从 1 开始。",
      pageCount: "总页数，非负整数；0 时不渲染。",
      inverse: "在当前主题的反色背景上使用。",
      disabled: "禁用全部分页操作。",
      locale: "控件和无障碍名称的语言；示例跟随工具栏语言。",
      onPageChange: "报告目标页；页面负责加载结果和更新 page。",
      getPageHref: "返回真实页面地址，与 onPageChange 互斥。",
    },
  },
  en: {
    description: "PC-only pagination, visible from 1024px. Shows the first nine pages, an ellipsis and the last page, with controlled updates, native links, bilingual labels and independent blue keyboard focus.",
    argDescriptions: {
      page: "Current page, starting at 1.",
      pageCount: "Non-negative integer page count; zero renders nothing.",
      inverse: "Use on the active theme's opposite-polarity surface.",
      disabled: "Disable all pagination actions.",
      locale: "Language of controls and accessible names; examples follow the toolbar.",
      onPageChange: "Report the destination; the host loads results and updates page.",
      getPageHref: "Return a real destination; mutually exclusive with onPageChange.",
    },
  },
};

const meta = {
  title: "YAMI/Components/Navigation/Pagination",
  component: Pagination,
  globals: { viewport: { value: "yamiDesktopMd", isRotated: false } },
  decorators: [(Story, { viewMode }) => (
    <div className={viewMode === "docs" ? styles.docsPreview : undefined}><Story /></div>
  )],
  parameters: {
    layout: "padded",
    docs: {
      playground: "Playground", showStories: false, translations: descriptions,
    },
  },
  args: { page: 1, pageCount: 25, onPageChange: fn(), inverse: false, disabled: false },
  argTypes: {
    page: { control: { type: "number", min: 1, step: 1 } },
    pageCount: { control: { type: "number", min: 0, step: 1 } },
    inverse: { control: "boolean" },
    disabled: { control: "boolean" },
    locale: { control: false },
    getPageHref: { control: false },
    onPageChange: { control: false },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ page: initialPage, pageCount, inverse, disabled, locale, onPageChange }: PaginationProps) {
  const [page, setPage] = useState(initialPage);
  return (
    <section style={{ padding: "var(--space-200)", background: inverse ? "var(--surface-inverse)" : "var(--surface-primary)", color: inverse ? "var(--text-primary-inverse)" : "var(--text-primary)" }}>
      <p aria-live="polite">{locale === "zh" ? `第 ${page} 页的结果` : `Results for page ${page}`}</p>
      <Pagination page={page} pageCount={pageCount} inverse={inverse} disabled={disabled} locale={locale}
        onPageChange={(next) => { setPage(next); onPageChange?.(next); }} />
    </section>
  );
}

export const Showcase: Story = {
  name: "Overview",
  render: (_args, { globals }) => {
    const locale = globals.locale === "en" ? "en" : "zh";
    return (
      <div style={{ display: "grid", gap: "var(--space-300)", maxWidth: 900, fontFamily: "var(--font-family-ios)", color: "var(--text-primary)" }}>
        <p>{locale === "zh" ? "PC 分页 · 1024px 起显示，移动端隐藏" : "PC pagination · visible from 1024px, hidden on mobile"}</p>
        {[1, 25].map((page) => (
          <Demo key={page} page={page} pageCount={25} locale={locale} onPageChange={fn()} />
        ))}
        <Demo page={1} pageCount={25} locale={locale} inverse onPageChange={fn()} />
      </div>
    );
  },
};

export const Playground: Story = {
  render: (args, { globals }) => (
    <Demo key={`${args.page}-${args.pageCount}`} {...args} locale={globals.locale === "en" ? "en" : "zh"} />
  ),
  play: async ({ canvasElement, globals }) => {
    if (import.meta.env.MODE !== "test") return;
    const canvas = within(canvasElement);
    const zh = globals.locale !== "en";
    const nav = canvas.getByRole("navigation", { name: zh ? "分页导航" : "Pagination" });
    await expect(within(nav).queryByRole("button", { name: zh ? "上一页" : "Previous page" })).toBeNull();
    await expect(within(nav).queryByRole("button", { name: zh ? "下一页" : "Next page" })).toBeNull();
    await expect(nav.querySelector(":focus-visible")).toBeNull();
    await userEvent.click(within(nav).getByRole("button", { name: zh ? "第 2 页" : "Page 2", exact: true }));
    await expect(canvas.getByText(zh ? "第 2 页的结果" : "Results for page 2")).toBeVisible();
    await expect(within(nav).getByRole("button", { name: zh ? "第 2 页" : "Page 2", exact: true })).toHaveAttribute("aria-current", "page");
  },
};

export const Links: Story = {
  name: "Links",
  render: (_args, { globals }) => <Pagination page={3} pageCount={25} locale={globals.locale === "en" ? "en" : "zh"} getPageHref={(page) => `?page=${page}`} />,
};

export const Disabled: Story = {
  name: "States",
  render: (_args, { globals }) => {
    const locale = globals.locale === "en" ? "en" : "zh";
    const zh = locale === "zh";
    return (
      <div className={styles.states}>
        <section className={styles.state}>
          <h2>{zh ? "禁用" : "Disabled"}</h2>
          <Pagination page={3} pageCount={25} locale={locale} disabled onPageChange={fn()} />
        </section>
        <section className={styles.state}>
          <h2>{zh ? "单页" : "Single page"}</h2>
          <Pagination page={1} pageCount={1} locale={locale} onPageChange={fn()} />
        </section>
        <section className={styles.state}>
          <h2>{zh ? "空状态" : "Empty"}</h2>
          <p className={styles.hint}>{zh ? "总页数为 0 时不显示分页。" : "Pagination is hidden when the page count is zero."}</p>
          <Pagination page={1} pageCount={0} locale={locale} onPageChange={fn()} />
        </section>
      </div>
    );
  },
};
