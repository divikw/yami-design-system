import type { CSSProperties } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { userEvent } from "storybook/test"

import { Checkbox } from "./Checkbox"

const meta = {
  id: "yami-components-forms-checkbox",
  title: "YAMI/Components/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "padded",
    controls: { localizeDescriptions: true },
    docs: {
      translations: {
        zh: {
          description: "YAMI 复选框：PC 32px、Mobile 40px 点击区域、20px 可见控件，支持选中、半选、禁用和键盘操作。",
          argDescriptions: {
            density: "两种密度的点击区域均为 PC 32px、Mobile 40px。",
            disabled: "禁用控件，阻止操作和聚焦，且不参与表单提交。",
            required: "启用浏览器原生必填校验。",
            name: "提交表单时使用的字段名称。",
            readOnly: "只读：允许聚焦和提交，但不允许更改。",
            form: "关联的表单元素 ID，可用于表单外的控件。",
            "aria-label": "无可见标签时提供的无障碍名称。",
            checked: "受控选中状态；与 onCheckedChange 配合使用。",
            defaultChecked: "非受控模式的初始选中状态，默认为 false。",
            indeterminate: "半选状态，用于表示分组中仅部分选项被选中。",
            onCheckedChange: "选中状态变化时触发，返回布尔值和 Base UI 事件详情；可调用 details.cancel() 取消变更。",
            value: "选中时随表单提交的值，默认为 on。",
          },
        },
        en: {
          description: "YAMI checkbox with a 32px desktop or 40px mobile target and 20px visible control. Supports checked, mixed, disabled and keyboard states.",
          argDescriptions: {
            density: "Both densities use a 32px target from 1024px and 40px below.",
            disabled: "Disables interaction and focus; excludes the control from form submission.",
            required: "Enables native required-field validation.",
            name: "Field name used when submitting a form.",
            readOnly: "Allows focus and form submission while preventing changes.",
            form: "ID of the owning form, including controls outside that form.",
            "aria-label": "Accessible name when no visible label is present.",
            checked: "Controlled checked state; use with onCheckedChange.",
            defaultChecked: "Initial checked state in uncontrolled mode; defaults to false.",
            indeterminate: "Mixed state indicating that only some items in a group are selected.",
            onCheckedChange: "Receives the boolean checked value and Base UI event details; call details.cancel() to cancel the change.",
            value: "Value submitted while checked; defaults to on.",
          },
        },
      },
      description: {
        component:
          "YAMI Checkbox from Figma `↪ 表单输入 Forms`: 32px desktop or 40px mobile pointer target, 20px visible control, neutral selected state, and Base UI form/keyboard behavior.",
      },
    },
  },
  argTypes: {
    density: { control: "select", options: ["default", "compact"] },
    value: { control: "text" },
    onCheckedChange: { control: false },
    "aria-label": { control: "text" },
    form: { control: "text" },
    readOnly: { control: "boolean" },
    name: { control: "text" },
    checked: { control: "boolean" },
    defaultChecked: { control: "boolean" },
    disabled: { control: "boolean" },
    indeterminate: { control: "boolean" },
    required: { control: "boolean" },
  },
  args: {
    "aria-label": "Checkbox",
    disabled: false,
    indeterminate: false,
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

const showcaseStyle: CSSProperties = {
  display: "grid",
  gap: "var(--space-400)",
  width: "min(560px, 100%)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-family-ios)",
}

const rowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--space-300)",
  alignItems: "center",
}

const optionStyle: CSSProperties = {
  display: "inline-flex",
  gap: 0,
  alignItems: "center",
  minHeight: "var(--space-600)",
  color: "var(--text-primary)",
  fontSize: "var(--font-size-body-md)",
  lineHeight: "var(--line-height-body-md)",
}

function Example({
  id,
  label,
  checked = false,
  disabled = false,
  indeterminate = false,
}: {
  id: string
  label: string
  checked?: boolean
  disabled?: boolean
  indeterminate?: boolean
}) {
  return (
    <label htmlFor={id} style={{ ...optionStyle, color: disabled ? "var(--text-disabled)" : undefined }}>
      <Checkbox
        id={id}
        data-demo={id === "checkbox-default" ? "unchecked" : undefined}
        checked={checked}
        disabled={disabled}
        indeterminate={indeterminate}
      />
      <span>{label}</span>
    </label>
  )
}

export const Showcase: Story = {
  render: () => (
    <section data-checkbox-showcase style={showcaseStyle}>
      <div style={rowStyle}>
        <Example id="checkbox-default" label="Default" />
        <Example id="checkbox-selected" label="Selected" checked />
        <Example id="checkbox-disabled-selected" label="Disabled selected" checked disabled />
        <Example id="checkbox-disabled" label="Disabled" disabled />
        <Example id="checkbox-mixed" label="Mixed" indeterminate />
      </div>
      <label htmlFor="checkbox-interactive" style={optionStyle}>
        <Checkbox id="checkbox-interactive" data-demo="interactive" />
        <span>Save payment method · 保存付款方式</span>
      </label>
    </section>
  ),
  play: async ({ canvasElement }) => {
    const checkbox = canvasElement.querySelector<HTMLElement>('[data-demo="interactive"]')
    if (!checkbox) throw new Error("Checkbox interaction specimen did not render")

    const targetSize = window.matchMedia("(min-width: 1024px)").matches ? 32 : 40
    const rootStyle = getComputedStyle(checkbox)
    const visibleStyle = getComputedStyle(checkbox, "::before")
    const uncheckedCheckbox = canvasElement.querySelector<HTMLElement>(
      '[data-demo="unchecked"]',
    )
    const indicator = uncheckedCheckbox?.querySelector<HTMLElement>(
      '[data-slot="checkbox-indicator"]',
    )
    if (
      rootStyle.width !== `${targetSize}px` ||
      rootStyle.height !== `${targetSize}px` ||
      visibleStyle.width !== "20px" ||
      visibleStyle.height !== "20px" ||
      visibleStyle.borderRadius !== "4px" ||
      visibleStyle.inset !== `${(targetSize - 20) / 2}px`
    ) {
      throw new Error("Checkbox must retain its 20px control, responsive pointer target, and 4px radius")
    }
    if (visibleStyle.borderColor !== "rgba(0, 0, 0, 0.08)") {
      throw new Error("Unchecked Checkbox must use the subtle default border token")
    }

    if (!uncheckedCheckbox) throw new Error("Unchecked Checkbox specimen did not render")
    await userEvent.hover(uncheckedCheckbox)
    if (
      indicator &&
      getComputedStyle(uncheckedCheckbox).color !== "rgba(0, 0, 0, 0)"
    ) {
      throw new Error("Unchecked Checkbox must not reveal its indicator on hover")
    }
    await userEvent.unhover(uncheckedCheckbox)

    checkbox.click()
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

    if (checkbox.getAttribute("aria-checked") !== "true") {
      throw new Error("Checkbox did not expose its selected state")
    }
    await userEvent.hover(checkbox)
    const selectedHover = getComputedStyle(checkbox, "::before")
    const selectedHoverRgb = selectedHover.backgroundColor.match(/[\d.]+/g)?.slice(0, 3).map(Number)
    if (!selectedHoverRgb || selectedHoverRgb.some((channel) => channel > 64)) {
      throw new Error("Selected Checkbox hover must retain a dark selected surface")
    }
    await userEvent.unhover(checkbox)
    canvasElement.dataset.checkboxInteractionContract = "passed"
  },
}

export const Playground: Story = {
  render: (args) => <Checkbox {...args} />,
}

export const Selected: Story = { args: { defaultChecked: true } }
export const DisabledSelected: Story = { args: { defaultChecked: true, disabled: true } }
export const Indeterminate: Story = { args: { indeterminate: true } }

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
