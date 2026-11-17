import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./Accordion";
import { ControlledAccordion } from "./examples";

const copy = {
  zh: {
    specifications: "商品规格",
    specificationsBody: "单盒 200 毫升，每组 6 盒。",
    nutrition: "营养成分表",
    nutritionBody: "热量、蛋白质、脂肪及糖含量，请查看包装上的营养成分表。",
    ingredients: "配料",
    ingredientsBody: "完整配料及过敏原信息见包装标签，选购前请仔细核对。",
    disclaimer: "免责声明",
    disclaimerBody: "商品图片仅供参考，包装与标签可能更新，请以收到的实物为准。",
    longLabel: "关于商品包装更新、配料及过敏原信息的详细说明，请在购买及食用前仔细阅读",
    longBody: "商品包装可能因批次更新，图片仅供参考。选购前请核对规格、配料和过敏原信息；收到商品后，请留意包装上的日期及储存说明。",
    link: "查看商品标签说明",
    collapse: "收起内容",
  },
  en: {
    specifications: "Specifications",
    specificationsBody: "6 cartons per pack, 200 ml each.",
    nutrition: "Nutrition facts",
    nutritionBody: "Check the nutrition label for calories, protein, fat and sugar content.",
    ingredients: "Ingredients",
    ingredientsBody: "Review the full ingredient list and allergen information on the packaging before purchasing.",
    disclaimer: "Disclaimer",
    disclaimerBody: "Images are for reference. Packaging and labels may change; refer to the item you receive.",
    longLabel: "Details about packaging updates, ingredients and allergen information to read before purchasing or consuming this product",
    longBody: "Packaging may vary by batch. Before purchasing, check the size, ingredients and allergen information. When your order arrives, review the date and storage instructions on the label.",
    link: "Read the label guide",
    collapse: "Collapse content",
  },
};

const meta = {
  id: "yami-components-layout-accordion",
  title: "YAMI/Components/Accordion",
  component: Accordion,
  parameters: {
    layout: "padded",
    docs: {
      toc: { headingSelector: "h2" },
      playground: "Playground",
      showStories: false,
      translations: {
        zh: { description: "按标题展开或收起内容，适用于商品规格、营养成分和常见问题。" },
        en: { description: "Expand or collapse content by its heading. Use it for product details, nutrition facts, and frequently asked questions." },
      },
    },
  },
  args: { multiple: false, disabled: false, keepMounted: false, defaultValue: [] },
  argTypes: {
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
    keepMounted: { control: "boolean" },
    value: { control: "object" },
    defaultValue: { control: "object" },
    onValueChange: { control: false },
  },
  decorators: [(Story) => <div style={{ width: "min(656px, 100%)" }}><Story /></div>],
  render: (args, { globals }) => {
    const t = copy[globals.locale === "zh" ? "zh" : "en"];
    return <Accordion {...args}>
      <AccordionItem value="nutrition">
        <AccordionTrigger>{t.nutrition}</AccordionTrigger>
        <AccordionContent><p>{t.nutritionBody}</p></AccordionContent>
      </AccordionItem>
    </Accordion>;
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

function ProductDetailsGroup({ text, multiple }: { text: typeof copy.en; multiple?: boolean }) {
  return (
    <Accordion defaultValue={["specifications"]} multiple={multiple} keepMounted>
      {([
        ["specifications", text.specifications, text.specificationsBody],
        ["nutrition", text.nutrition, text.nutritionBody],
        ["ingredients", text.ingredients, text.ingredientsBody],
        ["disclaimer", text.disclaimer, text.disclaimerBody],
      ] as const).map(([value, label, body]) => (
        <AccordionItem key={value} value={value}>
          <AccordionTrigger>{label}</AccordionTrigger>
          <AccordionContent><p>{body}</p></AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export const Showcase: Story = {
  name: "PC",
  tags: ["component-device"],
  globals: { viewport: { value: "yamiDesktop", isRotated: false } },
  render: (_, { globals }) => <ProductDetailsGroup text={copy[globals.locale === "zh" ? "zh" : "en"]} multiple />
};

export const Mobile: Story = {
  name: "Mobile",
  tags: ["component-device"],
  render: Showcase.render,
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
};

export const Playground: Story = { tags: ["!dev"] };

export const SingleExpansion: Story = {
  name: "Single expansion",
  tags: ["!dev"],
  render: (_, { globals }) => <ProductDetailsGroup text={copy[globals.locale === "zh" ? "zh" : "en"]} />,
  play: async ({ canvasElement }) => {
    const [first, second] = within(canvasElement).getAllByRole("button");
    await userEvent.click(second!);
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(second).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(second!);
    await expect(second).toHaveAttribute("aria-expanded", "false");
  },
};

export const KeyboardAndExpansion: Story = {
  tags: ["!dev"],
  render: Showcase.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const triggers = canvas.getAllByRole("button");
    const panels = Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-slot="accordion-content"]'));
    await expect(triggers[0]).toHaveAttribute("aria-expanded", "true");
    await expect(panels[0]).toBeVisible();
    await expect(panels[1]).not.toBeVisible();
    await userEvent.click(triggers[1]!);
    await userEvent.click(triggers[2]!);
    await expect(panels[0]).toBeVisible();
    await expect(panels[1]).toBeVisible();
    await expect(panels[2]).toBeVisible();
    await userEvent.keyboard("{Enter}");
    await expect(triggers[2]).toHaveAttribute("aria-expanded", "false");
    await expect(panels[2]).not.toBeVisible();
    await userEvent.keyboard(" ");
    await expect(panels[2]).toBeVisible();
    await userEvent.tab();
    await expect(triggers[3]).toHaveFocus();
    await expect(triggers[3]).toHaveStyle({ outlineStyle: "solid", outlineWidth: "2px" });
    for (const [index, trigger] of triggers.entries()) {
      if (trigger.getAttribute("aria-expanded") === "true") {
        await expect(trigger).toHaveAttribute("aria-controls", panels[index]!.id);
      }
      await expect(panels[index]).toHaveAttribute("aria-labelledby", trigger.id);
      await expect(trigger.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    }
    await expect(new Set(panels.map((panel) => panel.id)).size).toBe(panels.length);
  },
};

export const Controlled: Story = {
  tags: ["!dev"],
  render: (_, { globals }) => <ControlledAccordion locale={globals.locale === "zh" ? "zh" : "en"} />,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const t = copy[globals.locale === "zh" ? "zh" : "en"];
    const trigger = canvas.getByRole("button", { name: t.nutrition });
    await userEvent.click(trigger);
    await expect(canvas.getByRole("region", { name: t.nutrition })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: t.collapse }));
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.queryByRole("region", { name: t.nutrition })).toBeNull();
  },
};

export const ControlledWithoutUpdate: Story = {
  tags: ["!dev"],
  args: { value: [], onValueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole("button");
    await userEvent.click(trigger);
    await expect(args.onValueChange).toHaveBeenCalledWith(["nutrition"], expect.objectContaining({ reason: "trigger-press" }));
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(canvasElement.querySelector('[data-slot="accordion-content"]')).toBeNull();
  },
};

export const Disabled: Story = {
  tags: ["!dev"],
  args: { disabled: true, onValueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole("button");
    await expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const MobileKeyboardAndExpansion: Story = {
  ...KeyboardAndExpansion,
  tags: ["!dev"],
  globals: { viewport: { value: "yamiMobileSm", isRotated: false } },
};

export const Dark: Story = {
  ...KeyboardAndExpansion,
  tags: ["!dev"],
  globals: { theme: "dark" },
};

export const LongContent: Story = {
  tags: ["!dev"],
  globals: { viewport: { value: "yamiMobileSm", isRotated: false } },
  render: (_, { globals }) => {
    const t = copy[globals.locale === "zh" ? "zh" : "en"];
    return (
      <div style={{ maxWidth: 280 }}>
        <Accordion defaultValue={["details"]} keepMounted>
          <AccordionItem value="details">
            <AccordionTrigger>{t.longLabel}</AccordionTrigger>
            <AccordionContent>
              <p>{t.longBody}</p>
              <a href="#accordion-details">{t.link}</a>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");
    trigger.focus();
    await userEvent.tab();
    await expect(canvas.getByRole("link")).toHaveFocus();
    await userEvent.click(trigger);
    await userEvent.tab();
    await expect(canvas.getByRole("link", { hidden: true })).not.toHaveFocus();
    await userEvent.click(trigger);
    const root = canvasElement.querySelector<HTMLElement>('[data-slot="accordion"]')!;
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
    await expect(canvasElement.querySelector('[data-slot="accordion-icon"]')).toHaveStyle({ width: "16px" });
  },
};
