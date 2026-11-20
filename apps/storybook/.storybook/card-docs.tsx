import { useState } from "react";
import { ButtonGroup, ButtonLink, Card } from "@yami/design-system";
import maskImage from "../../../packages/design-system/components/BrandProductRail/assets/biodance-banner.webp";
import type { DocsLocale } from "./component-docs-template";
import { LoginCard } from "./card-login-example";
import loginSource from "./card-login-example.tsx?raw";
import { ReportCard } from "./card-report-example";
import reportSource from "./card-report-example.tsx?raw";
import { AgreementCard } from "./card-agreement-example";
import agreementSource from "./card-agreement-example.tsx?raw";
import { BeautyGuideCard } from "./card-image-example";
import imageSource from "./card-image-example.tsx?raw";
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
  return <Card as="button" bordered aria-label={label} aria-pressed={enabled} onClick={() => setEnabled(!enabled)}>
    {label} · {enabled ? on : off}
  </Card>;
}

export function CardDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const order = zh ? "配送进度" : "Delivery update";
  const delivery = zh ? "包裹已发出，预计周二送达。" : "Your parcel has shipped and should arrive on Tuesday.";
  const notice = zh ? "会员抢先购将于周五开放。" : "Members get early access on Friday.";
  const reminder = zh ? "配送提醒" : "Delivery reminders";
  const on = zh ? "已开启" : "On";
  const off = zh ? "已关闭" : "Off";
  const beauty = zh ? "美妆护肤" : "Beauty";
  const masks = zh ? "面膜" : "Sheet masks";
  const beautyUrl = `https://www.yami.com/us/${locale}/c/beauty/2`;
  const masksUrl = `https://www.yami.com/us/${locale}/c/masks/59`;
  const categories = zh ? "浏览商品分类" : "Browse categories";
  const examples: GuideExample[] = [
    {
      id: "basic", title: zh ? "基础卡片" : "Basic card",
      description: zh ? "用 article 包住一条独立信息，通过标题和正文组织内容。PC 和 Mobile 默认均留 16px 内边距，标题与说明之间留 4px。" : "Use an article for a self-contained item with a heading and body. The default inset is 16px on both PC and Mobile. The title and description are 4px apart.",
      code: `${imports}\n\n<Card as="article" bordered style={{ width: "100%" }}>\n  <h3>${order}</h3>\n  <p style={{ margin: 0 }}>${delivery}</p>\n</Card>`,
      preview: <Card as="article" bordered style={{ width: "100%" }}><h3>{order}</h3><p style={{ margin: 0 }}>{delivery}</p></Card>,
    },
    {
      id: "size", title: zh ? "尺寸" : "Size",
      description: zh ? '定期报告卡片使用 size="sm"，将内边距和分区间距从 16px 缩至 8px。' : 'This report card uses size="sm" to reduce its inset and section spacing from 16px to 8px.',
      code: reportSource.trim() + `\n\n<ReportCard locale="${locale}" />`,
      preview: <ReportCard locale={locale} />,
    },
    {
      id: "spacing", title: zh ? "间距" : "Spacing",
      description: zh ? "切换登录表单上方的数值，比较 --card-spacing 如何同时调整卡片内边距与分区间距。" : "Choose a spacing value above the sign-in form to see how --card-spacing changes both the inset and the space between sections.",
      code: loginSource.trim() + `\n\n<LoginCard locale="${locale}" adjustableSpacing />`,
      preview: <LoginCard locale={locale} adjustableSpacing />,
    },
    {
      id: "edge-to-edge", title: zh ? "贴边滚动正文" : "Edge-to-edge content",
      description: zh ? "正文使用与卡片内边距等值的负边距，让背景延伸到两侧。单独滚动正文时，标题和底部操作始终可见。" : "A negative inline margin lets the reading area's background reach both edges. Scroll the text while keeping the heading and actions in view.",
      code: agreementSource.trim() + `\n\n<AgreementCard locale="${locale}" />`,
      preview: <AgreementCard locale={locale} />,
    },
    {
      id: "image", title: zh ? "贴边图片" : "Image",
      description: zh ? "把封面图放在标题区上方，使用 src 传入图片地址。标题区展示徽标和说明，底部按钮铺满可用宽度。" : "Pass a cover image URL in src. Place the cover above the heading, badge and description, then add a full-width action in the footer.",
      code: imageSource.trim() + `\n\n<BeautyGuideCard locale="${locale}" src="/images/mask-guide.webp" />`,
      preview: <BeautyGuideCard locale={locale} src={maskImage} />,
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
      code: `${imports}\n\n<Card as="a" href="${beautyUrl}" bordered>${beauty}</Card>`,
      preview: <Card as="a" href={beautyUrl} bordered>{beauty}</Card>,
    },
    {
      id: "action", title: zh ? "整张卡片作为按钮" : "Button card",
      description: zh ? "用原生按钮卡片切换配送提醒。按空格或 Enter 可切换状态，aria-pressed 将状态传给读屏软件。" : "Use a button card to toggle delivery reminders. Space or Enter toggles the setting. Screen readers get the current state from aria-pressed.",
      code: `import { useState } from "react";
${imports}

export function ReminderCard() {
  const [enabled, setEnabled] = useState(false);
  return (
    <Card as="button" bordered aria-label="${reminder}" aria-pressed={enabled} onClick={() => setEnabled(!enabled)}>
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

<Card as="article" bordered style={{ width: "100%" }}>
  <h3 style={{ margin: 0 }}>${categories}</h3>
  <footer>
    <ButtonGroup aria-label="${categories}">
      <ButtonLink size="sm" href="${beautyUrl}">${beauty}</ButtonLink>
      <ButtonLink size="sm" href="${masksUrl}" variant="secondary">${masks}</ButtonLink>
    </ButtonGroup>
  </footer>
</Card>`,
      preview: <Card as="article" bordered style={{ width: "100%" }}>
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
    leadExample={{ preview: <LoginCard locale={locale} />,
      code: loginSource.trim() + `\n\n<LoginCard locale="${locale}" />` }}
    usageCode={`import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@yami/design-system";

<Card>
  <CardHeader>
    <CardTitle>${order}</CardTitle>
    <CardDescription>${delivery}</CardDescription>
  </CardHeader>
  <CardContent>${zh ? "订单详情" : "Order details"}</CardContent>
</Card>`}
    composition={"Card\n├── CardHeader\n│   ├── CardTitle\n│   ├── CardDescription\n│   └── CardAction\n├── CardContent\n└── CardFooter"}
    examples={examples} legacyAnchors={legacyAnchors}
    apiNote={zh ? "示例通过 bordered 显示细描边。Card 默认使用主表面和 12px 圆角，无边框、无阴影。长文本会换行。页面分区用标题和间距组织，商品列表可使用 ProductCard。" : "These examples opt into a thin border with bordered. The default card uses the primary surface and a 12px radius, with no border or shadow. Long text wraps. Use headings and spacing for page sections and ProductCard for product listings."}
    api={[
      ["CardHeader", zh ? "排列标题、说明和右侧操作。" : "Arranges the title, description, and trailing action."],
      ["CardTitle / CardDescription", zh ? "显示标题和辅助说明。CardTitle 渲染为 h3。" : "Render the heading and supporting text. CardTitle renders an h3."],
      ["CardAction", zh ? "放在 CardHeader 内，靠末端对齐。" : "Place inside CardHeader for a trailing action."],
      ["CardContent", zh ? "容纳正文、图片或表单字段。" : "Contains body text, media, or form fields."],
      ["CardFooter", zh ? "排列底部操作，宽度不足时换行。" : "Groups footer actions and wraps them when needed."],
      ["as", zh ? "默认 div。可传 article、a、button 等元素类型，支持对应的原生属性及 ref。" : "Defaults to div. Accepts an element type such as article, a or button, its native attributes, and a ref."],
      ["children", zh ? "ReactNode。按内容需要组合标题、图片、正文或操作。" : "ReactNode. Compose a heading, image, body or actions as needed."],
      ["padding", zh ? "各设备均为 sm 8px、md（默认）16px、lg 24px、none 0。" : "sm 8px, md (default) 16px, lg 24px or none 0 on every device."],
      ["size", zh ? '默认 div 卡片可用 size="sm" 简写 8px 留白。显式 padding 优先。' : 'For the default div Card, size="sm" is shorthand for 8px padding. Explicit padding takes precedence.'],
      ["--card-spacing", zh ? "在卡片根元素上设置 CSS 长度，同时调整内边距、header 之后和 footer 之前的间距。" : "Set a CSS length on the card root for the inset and spacing after a direct header or before a direct footer."],
      ["surface", zh ? "primary（默认）、secondary 或 inverse。inverse 同时设置反色文字。" : "primary (default), secondary or inverse. The inverse surface also sets the text color."],
      ["bordered", zh ? "默认 false。需要区分密集网格中的相邻卡片时可开启细边框。" : "Defaults to false. Enable the thin border to separate adjacent cards in a dense grid."],
      ["interactive", zh ? "按钮和带 href 的链接自动获得悬停、按下反馈及至少 32 × 32px 的目标区域。使用自定义元素时需自行提供语义和键盘行为。" : "Buttons and links with an href get hover and press feedback and a minimum 32 × 32px target automatically. Supply semantics and keyboard handling for custom elements."],
      ["href / type / disabled", zh ? "链接通过 href 指定目标。原生按钮的 type 默认 button，传 disabled 禁用操作。" : "Set href on a link. Native buttons default to type=\"button\" and accept disabled."],
    ]}
    reference={{ label: "shadcn/ui Card", href: "https://ui.shadcn.com/docs/components/base/card" }} />;
}
