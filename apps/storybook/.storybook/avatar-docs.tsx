import { Avatar } from "@yami/design-system";
import { ComponentGuide, type GuideExample } from "./component-guide";
import type { DocsLocale } from "./component-docs-template";
import styles from "./component-guide.module.css";

export function AvatarDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const alt = zh ? "用户头像" : "User avatar";
  const importCode = 'import { Avatar } from "@yami/design-system";';
  const rowStyle = '{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "var(--space-200)" }';
  const sizes = ["sm", "md", "lg"] as const;
  const tiers = ["ruby-0", "ruby", "silver", "gold"] as const;
  const examples: GuideExample[] = [
    { id: "basic", title: zh ? "基础用法" : "Basic", description: zh ? "不传 src 时显示默认 YAMI 头像。使用 alt 提供无障碍名称。" : "Omit src to display the default YAMI avatar. Provide an accessible name with alt.",
      code: `${importCode}\n\n<Avatar alt="${alt}" />`, preview: <div className={styles.row}><Avatar alt={alt} /></div> },
    { id: "sizes", title: zh ? "尺寸" : "Sizes", description: zh ? "sm 为 32px，md 为 40px，lg 为 48px；PC 和 Mobile 使用相同尺寸。" : "sm is 32px, md is 40px and lg is 48px. Sizes are the same on desktop and mobile.",
      code: `${importCode}\n\n<div style={${rowStyle}}>\n${sizes.map((size) => `  <Avatar alt="${alt}" size="${size}" />`).join("\n")}\n</div>`,
      preview: <div className={styles.row}>{sizes.map((size) => <Avatar key={size} alt={alt} size={size} />)}</div> },
    { id: "fallback", title: zh ? "加载失败" : "Image fallback", description: zh ? "自定义图片加载中或加载失败时，显示默认 YAMI 头像。此示例故意传入无效图片，不会生成姓名缩写。" : "While a custom image loads or fails, the default YAMI avatar is shown. This example intentionally uses invalid image data; initials are not generated.",
      code: `${importCode}\n\n<Avatar src="data:image/png;base64,invalid" alt="${alt}" />`,
      preview: <div className={styles.row}><Avatar src="data:image/png;base64,invalid" alt={alt} /></div> },
    { id: "membership", title: zh ? "会员等级" : "Membership", description: zh ? "membershipTier 添加对应的彩色边框和会员角标；lang 决定无障碍会员名称的语言。" : "membershipTier adds the corresponding ring and tier icon. lang controls the language of the accessible membership label.",
      code: `${importCode}\n\n<div style={${rowStyle}}>\n${tiers.map((tier) => `  <Avatar alt="${alt}" membershipTier="${tier}" lang="${locale}" />`).join("\n")}\n</div>`,
      preview: <div className={styles.row}>{tiers.map((tier) => <Avatar key={tier} alt={alt} membershipTier={tier} lang={locale} />)}</div> },
  ];
  return <ComponentGuide name="Avatar" slug="avatar" locale={locale}
    intro={zh ? "用于账户、评价作者和身份展示的圆形头像，支持图片回退和会员标识。" : "A circular image for accounts, review authors and identity, with image fallback and membership indicators."}
    previous={{ name: "AspectRatio", path: "yami-components-layout-aspectratio" }}
    next={{ name: "Badge", path: "yami-components-data-display-badge" }}
    composition={"Avatar\n├── Image (internal)\n├── Fallback (internal)\n└── MembershipIcon (optional, internal)"} examples={examples}
    apiNote={zh ? "图片加载与回退由 Base UI Avatar 管理。YAMI 对外提供以下单组件接口，内部部件无需手动组合。" : "Base UI Avatar manages image loading and fallback. YAMI exposes the following single-component API; internal parts do not need manual composition."}
    api={[["src", zh ? "可选图片 URL；未提供或失败时使用默认头像。" : "Optional image URL; the default avatar is used if omitted or loading fails."], ["alt", zh ? "必填 string；旁边有可见姓名时可传空字符串。" : "Required string; use an empty string beside a visible name."], ["size", '"sm" | "md" | "lg"; default: "md"'], ["membershipTier", '"ruby-0" | "ruby" | "silver" | "gold"'], ["lang", zh ? "默认 en；传 zh 使用中文会员无障碍名称。" : "Defaults to en; pass zh for Chinese accessible membership labels."], ["className, style, ref", zh ? "支持原生 span 属性和 ref，不接受 children。" : "Native span attributes and ref are supported; children are not accepted."]]}
    reference={{ label: "Base UI Avatar", href: "https://base-ui.com/react/components/avatar" }} />;
}
