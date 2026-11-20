import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Input, type InputDensity, type InputProps } from "./Input"
import { InputDensityStates, groupStyle, labelStyle, shellStyle } from "./Input.story-examples"
import stateExamplesSource from "./Input.story-examples.tsx?raw"

const meta = {
  id: "yami-components-forms-input",
  title: "YAMI/Components/Input",
  component: Input,
  parameters: {
    layout: "padded",
    docs: {
      stateSections: {
        Specifications: { zh: "宽松版 · 56 px", en: "Default · 56 px" },
        CompactStates: { zh: "紧凑版 · 40 px", en: "Compact · 40 px" },
      },
      translations: {
        zh: {
          description: "YAMI 单行输入框。PC 与移动端统一为默认 56px（内嵌标签）和紧凑 40px（外置标签）。支持受控与非受控输入、内容清空、辅助说明、错误提示、只读和禁用状态。",
          argDescriptions: {
            label: "字段标签：默认内嵌，紧凑规格放在框外。未提供标签时，需使用外部 label 或 aria-label。",
            density: "规格密度：default 为 56px 内嵌标签，compact 为 40px 外置标签。PC 与移动端同高。",
            helperText: "输入框下方的辅助说明；存在错误提示时隐藏。",
            error: "错误提示内容；设置 aria-invalid，并通过 aria-describedby 关联提示。",
            state: "用于文档和视觉验收的状态覆盖。业务中通常根据值、焦点、错误和禁用状态自动推导。",
            size: "已弃用。请用 density 选择规格。",
            leadingIcon: "输入框前置图标或文字，优先使用 YAMI 的 currentColor SVG 图标。",
            trailingIcon: "输入框尾部图标、文字或操作；交互操作从受控状态读取输入值。",
            prefix: "leadingIcon 的兼容别名。",
            suffix: "trailingIcon 的兼容别名。",
            clearable: "有内容且焦点位于字段内部时显示清空按钮，点击区域 24×24px、图标 20px，错误状态下同样可用；只读或禁用时隐藏。",
            onClear: "清空原生值并触发 input 事件后调用，可用于额外清理。",
            fullWidth: "输入框宽度占满容器。",
            optional: "在标签旁显示选填提示；required 为 true 时不显示。",
            required: "启用原生必填校验，并显示必填标记。",
            disabled: "禁用输入和聚焦，同时隐藏清空按钮；存在错误时保留错误边框与提示，并保持禁用外观。",
            readOnly: "只读状态：允许聚焦和复制，不允许编辑或清空。",
            placeholder: "输入提示文字；不能代替字段标签。",
          },
        },
        en: {
          description: "YAMI single-line input. Default density is 56px with an embedded label. Compact density is 40px with an external label. Both heights apply on mobile and desktop. Supports controlled and uncontrolled values, clearing, helper text, errors, read-only, and disabled states.",
          argDescriptions: {
            label: "Field label: embedded by default, external in compact density. Without it, use an external label or aria-label.",
            density: "Default: 56px, embedded label. Compact: 40px, external label. Both heights apply on mobile and desktop.",
            clearable: "Shows the clear action while the field has a value and contains focus, including error states. Uses a 24×24px hit target and a 20px icon. Hidden when read-only or disabled.",
            readOnly: "Allows focus and copying while preventing edits and clearing.",
            disabled: "Prevents editing and focus and hides clear. Errors retain their border and message alongside the disabled appearance.",
          },
        },
      },
      description: {
        component:
          "YAMI Input Field from Figma `↪ 表单输入 Forms`: embedded label and two densities, clear action, disabled, focus, typing, complete, and error states.",
      },
    },
  },
  argTypes: {
    density: { control: "select", options: ["default", "compact"] },
    state: {
      control: "select",
      options: [
        "default",
        "focused",
        "typing",
        "complete",
        "error",
        "disabled",
        "disabled-filled",
        "disabled-empty",
      ],
    },
    fullWidth: { control: "boolean" },
    clearable: { control: "boolean" },
    optional: { control: "boolean" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    density: "default",
    label: "Label",
    placeholder: "",
    state: undefined,
    fullWidth: false,
    clearable: false,
    optional: false,
    required: false,
    disabled: false,
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

const publicStateExamples = stateExamplesSource.replace('from "./Input"', 'from "@yami/design-system"').trim()

function statePreviewCode(density: InputDensity) {
  return (_source: string, context: { globals: { locale?: string } }) =>
    `${publicStateExamples}\n\n<InputDensityStates density="${density}" english={${context.globals.locale === "en"}} />`
}

export const Specifications: Story = {
  parameters: { docs: { source: { transform: statePreviewCode("default") } } },
  render: (_args, { globals }) => <InputDensityStates density="default" english={globals.locale === "en"} />,
}

export const CompactStates: Story = {
  parameters: { docs: { source: { transform: statePreviewCode("compact") } } },
  render: (_args, { globals }) => <InputDensityStates density="compact" english={globals.locale === "en"} />,
}

export const Showcase: Story = {
  render: (_args, { globals }) => (
    <section data-input-showcase style={shellStyle}>
      <InputDensityStates density="default" english={globals.locale === "en"} />
      <InputDensityStates density="compact" english={globals.locale === "en"} />
    </section>
  ),
  play: async ({ canvasElement }) => {
    const showcase = canvasElement.querySelector<HTMLElement>("[data-input-showcase]")
    const fields = Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-slot="input"]'))
    if (!showcase || fields.length === 0) throw new Error("Input responsive showcase did not render")

    const initialWidth = showcase.style.width
    try {
      showcase.style.width = "288px"
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      const showcaseRight = showcase.getBoundingClientRect().right
      const overflowingStates = fields
        .filter((field) => field.getBoundingClientRect().right > showcaseRight + 0.5)
        .map((field) => field.dataset.state ?? "unknown")
      if (overflowingStates.length > 0) {
        throw new Error(
          `Input overflows a 288px mobile content width: ${overflowingStates.join(", ")}`,
        )
      }
    } finally {
      showcase.style.width = initialWidth
    }

    canvasElement.dataset.inputResponsiveContract = "passed"
  },
}

export const Playground: Story = {
  args: { label: undefined },
  render: (args, { globals }) => {
    const english = globals.locale === "en"
    return <section style={{ ...shellStyle, width: args.fullWidth ? shellStyle.width : "min(320px, 100%)", marginInline: "auto" }}>
      <div data-input-controls style={groupStyle}>
        <p style={labelStyle}>{english ? "Try the input" : "试用输入框"}</p>
        <p style={labelStyle}>{english ? "Change properties in the Controls panel below to see how this input responds." : "在下方 Controls 中调整属性，查看这个输入框的变化。"}</p>
        <Input {...args} label={args.label === undefined ? (english ? "Name" : "姓名") : args.label} />
      </div>
    </section>
  },
}

export const Compact: Story = {
  args: { density: "compact", label: undefined, clearable: true, placeholder: "SAVE10" },
  render: (args, { globals }) => <Input {...args} label={args.label ?? (globals.locale === "en" ? "Promo code" : "折扣码")} />,
}

const supportingTextStyle = {
  marginBlockStart: "var(--space-050)",
  fontSize: "var(--font-size-caption-sm)",
  lineHeight: "var(--line-height-caption-sm)",
}

function ActionInputDemo({ english, ...args }: InputProps & { english: boolean }) {
  const [value, setValue] = useState("")
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState("")
  const label = english ? "Promo code" : "折扣码"
  return <form noValidate onSubmit={(event) => {
    event.preventDefault()
    setError(value.trim() ? "" : english ? "Enter a promo code" : "请输入折扣码")
    setSubmitted(value.trim())
  }}>
    <Input {...args} density="compact" aria-label={label} placeholder={english ? "e.g. SAVE10" : "例如 SAVE10"} value={value} error={error}
      action={{ label: english ? "Redeem" : "兑换", htmlType: "submit" }}
      onChange={(event) => { setValue(event.target.value); setError(""); setSubmitted("") }} />
    {submitted && <p role="status" style={supportingTextStyle}>{english ? "Submitted: " : "已提交："}{submitted}</p>}
  </form>
}

export const WithAction: Story = {
  name: "With Inline Action",
  args: { label: undefined },
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
  render: (args, { globals }) => <ActionInputDemo {...args} english={globals.locale === "en"} />,
}

export const ExternalValidation: Story = {
  render: (_args, { globals }) => {
    const zh = globals.locale !== "en";
    return <div>
      <Input label={zh ? "邮箱" : "Email"} type="email" defaultValue="example"
        aria-invalid aria-describedby="external-email-error" />
      <p id="external-email-error" style={{ ...supportingTextStyle, color: "var(--text-error)" }}>
        {zh ? "请输入完整邮箱地址。" : "Enter a complete email address."}
      </p>
    </div>;
  },
};

export const PCPreview: Story = {
  ...Showcase,
  name: "PC",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiDesktop", isRotated: false } },
  play: undefined,
};

export const MobilePreview: Story = {
  ...Showcase,
  name: "Mobile",
  tags: ["component-device", "dev", "autodocs", "!test"],
  globals: { viewport: { value: "yamiMobile", isRotated: false } },
  play: undefined,
};
