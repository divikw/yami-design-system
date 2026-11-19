import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Field, FieldDescription, FieldError, FieldLabel } from "./Field";
import { DeliveryPreferences } from "./delivery/examples";
import { NotesField } from "./examples";

const source = `import { Field, FieldError, FieldLabel, Textarea } from "@yami/design-system";

<Field name="notes" validationMode="onBlur">
  <FieldLabel>Delivery notes (required)</FieldLabel>
  <Textarea required maxLength={120} placeholder="Add any drop-off instructions, up to 120 characters." />
  <FieldError match="valueMissing">Enter your delivery notes.</FieldError>
</Field>`;

const meta = {
  id: "yami-components-forms-field",
  title: "YAMI/Components/Field",
  component: Field,
  subcomponents: { FieldLabel, FieldDescription, FieldError },
  parameters: {
    layout: "padded",
    docs: {
      source: { code: source },
      translations: {
        zh: {
          description: "组合表单标签、输入控件、说明与错误，自动关联可访问名称、描述和校验状态。",
          argDescriptions: { validationMode: "校验触发时机，支持提交、失焦和输入时。", validate: "返回面向用户的自定义错误文案。", invalid: "从外部表单状态标记字段无效。" },
        },
        en: { description: "Group a form control, label, description and error with automatic accessibility and validation wiring.", argDescriptions: {} },
      },
      stateSections: { Disabled: { zh: "禁用字段", en: "Disabled field" } },
    },
  },
  render: (args, { globals }) => <NotesField {...args} locale={globals.locale === "en" ? "en" : "zh"} />,
} satisfies Meta<typeof Field>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText(/Delivery notes \(required\)|配送备注（必填）/);
    const control = canvas.getByRole("textbox", { name: /Delivery notes|配送备注/ });
    await expect(control).toHaveAttribute("placeholder", expect.stringMatching(/drop-off instructions|填写送达说明/));
    await userEvent.click(label);
    await expect(control).toHaveFocus();
    await userEvent.type(control, "Side door");
    await userEvent.clear(control);
    await userEvent.tab();
    const error = await canvas.findByRole("alert");
    await expect(control).toHaveAttribute("aria-invalid", "true");
    await expect(control.getAttribute("aria-describedby")?.split(" ")).toContain(error.id);
    await userEvent.type(control, "Leave at the door");
    await userEvent.tab();
    await waitFor(() => expect(canvas.queryByRole("alert")).not.toBeInTheDocument());
    await expect(control).not.toHaveAttribute("aria-invalid");
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  parameters: { docs: { source: { code: source.replace('<Field name="notes" validationMode="onBlur">', '<Field name="notes" disabled>') } } },
};

export const PCPreview: Story = {
  name: "PC",
  render: (_, { globals }) => <DeliveryPreferences locale={globals.locale === "en" ? "en" : "zh"} />,
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiDesktop", isRotated: false } },
};

export const MobilePreview: Story = {
  name: "Mobile",
  render: (_, { globals }) => <DeliveryPreferences locale={globals.locale === "en" ? "en" : "zh"} />,
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
};
