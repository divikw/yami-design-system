import type { CSSProperties } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Input, type InputState } from "./Input"

const meta = {
  title: "YAMI/Components/Forms/Input",
  component: Input,
  parameters: {
    layout: "padded",
    docs: {
      translations: {
        zh: {
          description: "YAMI 单行输入框。默认规格采用内嵌标签，移动端 48px、桌面端 56px；紧凑规格采用外置标签和单行内容，移动端 48px、桌面端 40px。支持受控与非受控输入、内容清空、辅助说明、错误提示、只读和禁用状态。",
          argDescriptions: {
            label: "字段标签：默认内嵌，紧凑规格放在框外。未提供标签时，需使用外部 label 或 aria-label。",
            density: "规格密度：default 为内嵌标签，移动端 48px / 桌面端 56px；compact 为外置标签和单行内容，移动端 48px / 桌面端 40px。",
            helperText: "输入框下方的辅助说明；存在错误提示时隐藏。",
            error: "错误提示内容；设置 aria-invalid，并通过 aria-describedby 关联提示。",
            state: "用于文档和视觉验收的状态覆盖。业务中通常根据值、焦点、错误和禁用状态自动推导。",
            size: "已弃用。输入框按移动端与桌面端自适应；保留该属性以兼容旧代码。",
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
          description: "YAMI single-line input. Default density has an embedded label at 48px mobile / 56px desktop. Compact density has an external label and a single value row at 48px mobile / 40px desktop. Supports controlled and uncontrolled values, clearing, helper text, errors, read-only, and disabled states.",
          argDescriptions: {
            label: "Field label: embedded by default, external in compact density. Without it, use an external label or aria-label.",
            density: "Default: embedded label, 48px mobile / 56px desktop. Compact: external label and a single value row, 48px mobile / 40px desktop.",
            clearable: "Shows the clear action while the field has a value and contains focus, including error states. Uses a 24×24px hit target and a 20px icon. Hidden when read-only or disabled.",
            readOnly: "Allows focus and copying while preventing edits and clearing.",
            disabled: "Prevents editing and focus and hides clear. Errors retain their border and message alongside the disabled appearance.",
          },
        },
      },
      description: {
        component:
          "YAMI Input Field from Figma `↪ 表单输入 Forms`: embedded label, responsive Mobile/PC sizing, clear action, disabled, focus, typing, complete, and error states.",
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

const shellStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-500)",
  width: "min(760px, 100%)",
  fontFamily: "var(--font-family-ios)",
}

const groupStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-200)",
  minWidth: 0,
  maxWidth: "100%",
}

const rowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--space-200)",
  alignItems: "flex-start",
}

const labelStyle: CSSProperties = {
  margin: 0,
  color: "var(--text-secondary)",
  fontSize: "var(--font-size-body-md)",
  lineHeight: "var(--line-height-body-md)",
  fontWeight: "var(--font-weight-normal)",
}

// Search icon from packages/design-system/assets/icons/action/search.svg.
// Inlined as a component so Storybook renders the canonical currentColor SVG
// path without depending on bundler-specific SVG imports.
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10.5001 3C14.6422 3 18.0001 6.35786 18.0001 10.5C18.0001 12.3009 17.3637 13.9522 16.3058 15.2451L21.088 20.0273L20.0274 21.0879L15.2452 16.3057C13.9523 17.3636 12.301 18 10.5001 18C6.35796 18 3.0001 14.6421 3.0001 10.5C3.0001 6.35786 6.35796 3 10.5001 3ZM10.5001 4.60742C7.24556 4.60742 4.60752 7.24546 4.60752 10.5C4.60752 13.7545 7.24556 16.3926 10.5001 16.3926C13.7546 16.3926 16.3927 13.7545 16.3927 10.5C16.3927 7.24546 13.7546 4.60742 10.5001 4.60742Z"
        fill="currentColor"
      />
    </svg>
  )
}

function StateExample({
  title,
  state,
  value,
  error,
  disabled,
  clearable,
}: {
  title: string
  state: InputState
  value?: string
  error?: string
  disabled?: boolean
  clearable?: boolean
}) {
  return (
    <div style={groupStyle}>
      <p style={labelStyle}>{title}</p>
      <Input
        label="Label"
        state={state}
        defaultValue={value}
        error={error}
        disabled={disabled}
        clearable={clearable}
      />
    </div>
  )
}

export const Showcase: Story = {
  render: (_args, { globals }) => {
    const english = globals.locale === "en"
    const message = `https://example.com/${"a".repeat(100)}`
    return (
      <section data-input-showcase style={shellStyle}>
        <div style={groupStyle}>
          <p style={labelStyle}>{english ? "States" : "状态"}</p>
          <div style={rowStyle}>
            <StateExample title="Default" state="default" />
            <StateExample title="Focused" state="focused" />
            <StateExample title="Typing" state="typing" value="Input" clearable />
            <StateExample title="Complete" state="complete" value="Input" />
            <StateExample title="Disabled filled" state="disabled-filled" value="Input" disabled />
            <StateExample title="Disabled empty" state="disabled-empty" disabled />
            <StateExample title="Error" state="error" value="Input" error="Supporting text" />
          </div>
        </div>

        <div style={groupStyle}>
          <p style={labelStyle}>Search with leading icon</p>
          <Input
            aria-label="Search"
            placeholder="Search YAMI"
            leadingIcon={<SearchIcon />}
            fullWidth
          />
        </div>

        <div style={groupStyle}>
          <p style={labelStyle}>{globals.locale === "en" ? "Compact density" : "紧凑规格"}</p>
          <div style={rowStyle}>
            <Input density="compact" label={globals.locale === "en" ? "Promo code" : "折扣码"} placeholder="SAVE10" />
            <Input density="compact" label={globals.locale === "en" ? "With error" : "错误状态"} defaultValue="BAD" error={globals.locale === "en" ? "Check your promo code." : "请检查折扣码后重试。"} clearable />
          </div>
        </div>

        <div data-input-boundaries style={groupStyle}>
          <p style={labelStyle}>{english ? "Validation edges" : "边界情况"}</p>
          <Input label={english ? "Clearable input" : "可清空输入"} state="typing" defaultValue="SAVE10" clearable />
          <div style={rowStyle}>
            <Input label={english ? "Disabled with error" : "禁用与错误组合"} defaultValue="BAD" disabled error={english ? "Check your promo code." : "请检查折扣码后重试。"} />
            <Input density="compact" label={english ? "Compact disabled with error" : "紧凑规格禁用与错误组合"} defaultValue="BAD" disabled error={english ? "Check your promo code." : "请检查折扣码后重试。"} />
          </div>
          <div style={rowStyle}>
            <Input label={english ? "Long helper text" : "长辅助说明"} helperText={message} />
            <Input density="compact" label={english ? "Long error text" : "长错误提示"} error={message} />
          </div>
        </div>
      </section>
    )
  },
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
    return <section style={shellStyle}>
      <div data-input-controls style={groupStyle}>
        <p style={labelStyle}>{english ? "Try the input" : "试用输入框"}</p>
        <p style={labelStyle}>{english ? "Change properties in the Controls panel below to see how this input responds." : "在下方 Controls 中调整属性，查看这个输入框的变化。"}</p>
        <Input {...args} label={args.label === undefined ? (english ? "Name" : "姓名") : args.label} />
      </div>
    </section>
  },
}

export const Compact: Story = {
  args: { density: "compact", label: undefined, clearable: true, defaultValue: "SAVE10" },
  render: (args, { globals }) => <Input {...args} label={args.label ?? (globals.locale === "en" ? "Promo code" : "折扣码")} helperText={globals.locale === "en" ? "40px on desktop; 48px on mobile." : "桌面端 40px，移动端 48px。"} />,
}
