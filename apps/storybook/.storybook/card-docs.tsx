import { useState } from "react";
import { ButtonGroup, ButtonLink, Card } from "@yami/design-system";
import maskImage from "../../../packages/design-system/components/BrandProductRail/assets/biodance-banner.webp";
import type { DocsLocale } from "./component-docs-template";
import { CardSpacingExample } from "./card-spacing-example";
import spacingSource from "./card-spacing-example.tsx?raw";
import { ComponentGuide, type GuideExample } from "./component-guide";
import styles from "./component-guide.module.css";

const imports = 'import { Card } from "@yami/design-system";';
const legacyAnchors = {
  usage: ["card--使用说明", "card--usage", "使用场景", "when-to-use", "不适用场景", "when-not-to-use"],
  composition: ["常见组合", "common-patterns"],
  basic: ["component-playground", "component-specifications", "默认行为规则card-no-border", "default-behavior-rule-card-no-border", "内边距选择", "choosing-padding"],
  image: ["商品卡片容器", "product-card-container", "圆角归属", "radius-ownership"],
  inverse: ["反色表面与当前主题相反的明暗极性", "inverse-surface--opposite-polarity-within-either-theme"],
  link: ["使用-as-指定元素", "polymorphic-as", "链接卡片整张卡片可点击", "link-card--full-card-clickable"],
  action: ["交互行为", "interaction"],
  actions: ["静态卡片内的多个操作", "multiple-actions-inside-a-static-card"],
  api: ["禁用操作", "disabled-actions", "列表条目卡片密集网格带边框", "list-item-card-dense-grid-bordered", "窄屏与内容溢出", "narrow-layouts-and-overflow", "避免的用法", "anti-patterns", "-自定义圆角", "-custom-radius", "-普通商品网格默认带边框", "-default-border-on-product-cards", "-卡片阴影或悬浮阴影", "-card-shadow--interactive-hover-shadow", "-用多层-card-搭建整页布局", "-stacking-cards-as-full-page-layout", "相关内容", "related"],
};

function ReminderCard({ label, on, off }: { label: string; on: string; off: string }) {
  const [enabled, setEnabled] = useState(false);
  return <Card as="button" surface="secondary" aria-label={label} aria-pressed={enabled} onClick={() => setEnabled(!enabled)}>
    {label} · {enabled ? on : off}
  </Card>;
}

export function CardDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const order = zh ? "配送进度" : "Delivery update";
  const delivery = zh ? "包裹已发出，预计周二送达。" : "Your parcel has shipped and should arrive on Tuesday.";
  const imageTitle = zh ? "Biodance 面膜指南" : "A guide to Biodance masks";
  const notice = zh ? "会员抢先购将于周五开放。" : "Members get early access on Friday.";
  const reminder = zh ? "配送提醒" : "Delivery reminders";
  const on = zh ? "已开启" : "On";
  const off = zh ? "已关闭" : "Off";
  const beauty = zh ? "美妆护肤" : "Beauty";
  const masks = zh ? "面膜" : "Sheet masks";
  const beautyUrl = `https://www.yami.com/us/${locale}/c/beauty/2`;
  const masksUrl = `https://www.yami.com/us/${locale}/c/masks/59`;
  const categories = zh ? "浏览商品分类" : "Browse categories";
  const spacingLabel = zh ? "卡片间距" : "Card spacing";
  const guideTitle = zh ? "面膜选购指南" : "Sheet mask guide";
  const guideDescription = zh ? "按肤感挑选面膜。" : "Choose a mask by texture.";
  const guideBody = zh ? "想要清爽肤感，可以从轻薄的补水面膜开始。" : "For a lighter feel, start with a lightweight hydrating mask.";
  const browseMasks = zh ? "查看面膜" : "See masks";
  const browseBeauty = zh ? "浏览美妆护肤" : "Explore beauty";
  const examples: GuideExample[] = [
    {
      id: "basic", title: zh ? "基础卡片" : "Basic card",
      description: zh ? "用 article 包住一条独立信息，通过标题和正文组织内容。PC 和 Mobile 默认均留 16px 内边距，标题与说明之间留 4px。" : "Use an article for a self-contained item with a heading and body. The default inset is 16px on both PC and Mobile. The title and description are 4px apart.",
      code: `${imports}\n\n<Card as="article" surface="secondary">\n  <h3>${order}</h3>\n  <p style={{ margin: 0 }}>${delivery}</p>\n</Card>`,
      preview: <Card as="article" surface="secondary"><h3>{order}</h3><p style={{ margin: 0 }}>{delivery}</p></Card>,
    },
    {
      id: "spacing", title: zh ? "间距" : "Spacing",
      description: zh ? '移动首页的「热销榜单」和「美护调理 流行趋势」模块卡片四周留 8px。基础 Card 要使用相同的内边距，可传 padding="sm"。切换下方数值，比较 --card-spacing 对内边距和分区间距的影响。' : 'The bestseller and beauty trend modules on the mobile homepage have an 8px inset on all sides. Use padding="sm" for the same inset on a base Card. Try the values below to compare how --card-spacing affects the inset and section gap.',
      code: `import { ButtonLink } from "@yami/design-system";
${spacingSource.trim()}

<CardSpacingExample label="${spacingLabel}">
  <header style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", alignItems: "center", gap: "var(--space-050) var(--space-100)" }}>
    <h3 style={{ margin: 0 }}>${guideTitle}</h3>
    <a href="${masksUrl}" style={{ display: "inline-flex", alignItems: "center", minHeight: "var(--space-400)", textDecoration: "underline" }}>${browseMasks}</a>
    <p style={{ margin: 0, gridColumn: "1 / -1" }}>${guideDescription}</p>
  </header>
  <div>${guideBody}</div>
  <footer><ButtonLink size="sm" href="${beautyUrl}">${browseBeauty}</ButtonLink></footer>
</CardSpacingExample>`,
      preview: <CardSpacingExample label={spacingLabel}>
        <header style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", alignItems: "center", gap: "var(--space-050) var(--space-100)" }}>
          <h3 style={{ margin: 0 }}>{guideTitle}</h3>
          <a href={masksUrl} style={{ display: "inline-flex", alignItems: "center", minHeight: "var(--space-400)", textDecoration: "underline" }}>{browseMasks}</a>
          <p style={{ margin: 0, gridColumn: "1 / -1" }}>{guideDescription}</p>
        </header>
        <div>{guideBody}</div>
        <footer><ButtonLink size="sm" href={beautyUrl}>{browseBeauty}</ButtonLink></footer>
      </CardSpacingExample>,
    },
    {
      id: "image", title: zh ? "贴边图片" : "Edge-to-edge image",
      description: zh ? "传入图片地址，用 padding=\"none\" 让图片贴边。只给图片顶部设置圆角，文字区域单独留白。" : 'Pass an image URL and use padding="none" to bring the image to the edges. Round the top of the image and pad the caption separately.',
      code: `${imports}

export function MaskGuideCard({ src }: { src: string }) {
  return (
    <Card as="article" padding="none" surface="secondary">
      <img src={src} alt="" style={{ display: "block", width: "100%", height: "auto", borderRadius: "var(--radius-surface-default) var(--radius-surface-default) 0 0" }} />
      <h3 style={{ margin: 0, padding: "var(--space-200)" }}>${imageTitle}</h3>
    </Card>
  );
}`,
      preview: <Card as="article" padding="none" surface="secondary">
        <img src={maskImage} alt="" style={{ display: "block", width: "100%", height: "auto", borderRadius: "var(--radius-surface-default) var(--radius-surface-default) 0 0" }} />
        <h3 style={{ margin: 0, padding: "var(--space-200)" }}>{imageTitle}</h3>
      </Card>,
    },
    {
      id: "inverse", title: zh ? "反色卡片" : "Inverse card",
      description: zh ? "surface=\"inverse\" 同时设置卡片底色和继承的文字颜色。切换明暗主题可查看两者如何一起变化。" : 'Use surface="inverse" to set the card background and inherited text color together. Switch themes to see both change.',
      code: `${imports}\n\n<Card surface="inverse">${notice}</Card>`,
      preview: <Card surface="inverse">{notice}</Card>,
    },
    {
      id: "link", title: zh ? "整张卡片作为链接" : "Link card",
      description: zh ? "整张卡片指向同一页面时，使用 as=\"a\" 并提供 href。用 Tab 聚焦，按 Enter 打开分类页。" : 'For a card with a single destination, use as="a" with an href. Tab to the card and press Enter to visit the category.',
      code: `${imports}\n\n<Card as="a" href="${beautyUrl}" surface="secondary">${beauty}</Card>`,
      preview: <Card as="a" href={beautyUrl} surface="secondary">{beauty}</Card>,
    },
    {
      id: "action", title: zh ? "整张卡片作为按钮" : "Button card",
      description: zh ? "用原生按钮卡片切换配送提醒。按空格或 Enter 可切换状态，aria-pressed 将状态传给读屏软件。" : "Use a button card to toggle delivery reminders. Space or Enter toggles the setting. Screen readers get the current state from aria-pressed.",
      code: `import { useState } from "react";
${imports}

export function ReminderCard() {
  const [enabled, setEnabled] = useState(false);
  return (
    <Card as="button" surface="secondary" aria-label="${reminder}" aria-pressed={enabled} onClick={() => setEnabled(!enabled)}>
      ${reminder} · {enabled ? "${on}" : "${off}"}
    </Card>
  );
}`,
      preview: <div className={styles.row}><ReminderCard label={reminder} on={on} off={off} /></div>,
    },
    {
      id: "actions", title: zh ? "卡片内的多个入口" : "Multiple links in a card",
      description: zh ? "卡片内有多个目的地时，让外层 article 保持静态。用 ButtonGroup 排列链接，每个链接都可以单独聚焦。" : "Keep the article static when it contains multiple destinations. Group the links with ButtonGroup so each can receive focus independently.",
      code: `import { ButtonGroup, ButtonLink, Card } from "@yami/design-system";

<Card as="article" surface="secondary">
  <h3 style={{ margin: 0 }}>${categories}</h3>
  <footer>
    <ButtonGroup aria-label="${categories}">
      <ButtonLink size="sm" href="${beautyUrl}">${beauty}</ButtonLink>
      <ButtonLink size="sm" href="${masksUrl}" variant="secondary">${masks}</ButtonLink>
    </ButtonGroup>
  </footer>
</Card>`,
      preview: <Card as="article" surface="secondary">
        <h3 style={{ margin: 0 }}>{categories}</h3>
        <footer>
          <ButtonGroup aria-label={categories}>
            <ButtonLink size="sm" href={beautyUrl}>{beauty}</ButtonLink>
            <ButtonLink size="sm" href={masksUrl} variant="secondary">{masks}</ButtonLink>
          </ButtonGroup>
        </footer>
      </Card>,
    },
  ];

  return <ComponentGuide name="Card" slug="card" locale={locale}
    intro={zh ? "用 Card 承载订单、配送进度等独立内容。通过 children 放入标题、正文和操作，外层元素决定整张卡片的交互方式。" : "Use Card for a self-contained item such as an order or delivery update. Pass a heading, body and actions as children. The root element determines how the card behaves."}
    previous={{ name: "ButtonGroup", path: "yami-components-actions-button-group" }}
    next={{ name: "Checkbox", path: "yami-components-forms-checkbox" }}
    usageCode={`${imports}\n\n<Card>${delivery}</Card>`}
    composition={`Card\n└── children\n    ├── ${zh ? "标题，例如 h3" : "Heading, e.g. h3"}\n    ├── ${zh ? "正文或图片" : "Body text or image"}\n    └── ${zh ? "可选操作区，例如 ButtonGroup" : "Optional actions, e.g. ButtonGroup"}`}
    examples={examples} legacyAnchors={legacyAnchors}
    apiNote={zh ? "默认卡片使用主表面和 12px 圆角，无边框、无阴影。长文本会换行。页面分区用标题和间距组织，商品列表可使用 ProductCard。" : "The default card uses the primary surface and a 12px radius, with no border or shadow. Long text wraps. Use headings and spacing for page sections and ProductCard for product listings."}
    api={[
      ["as", zh ? "默认 div。可传 article、a、button 等元素类型，支持对应的原生属性及 ref。" : "Defaults to div. Accepts an element type such as article, a or button, its native attributes, and a ref."],
      ["children", zh ? "ReactNode。按内容需要组合标题、图片、正文或操作。" : "ReactNode. Compose a heading, image, body or actions as needed."],
      ["padding", zh ? "各设备均为 sm 8px、md（默认）16px、lg 24px、none 0。" : "sm 8px, md (default) 16px, lg 24px or none 0 on every device."],
      ["--card-spacing", zh ? "在卡片根元素上设置 CSS 长度，同时调整内边距、header 之后和 footer 之前的间距。" : "Set a CSS length on the card root for the inset and spacing after a direct header or before a direct footer."],
      ["surface", zh ? "primary（默认）、secondary 或 inverse。inverse 同时设置反色文字。" : "primary (default), secondary or inverse. The inverse surface also sets the text color."],
      ["bordered", zh ? "默认 false。需要区分密集网格中的相邻卡片时可开启细边框。" : "Defaults to false. Enable the thin border to separate adjacent cards in a dense grid."],
      ["interactive", zh ? "按钮和带 href 的链接自动获得悬停、按下反馈及至少 32 × 32px 的目标区域。使用自定义元素时需自行提供语义和键盘行为。" : "Buttons and links with an href get hover and press feedback and a minimum 32 × 32px target automatically. Supply semantics and keyboard handling for custom elements."],
      ["href / type / disabled", zh ? "链接通过 href 指定目标。原生按钮的 type 默认 button，传 disabled 禁用操作。" : "Set href on a link. Native buttons default to type=\"button\" and accept disabled."],
    ]}
    reference={{ label: "shadcn/ui Card", href: "https://ui.shadcn.com/docs/components/base/card" }} />;
}
