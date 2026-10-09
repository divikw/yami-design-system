import { useRef, useState } from "react"
import { expect, userEvent, within } from "storybook/test"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "./Button"
import showcaseStyles from "./Button.stories.module.css"

// Heart icon from packages/design-system/assets/icons/action/heart.svg.
// Inlined as a component so the showcase exercises the canonical SVG path
// (currentColor inheritance, 20px viewBox at md size) instead of the ♥
// text glyph — which has uncentered glyph metrics and misrepresents how
// the Button actually ships in production.
function HeartIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.9582 5.07637C17.9068 2.99934 14.5849 2.99953 12.5337 5.07694C12.3928 5.21966 12.2006 5.29999 12 5.29999C11.7994 5.29999 11.6072 5.21966 11.4663 5.07694C10.4395 4.03704 9.0989 3.51999 7.75499 3.51999C6.41028 3.51999 5.06523 4.03757 4.04174 5.07637L4.0409 5.07722C1.98469 7.15755 1.98469 10.5324 4.0409 12.6128L12 20.6656L19.9582 12.6136C19.9583 12.6135 19.9584 12.6135 19.9585 12.6134C20.9844 11.572 21.5 10.2112 21.5 8.84499C21.5 7.47869 20.9843 6.11775 19.9582 5.07637ZM12 3.53645C14.6539 1.3619 18.5588 1.52409 21.0262 4.02304L21.0267 4.02361C22.3407 5.35722 23 7.10129 23 8.84499C23 10.5887 22.3407 12.3328 21.0267 13.6664L12.5334 22.2597C12.3925 22.4023 12.2004 22.4825 12 22.4825C11.7996 22.4825 11.6075 22.4023 11.4666 22.2597L2.97408 13.6672C2.97408 13.6672 2.97408 13.6672 2.97408 13.6672C0.340449 11.0027 0.340301 6.68788 2.97366 4.02318C4.29012 2.68726 6.02489 2.01999 7.75499 2.01999C9.26119 2.01999 10.7661 2.52565 12 3.53645Z"
        fill="currentColor"
      />
    </svg>
  )
}

const meta = {
  title: "YAMI/Components/Actions/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      playground: "Playground",
      interactionStory: "yami-components-actions-button--interaction",
      showStories: false,
      description: {
        component:
          "按钮用于触发操作。按操作优先级选择层级，按布局选择形态；反色按钮用于相反明暗的背景。下方为规格对照，业务页面只保留一个红色强调操作。",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["emphasis", "primary", "secondary", "tertiary"],
    },
    form: {
      control: "select",
      options: ["full", "inline", "icon"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    inverse: { control: "boolean" },
    loading: { control: "boolean" },
    loadingDelay: { control: { type: "number", min: 0, step: 50 } },
    disabled: { control: "boolean" },
    children: { control: "text" },
    leftIcon: { control: false },
    rightIcon: { control: false },
    iconOnly: { table: { disable: true } },
    fullWidth: { table: { disable: true } },
  },
  args: {
    children: "Action",
    variant: "primary",
    form: "inline",
    size: "md",
    inverse: false,
    loading: false,
    disabled: false,
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

const VARIANTS = ["emphasis", "primary", "secondary", "tertiary"] as const
const SIZES = ["sm", "md", "lg"] as const

const rowLabelStyle: React.CSSProperties = {
  fontSize: "var(--font-size-caption-sm)",
  color: "var(--text-secondary)",
  marginBottom: "var(--space-100)",
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return <div className={showcaseStyles.sectionHead}><h2>{title}</h2><p>{description}</p></div>
}

function StateMatrix({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className={`${showcaseStyles.statePanel} ${inverse ? showcaseStyles.inverse : ""}`}>
      <h3>{inverse ? "反色背景" : "默认背景"}</h3>
      <div className={showcaseStyles.scroll} role="region" aria-label={inverse ? "反色状态对照" : "默认状态对照"} tabIndex={0}>
        <table className={showcaseStyles.stateTable}>
          <thead><tr><th scope="col">层级</th><th scope="col">默认</th><th scope="col">加载中</th><th scope="col">禁用</th></tr></thead>
          <tbody>{VARIANTS.map((variant, index) => (
            <tr key={variant}>
              <th scope="row">{["强调", "主要", "次要", "低强调"][index]}</th>
              {(["default", "loading", "disabled"] as const).map((state) => (
                <td key={state}><Button variant={variant} inverse={inverse} loading={state === "loading"} disabled={state === "disabled"}>继续</Button></td>
              ))}
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}

function SaveDemo({ duration = 700, label = "保存设置" }: { duration?: number; label?: string }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle")
  const saving = useRef(false)
  return (
    <div className={showcaseStyles.saveDemo}>
      <Button loading={status === "saving"} loadingDelay={150} onClick={async () => {
        if (saving.current) return
        saving.current = true
        setStatus("saving")
        await new Promise((resolve) => setTimeout(resolve, duration))
        setStatus("saved")
        saving.current = false
      }}>{label}</Button>
      <p role="status">{status === "saving" ? "正在保存…" : status === "saved" ? "设置已保存" : "等待操作"}</p>
    </div>
  )
}

// ───────────────────────────── Stories ─────────────────────────────

/**
 * Showcase — the canonical matrix shown in the docs and required by the
 * YAMI Components story rule (`requiredExports: ["Showcase"]`).
 *
 * Renders, in order: Hierarchy × Form (default surface), Size, States,
 * Inverse surface. Matches the visual structure of the Figma reference
 * pages (Mobile v2 / PC v2).
 */
export const Showcase: Story = {
  parameters: { layout: "padded", controls: { disable: true } },
  render: (_args, context) => {
    const sizePreview = new URLSearchParams(window.location.search).get("buttonSize")
    if (sizePreview) {
      const row = new URLSearchParams(window.location.search).get("buttonRow")
      const size = SIZES.find((value) => value === row) || "md"
      return <SizePreview desktop={sizePreview === "desktop"} size={size} />
    }
    return (
      <div className={showcaseStyles.page}>
        <header className={showcaseStyles.header}>
          <h1>Button 按钮</h1>
          <p>层级、尺寸、形态与交互。</p>
        </header>

        <section className={showcaseStyles.section}>
          <SectionHeading title="操作层级" description="按操作优先级选择，同一页面只保留一个红色强调操作。" />
          <div className={`${showcaseStyles.contentCard} ${showcaseStyles.centeredCard}`}><div className={showcaseStyles.hierarchy}>
            {VARIANTS.map((variant, index) => (
              <div key={variant} className={showcaseStyles.item}>
                <Button variant={variant}>{["Emphasis", "Primary", "Secondary", "Tertiary"][index]}</Button>
                <p>{["强调", "主要", "次要", "低强调"][index]}</p>
              </div>
            ))}
          </div></div>
        </section>

        <section className={showcaseStyles.section}>
          <SectionHeading title="尺寸规格" description="仅大号文字按钮随设备调整，单位为 px。" />
          <div className={showcaseStyles.contentCard}>
          <div role="region" aria-label="文字按钮尺寸对照，可横向滚动" tabIndex={0} className={showcaseStyles.scroll}>
            <table className={showcaseStyles.table}>
              <thead><tr>
                <th scope="col">尺寸</th>
                <th scope="col">移动端 / 平板<div className={showcaseStyles.muted}>视口 &lt;1024px</div></th>
                <th scope="col">桌面端<div className={showcaseStyles.muted}>视口 ≥1024px</div></th>
              </tr></thead>
              <tbody>{SIZES.map((size, index) => (
                <tr key={size}>
                  <th scope="row">{["小号", "中号", "大号"][index]} {size.toUpperCase()}</th>
                  {(["mobile", "desktop"] as const).map((device) => (
                    <td key={device}><div className={showcaseStyles.frameClip}>
                      <iframe
                        title={`${device === "mobile" ? "移动端" : "桌面端"} ${size.toUpperCase()} 尺寸`}
                        src={`iframe.html?id=yami-components-actions-button--showcase&viewMode=story&buttonSize=${device}&buttonRow=${size}&globals=${encodeURIComponent(`theme:${context.globals.theme || "light"};locale:${context.globals.locale || "zh"}`)}`}
                        width={device === "mobile" ? 375 : 1280}
                        height={128}
                      />
                    </div></td>
                  ))}
                </tr>
              ))}</tbody>
            </table>
          </div>
          </div>
          <div className={`${showcaseStyles.contentCard} ${showcaseStyles.iconStrip}`}>
            <h3>图标按钮 · 两端通用</h3>
            <div style={sizeGridStyle}>
              {SIZES.map((size) => {
                const dimension = size === "sm" ? 32 : size === "md" ? 40 : 48
                return <div key={size}>
                  <div style={sizeSlotStyle}><Button size={size} form="icon" aria-label="收藏"><HeartIcon size={size === "sm" ? 16 : size === "md" ? 20 : 24} /></Button></div>
                  <p style={sizeCaptionStyle}>{size.toUpperCase()} · {dimension}×{dimension}</p>
                </div>
              })}
            </div>
          </div>
        </section>

        <section className={showcaseStyles.section}>
          <SectionHeading title="布局形态" description="根据可用空间选择，以下统一使用主要按钮。" />
          <div className={showcaseStyles.contentCard}>
          <div className={showcaseStyles.formRow}>
            <div><h3>内容宽度 <span className={showcaseStyles.api}>inline</span></h3></div>
            <div className={showcaseStyles.formSample}><Button form="inline">继续</Button></div>
          </div>
          <div className={showcaseStyles.formRow}>
            <div><h3>纯图标 <span className={showcaseStyles.api}>icon</span></h3></div>
            <div className={showcaseStyles.formSample}><Button form="icon" aria-label="收藏"><HeartIcon /></Button></div>
          </div>
          <div className={showcaseStyles.formRow}>
            <div><h3>填满容器 <span className={showcaseStyles.api}>full</span></h3><p>操作区最大 480px</p></div>
            <div className={showcaseStyles.fullSample}><Button form="full">继续</Button></div>
          </div>
          <div className={showcaseStyles.formRow}>
            <div><h3>长文案</h3><p>200px 容器 · 超出省略</p></div>
            <div className={showcaseStyles.formSample}>
              <div className={showcaseStyles.constrainedSample}>
                <Button leftIcon={<HeartIcon />} title="收藏商品并在补货时通知我">收藏商品并在补货时通知我</Button>
              </div>
            </div>
          </div></div>
        </section>

        <section className={showcaseStyles.section}>
          <SectionHeading title="图标搭配" description="同一尺寸的前置、后置图标大小一致。" />
          <div className={showcaseStyles.contentCard}>
            {SIZES.map((size) => {
              const iconSize = size === "sm" ? 12 : size === "md" ? 16 : 20
              return (
                <div key={size} className={showcaseStyles.formRow}>
                  <div><h3>{size.toUpperCase()}</h3><p>图标 {iconSize}×{iconSize}px</p></div>
                  <div className={showcaseStyles.iconExamples}>
                    <div><Button variant="secondary" size={size} leftIcon={<HeartIcon size={iconSize} />}>收藏商品</Button><p>前置图标</p></div>
                    <div><Button variant="secondary" size={size} rightIcon={<HeartIcon size={iconSize} />}>收藏商品</Button><p>后置图标</p></div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className={showcaseStyles.section}>
          <SectionHeading title="状态与背景" description="对照默认、加载与禁用状态，以及不同背景下的表现。" />
          <div className={showcaseStyles.surfaces}><StateMatrix /><StateMatrix inverse /></div>
        </section>

        <section className={showcaseStyles.section}>
          <SectionHeading title="交互体验" description="点击保存，或使用 Tab 与 Enter / 空格体验。" />
          <div className={`${showcaseStyles.contentCard} ${showcaseStyles.centeredCard}`}><SaveDemo /></div>
        </section>
      </div>
    )
  },
}

/** Interactive playground — drive every prop via the Controls panel. */
export const Playground: Story = {
  render: (args) => (
    <div style={{ boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", width: "min(480px, calc(100vw - 64px))", maxWidth: "100%", padding: "var(--space-300)", background: args.inverse ? "var(--surface-inverse)" : "var(--surface-primary)" }}>
      <Button {...args} aria-label={args.form === "icon" ? "收藏商品" : undefined}>
        {args.form === "icon" ? <HeartIcon /> : args.children}
      </Button>
    </div>
  ),
}

/** 点击、键盘激活和加载反馈。 */
export const Interaction: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className={showcaseStyles.interactionExamples}>
      <div><p>常规保存 · 展示加载与完成反馈</p><SaveDemo /></div>
      <div><p>快速保存 · 完成时不闪现加载图标</p><SaveDemo duration={80} label="快速保存" /></div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Keep manual previews idle; exercise keyboard activation only in Vitest.
    if (import.meta.env.MODE !== "test") return
    const canvas = within(canvasElement)
    const button = canvas.getByRole("button", { name: "保存设置" })
    button.focus()
    await userEvent.keyboard("{Enter}")
    await expect(button).toHaveAttribute("aria-busy", "true")
    await expect(button).toHaveAttribute("aria-disabled", "true")
    await canvas.findByText("设置已保存")
    await expect(button).not.toHaveAttribute("aria-busy")
    await expect(button).toHaveFocus()
  },
}

const sizeGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "var(--space-100)",
  width: "100%",
  maxWidth: 304,
  marginInline: "auto",
  textAlign: "center",
}

const sizeSlotStyle: React.CSSProperties = {
  height: 56,
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
}

const sizeCaptionStyle: React.CSSProperties = {
  ...rowLabelStyle,
  marginTop: "var(--space-150)",
  marginBottom: 0,
}

function SizePreview({ desktop, size }: { desktop: boolean; size: typeof SIZES[number] }) {
  return (
    <div className={showcaseStyles.sizePreview}>
      <div style={sizeSlotStyle}><Button size={size}>继续</Button></div>
      <p style={{ ...sizeCaptionStyle, whiteSpace: "nowrap" }}>
        高 {size === "sm" ? 32 : size === "md" ? 40 : desktop ? 56 : 48} · 字号 {size === "lg" ? desktop ? 18 : 16 : 14}
      </p>
    </div>
  )
}
