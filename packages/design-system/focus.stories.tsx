import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button, FilterChip, Input, Tabs, TabsContent, TabsList, TabsTrigger } from "./components"

const meta = {
  title: "YAMI/Foundations/Focus",
  parameters: { layout: "padded" },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const KeyboardFocus: Story = {
  render: (_args, { globals }) => {
    const en = globals.locale === "en"
    return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", maxWidth: 900, gap: "var(--space-400)", fontFamily: "var(--font-family-ios)", color: "var(--text-primary)" }}>
      <div style={{ gridColumn: "1 / -1" }}>
        <h1>{en ? "Keyboard focus" : "键盘焦点"}</h1>
        <p>{en ? "Press Tab to inspect the blue focus ring. Switch Light / Dark in the toolbar. Borders and selected states keep their original colors." : "按 Tab 检查蓝色焦点框，通过工具栏切换浅色 / 深色主题。组件边框和选中状态保持原色。"}</p>
      </div>
      {[false, true].map((inverse) => <section key={String(inverse)} style={{ display: "grid", justifyItems: "start", gap: "var(--space-300)", padding: "var(--space-400)", background: inverse ? "var(--surface-inverse)" : "var(--surface-primary)", color: inverse ? "var(--text-primary-inverse)" : "var(--text-primary)", borderRadius: "var(--radius-surface-default)" }}>
        <h2 style={{ margin: 0 }}>{inverse ? (en ? "Inverse background" : "反色背景") : (en ? "Default background" : "默认背景")}</h2>
        <code>{inverse ? "--focus-ring-inverse" : "--focus-ring"}</code>
        <Button inverse={inverse}>{en ? "Continue" : "继续"}</Button>
        <Tabs defaultValue="one">
          <TabsList inverse={inverse} variant="primary" styleVariant="b" aria-label={inverse ? "Inverse tabs" : "Default tabs"}>
            <TabsTrigger value="one">Tab 1</TabsTrigger><TabsTrigger value="two">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="one" style={{ color: inverse ? "var(--text-secondary-inverse)" : "var(--text-secondary)" }}>{en ? "Tab 1 content" : "标签页 1 内容"}</TabsContent>
          <TabsContent value="two" style={{ color: inverse ? "var(--text-secondary-inverse)" : "var(--text-secondary)" }}>{en ? "Tab 2 content" : "标签页 2 内容"}</TabsContent>
        </Tabs>
        {!inverse && <><FilterChip selected>{en ? "Selected filter" : "已选筛选项"}</FilterChip><Input label={en ? "Email" : "邮箱"} defaultValue="hello@yami.com" /></>}
      </section>)}
    </div>
  },
}
