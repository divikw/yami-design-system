import type { CSSProperties, ReactNode } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { RadioGroup, RadioGroupItem } from "./RadioGroup"

const meta = {
  id: "yami-components-forms-radio-group",
  title: "YAMI/Components/Radio Group",
  component: RadioGroup,
  parameters: {
    layout: "padded",
    controls: { localizeDescriptions: true },
    docs: {
      translations: {
        zh: {
          description: "YAMI 单选组：同组仅允许选中一项，支持方向键切换、禁用和原生表单提交。",
          argDescriptions: {
            disabled: "禁用控件，阻止操作和聚焦，且不参与表单提交。",
            required: "启用浏览器原生必填校验。",
            name: "提交表单时使用的字段名称。",
            readOnly: "只读：允许聚焦和提交，但不允许更改。",
            form: "关联的表单元素 ID，可用于表单外的控件。",
            "aria-label": "无可见标签时提供的无障碍名称。",
            value: "受控选中项的字符串值；null 表示未选择。",
            defaultValue: "非受控模式的初始选中项。",
            onValueChange: "选中项变化时触发；返回字符串或 null，以及 Base UI 事件详情。",
            loop: "方向键到达首尾时是否循环，默认为 true。",
          },
        },
        en: {
          description: "YAMI radio group with exclusive selection, arrow-key navigation, disabled states and native form submission.",
          argDescriptions: {
            disabled: "Disables interaction and focus; excludes the control from form submission.",
            required: "Enables native required-field validation.",
            name: "Field name used when submitting a form.",
            readOnly: "Allows focus and form submission while preventing changes.",
            form: "ID of the owning form, including controls outside that form.",
            "aria-label": "Accessible name when no visible label is present.",
            value: "Controlled selected string value; null means no selection.",
            defaultValue: "Initially selected value in uncontrolled mode.",
            onValueChange: "Receives the selected string or null and Base UI event details.",
            loop: "Whether arrow-key navigation wraps at either end; defaults to true.",
          },
        },
      },
      description: {
        component:
          "YAMI Radio Button from Figma `↪ 表单输入 Forms`, composed as an accessible Base UI RadioGroup for exclusive selection and arrow-key navigation.",
      },
    },
  },
  argTypes: {
    loop: { control: "boolean" },
    onValueChange: { control: false },
    defaultValue: { control: "text" },
    value: { control: "text" },
    "aria-label": { control: "text" },
    form: { control: "text" },
    readOnly: { control: "boolean" },
    name: { control: "text" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
  },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

const showcaseStyle: CSSProperties = {
  display: "grid",
  gap: "var(--space-400)",
  width: "min(620px, 100%)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-family-ios)",
}

const stateRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--space-300)",
  alignItems: "center",
}

const optionStyle: CSSProperties = {
  display: "inline-flex",
  minHeight: "var(--space-600)",
  alignItems: "center",
  gap: 0,
  color: "var(--text-primary)",
  fontSize: "var(--font-size-body-md)",
  lineHeight: "var(--line-height-body-md)",
}

const titleStyle: CSSProperties = {
  margin: 0,
  color: "var(--text-secondary)",
  fontSize: "var(--font-size-caption-md)",
  lineHeight: "var(--line-height-caption-md)",
}

function Option({ value, children, disabled = false, demo }: { value: string; children: ReactNode; disabled?: boolean; demo?: string }) {
  return (
    <label style={{ ...optionStyle, color: disabled ? "var(--text-disabled)" : undefined }}>
      <RadioGroupItem value={value} disabled={disabled} data-demo={demo} />
      <span>{children}</span>
    </label>
  )
}

export const Showcase: Story = {
  render: () => (
    <section data-radio-showcase style={showcaseStyle}>
      <div>
        <p style={titleStyle}>Figma states</p>
        <div style={stateRowStyle}>
          <RadioGroup aria-label="Default example">
            <Option value="default" demo="unchecked">Default</Option>
          </RadioGroup>
          <RadioGroup aria-label="Selected example" value="selected">
            <Option value="selected" demo="selected">Selected</Option>
          </RadioGroup>
          <RadioGroup aria-label="Disabled selected example" defaultValue="selected" disabled>
            <Option value="selected">Disabled selected</Option>
          </RadioGroup>
          <RadioGroup aria-label="Disabled example" disabled>
            <Option value="disabled">Disabled</Option>
          </RadioGroup>
        </div>
      </div>

      <div>
        <p style={titleStyle}>Payment method · 付款方式</p>
        <RadioGroup name="payment-method" defaultValue="card" data-demo="interactive">
          <Option value="card">Card · 银行卡</Option>
          <Option value="apple-pay">Apple Pay</Option>
          <Option value="google-pay">Google Pay</Option>
        </RadioGroup>
      </div>
    </section>
  ),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector<HTMLElement>('[data-demo="interactive"]')
    const radios = Array.from(group?.querySelectorAll<HTMLElement>('[role="radio"]') ?? [])
    const unchecked = canvasElement.querySelector<HTMLElement>('[data-demo="unchecked"]')
    if (radios.length !== 3) throw new Error("RadioGroup interaction specimen did not render")
    if (!unchecked) throw new Error("RadioGroup state specimens did not render")

    const uncheckedStyle = getComputedStyle(unchecked)
    const uncheckedSurface = getComputedStyle(unchecked, "::before")
    if (
      uncheckedStyle.width !== "40px" ||
      uncheckedStyle.height !== "40px" ||
      uncheckedSurface.width !== "20px" ||
      uncheckedSurface.height !== "20px" ||
      uncheckedSurface.inset !== "10px" ||
      uncheckedSurface.borderColor !== "rgba(0, 0, 0, 0.08)"
    ) {
      throw new Error("RadioGroupItem must match the Checkbox geometry and subtle border")
    }

    radios[1].click()
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

    const selected = radios.filter((radio) => radio.getAttribute("aria-checked") === "true")
    if (selected.length !== 1 || selected[0] !== radios[1]) {
      throw new Error("RadioGroup did not preserve exclusive selection")
    }
    canvasElement.dataset.radioInteractionContract = "passed"
  },
}

export const Playground: Story = {
  render: (args) => (
    <RadioGroup {...args} defaultValue="card">
      <Option value="card">Card · 银行卡</Option>
      <Option value="apple-pay">Apple Pay</Option>
      <Option value="google-pay">Google Pay</Option>
    </RadioGroup>
  ),
}

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="card" disabled>
      <Option value="card">Card · 银行卡</Option>
      <Option value="apple-pay">Apple Pay</Option>
    </RadioGroup>
  ),
}

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
