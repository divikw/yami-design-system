import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./Tooltip";
import { HoverTooltip, LibraryHint } from "./examples";

const meta = {
  id: "yami-components-layout-tooltip",
  title: "YAMI/Components/Tooltip",
  component: Tooltip,
  subcomponents: { TooltipProvider, TooltipTrigger, TooltipContent },
  parameters: {
    docs: {
      source: { code: `import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@yami/design-system";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button variant="tertiary" size="sm" style={{ border: "var(--stroke-default) solid var(--border-default)" }} />}>
      Hover
    </TooltipTrigger>
    <TooltipContent>Add to library</TooltipContent>
  </Tooltip>
</TooltipProvider>` },
      translations: {
        zh: { description: "悬停或键盘聚焦时显示的简短补充提示，使用 YAMI 反色表面。", argDescriptions: { side: "首选出现方向，空间不足时自动避让。", sideOffset: "与触发器的间距，单位为 px。", align: "相对于触发器的对齐方式。" } },
        en: { description: "A short supplementary hint on hover or keyboard focus with a YAMI inverse surface.", argDescriptions: {} },
      },
    },
  },
  render: (_, { globals }) => <HoverTooltip locale={globals.locale === "en" ? "en" : "zh"} />,
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: /Hover|悬停/ });
    const hint = () => canvasElement.ownerDocument.querySelector('[data-slot="tooltip-content"]');
    await userEvent.hover(trigger);
    await waitFor(() => expect(hint()).toHaveTextContent(/Add to library|添加到资料库/));
    await waitFor(() => expect(hint()?.querySelector('[data-slot="tooltip-arrow"]')).toBeVisible());
    await userEvent.unhover(trigger);
    await waitFor(() => expect(hint()).not.toBeInTheDocument());
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await waitFor(() => expect(hint()).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(hint()).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

export const Dismissible: Story = {
  render: (_, { globals }) => <LibraryHint locale={globals.locale === "en" ? "en" : "zh"} />,
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole("button", { name: /资料库提示|Library tips/ });
    const close = await page.findByRole("button", { name: /关闭提示|Close tip/ });
    await expect(close).not.toHaveFocus();
    await userEvent.click(close);
    await waitFor(() => expect(page.queryByRole("dialog")).not.toBeInTheDocument());
    await userEvent.click(trigger);
    await waitFor(() => expect(page.getByRole("dialog")).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("dialog")).not.toBeInTheDocument());
  },
};

const deviceExamples: Story["render"] = (_, { globals }) => {
  const locale = globals.locale === "en" ? "en" : "zh";
  return <div style={{ display: "grid", justifyItems: "center", gap: "var(--space-800)" }}>
    <HoverTooltip locale={locale} />
    <LibraryHint locale={locale} />
  </div>;
};

export const PCPreview: Story = {
  name: "PC",
  render: deviceExamples,
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiDesktop", isRotated: false } },
};

export const MobilePreview: Story = {
  name: "Mobile",
  render: deviceExamples,
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
};
