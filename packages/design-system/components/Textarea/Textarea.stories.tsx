import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Textarea } from "./Textarea";
import { NotesTextarea } from "./examples";

const meta = {
  id: "yami-components-forms-textarea",
  title: "YAMI/Components/Textarea",
  component: Textarea,
  parameters: {
    layout: "padded",
    docs: {
      translations: {
        zh: { description: "用于订单备注等多行文本输入，沿用 YAMI 表单状态。", argDescriptions: { rows: "初始可见行数。", readOnly: "允许聚焦与复制。", "aria-invalid": "展示错误边框并声明无效状态。" } },
        en: { description: "A multiline input for content such as order notes, using YAMI form states.", argDescriptions: {} },
      },
      stateSections: { States: { zh: "只读、禁用与错误", en: "Read-only, disabled and invalid" } },
    },
  },
  render: (args, { globals }) => <NotesTextarea {...args} locale={globals.locale === "en" ? "en" : "zh"} />,
} satisfies Meta<typeof Textarea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  parameters: { docs: { source: { code: 'import { Textarea } from "@yami/design-system";\n\n<label>Order notes <Textarea placeholder="Add a note for your order" /></label>' } } },
  play: async ({ canvasElement }) => {
    const control = within(canvasElement).getByRole("textbox", { name: /Order notes|订单备注/ });
    await userEvent.click(control);
    await userEvent.type(control, "Leave at the door{Enter}Ring the bell");
    await expect(control).toHaveValue("Leave at the door\nRing the bell");
  },
};

export const States: Story = {
  render: (_, { globals }) => {
    const locale = globals.locale === "en" ? "en" : "zh";
    const en = locale === "en";
    return <div style={{ display: "grid", gap: "var(--space-200)" }}>
      <NotesTextarea locale={locale} readOnly defaultValue={en ? "Delivery notes are locked." : "配送备注已锁定。"} />
      <NotesTextarea locale={locale} disabled />
      <NotesTextarea locale={locale} aria-invalid="true" aria-describedby="textarea-error" />
      <p id="textarea-error" style={{ color: "var(--text-error)", margin: 0 }}>
        {en ? "Enter an order note." : "请输入订单备注。"}
      </p>
    </div>;
  },
  parameters: { docs: { source: { code: `import { Textarea } from "@yami/design-system";

<Textarea aria-label="Order notes" readOnly defaultValue="Delivery notes are locked." />
<Textarea aria-label="Order notes" disabled placeholder="Add a note for your order" />
<label>
  Order notes
  <Textarea placeholder="Add a note for your order" aria-invalid="true" aria-describedby="notes-error" />
  <span id="notes-error">Enter an order note.</span>
</label>` } } },
};

export const PCPreview: Story = {
  parameters: Showcase.parameters,
  name: "PC",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiDesktop", isRotated: false } },
};

export const MobilePreview: Story = {
  parameters: Showcase.parameters,
  name: "Mobile",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
};
