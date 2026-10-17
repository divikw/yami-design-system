import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"

import tokenDocument from "./generated/tokens.json"
import { tokenStoryStyles } from "./token-story"
import styles from "./elevation.stories.module.css"

const sourceUrl = "https://www.figma.com/design/6oOAy72DBff4P6NzJYc2hi/YAMI-UI-UX-Guidelines?node-id=2651-5692"
const levels = tokenDocument.tokens.filter((token) => token.group === "elevation")
const englishUses = [
  "Base content surfaces; separation without a floating appearance.",
  "Lightly raised cards and independent surfaces.",
  "Immediate feedback and lightweight floating information.",
  "Menus, dropdowns and action panels above page content.",
  "Modal windows; use with an overlay.",
]

const meta = {
  title: "YAMI/Foundations/elevation",
  tags: ["!autodocs"],
  parameters: { layout: "fullscreen", controls: { disable: true } },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: (_args, { globals }) => {
    const en = globals.locale === "en"
    return <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Design Tokens / Elevation</p>
        <h1>{en ? "Shadow levels" : "阴影层级"}</h1>
        <p className={styles.description}>{en ? "Five levels of static depth. Every preview uses the generated CSS token." : "五档静态层级，所有预览均使用真实 CSS token。"}</p>
        <div className={styles.source}>
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer">{en ? "Figma specification" : "Figma 原始规范"}</a>
          <span>Draft</span><time dateTime="2026-10-16">2026-10-16</time>
        </div>
      </header>
      <section className={styles.levels} aria-label={en ? "Elevation comparison" : "阴影层级对比"}>
        {levels.map((level, index) => <article key={level.id} style={tokenStoryStyles.card}>
          <div className={styles.preview}>
            <div data-elevation-token={level.cssVar} className={styles.sample} style={{ boxShadow: `var(${level.cssVar})` }}>E{level.id.match(/\d+/)?.[0]}</div>
          </div>
          <div style={tokenStoryStyles.cardBody}>
            <strong style={tokenStoryStyles.tokenName}>{level.name}</strong>
            <span style={tokenStoryStyles.caption}>value: {level.values.find((value) => value.contextId === "root")?.cssValue}</span>
            <span style={tokenStoryStyles.caption}>{en ? englishUses[index] : level.description}</span>
          </div>
        </article>)}
      </section>
      <footer className={styles.notes}>
        <p>{en ? "Use color changes for hover and press feedback; keep shadow levels stable." : "阴影表达静态层级；悬停与按压使用颜色反馈。"}</p>
        <p>{en ? "The Figma source defines no separate dark-mode shadows. Existing component defaults are unchanged." : "Figma 暂无独立的深色阴影；现有组件默认样式保持不变。"}</p>
      </footer>
    </main>
  },
  play: async ({ canvasElement }) => {
    const samples = canvasElement.querySelectorAll<HTMLElement>("[data-elevation-token]")
    const shadows = [
      "rgba(0, 0, 0, 0.04) 0px 1px 2px -1px",
      "rgba(0, 0, 0, 0.08) 0px 2px 4px -2px",
      "rgba(0, 0, 0, 0.12) 0px 4px 8px -4px",
      "rgba(0, 0, 0, 0.16) 0px 4px 12px -6px",
      "rgba(0, 0, 0, 0.24) 0px 8px 16px -8px",
    ]
    await expect(samples).toHaveLength(5)
    for (const [index, sample] of Array.from(samples).entries()) await expect(getComputedStyle(sample).boxShadow).toBe(shadows[index])
  },
}
