import { Button } from "@yami/design-system";
import { ArrowRight, ArrowUp, Download } from "lucide-react";
import { ComponentGuide, type GuideExample } from "./component-guide";
import type { DocsLocale } from "./component-docs-template";

const importButton = 'import { Button } from "@yami/design-system";';
const importArrowUp = `${importButton}\nimport { ArrowUp } from "lucide-react";`;
const rowStyle = { display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "var(--space-200)" } as const;
const pairStyle = { display: "grid", justifyItems: "center", gap: "var(--space-100)" } as const;
const iconSizes = { sm: 16, md: 20, lg: 24 } as const;
const mediumArrow = <ArrowUp size={iconSizes.md} strokeWidth={2} aria-hidden="true" />;
const legacyAnchors = {
  usage: ["button--使用说明", "button--usage", "使用场景", "不适用场景", "when-to-use", "when-not-to-use"],
  composition: ["相关操作与混合入口", "related-actions-and-mixed-navigation", "常见组合", "common-patterns", "product-card--button"],
  variants: ["视觉层级", "variants", "\uFE0F-emphasis-limit-rule-designmd"],
  sizes: ["尺寸", "sizes", "长文案与容器边界", "long-labels"],
  forms: ["形态", "form", "结算操作区", "checkout-cta-row-mobile-bottom-sheet", "-custom-radii", "-full-width-emphasis-buttons-stacked-vertically"],
  "with-icon": ["icons", "-emoji-inside-buttons"],
  states: ["加载状态", "禁用状态", "loading-state", "disabled-state"],
  inverse: ["反色与图标", "inverse"],
  navigation: ["按钮外观的导航buttonlink", "navigation-with-button-appearance"],
  api: ["表单与外部表单提交", "form-actions-modal--sheet-footer", "submit-an-external-form", "避免的用法", "anti-patterns", "-button-inside-button", "相关内容", "related"],
};

function rowCode(buttons: string[], imports = importButton) {
  return `${imports}\n\n<div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "var(--space-200)" }}>\n${buttons.map((button) => `  ${button}`).join("\n")}\n</div>`;
}

function pairCode(prop: string, label: string, iconLabel: string, iconSize: number = iconSizes.md) {
  return `<div style={{ display: "grid", justifyItems: "center", gap: "var(--space-100)" }}>\n    <Button ${prop}>${label}</Button>\n    <Button ${prop} form="icon" aria-label="${iconLabel}">\n      <ArrowUp size={${iconSize}} strokeWidth={2} aria-hidden="true" />\n    </Button>\n  </div>`;
}

export function ButtonDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const defaultLabel = zh ? "按钮" : "Button";
  const up = zh ? "向上" : "Up";
  const saving = zh ? "正在保存" : "Saving";
  const unavailable = zh ? "暂不可用" : "Unavailable";
  const continueLabel = zh ? "继续" : "Continue";
  const deleteLabel = zh ? "删除" : "Delete";
  const download = zh ? "下载" : "Download";
  const linkLabel = zh ? "链接" : "Link";
  const variants = [
    ["emphasis", zh ? "强调" : "Emphasis"],
    ["primary", zh ? "主要" : "Primary"],
    ["secondary", zh ? "次要" : "Secondary"],
    ["tertiary", zh ? "低强调" : "Tertiary"],
  ] as const;
  const leadVariants = [...variants, ["destructive", deleteLabel] as const];
  const sizes = [
    ["sm", zh ? "小号" : "Small"],
    ["md", zh ? "中号" : "Medium"],
    ["lg", zh ? "大号" : "Large"],
  ] as const;

  const examples: GuideExample[] = [
    {
      id: "basic",
      title: zh ? "基础用法" : "Basic",
      description: zh ? "默认是 primary 中号行内按钮，使用全圆角。纯图标按钮为正圆，并需要 aria-label。" : "The default is a medium primary inline button with a pill radius. Icon buttons are circular and require an aria-label.",
      code: rowCode([
        `<Button>${defaultLabel}</Button>`,
        `<Button form="icon" aria-label="${up}">\n    <ArrowUp size={${iconSizes.md}} strokeWidth={2} aria-hidden="true" />\n  </Button>`,
      ], importArrowUp),
      preview: <div style={rowStyle}>
        <Button>{defaultLabel}</Button>
        <Button form="icon" aria-label={up}>{mediumArrow}</Button>
      </div>,
    },
    {
      id: "variants",
      anchor: "component-specifications",
      title: zh ? "视觉层级" : "Variants",
      description: zh ? "按操作优先级选择层级，同屏只使用一个 emphasis。" : "Choose a variant by action priority. Use at most one emphasis action per screen.",
      code: rowCode(variants.map(([variant, label]) => pairCode(`variant="${variant}"`, label, `${up} (${variant})`)), importArrowUp),
      preview: <div style={rowStyle}>
        {variants.map(([variant, label]) => <div key={variant} style={pairStyle}>
          <Button variant={variant}>{label}</Button>
          <Button variant={variant} form="icon" aria-label={`${up} (${variant})`}>{mediumArrow}</Button>
        </div>)}
      </div>,
    },
    {
      id: "destructive",
      title: zh ? "危险操作" : "Destructive",
      description: zh ? "用于删除地址、移除成员等可能造成数据丢失或不可逆后果的操作。按钮文案应说明具体动作。" : "Use for actions that can remove data or have irreversible effects, such as deleting an address or removing a member. Name the action in the button label.",
      code: `${importButton}\n\n<Button variant="destructive">${deleteLabel}</Button>`,
      preview: <div style={rowStyle}><Button variant="destructive">{deleteLabel}</Button></div>,
    },
    {
      id: "sizes",
      title: zh ? "尺寸" : "Sizes",
      description: zh ? "行内和图标按钮在 PC 和 Mobile 都使用 32、40、48px，分别对应 sm、md、lg。示例中的图标分别为 16、20、24px。" : "Inline and icon buttons are 32, 40 and 48px high for sm, md and lg on both desktop and mobile. The icons shown are 16, 20 and 24px.",
      code: rowCode(sizes.map(([size, label]) => pairCode(`size="${size}"`, label, `${up} (${label})`, iconSizes[size])), importArrowUp),
      preview: <div style={rowStyle}>
        {sizes.map(([size, label]) => <div key={size} style={pairStyle}>
          <Button size={size}>{label}</Button>
          <Button size={size} form="icon" aria-label={`${up} (${label})`}>
            <ArrowUp size={iconSizes[size]} strokeWidth={2} aria-hidden="true" />
          </Button>
        </div>)}
      </div>,
    },
    {
      id: "forms",
      title: zh ? "通栏按钮" : "Full-width buttons",
      description: zh ? "通栏按钮填满父容器，使用 8px 圆角。小号、中号、大号在 PC（≥1024px）分别高 40、48、56px，在 Mobile 分别高 32、40、48px。" : "Full-width buttons fill their container with an 8px radius. Small, medium and large are 40, 48 and 56px high on desktop (≥1024px), and 32, 40 and 48px on mobile.",
      code: `${importButton}\n\n<div style={{ display: "grid", width: "100%", maxWidth: 320, marginInline: "auto", justifyItems: "center", gap: "var(--space-200)" }}>\n${sizes.map(([size, label]) => `  <Button form="full" size="${size}">${label}</Button>`).join("\n")}\n</div>`,
      preview: <div style={{ display: "grid", width: "100%", maxWidth: 320, marginInline: "auto", justifyItems: "center", gap: "var(--space-200)" }}>
        {sizes.map(([size, label]) => <Button key={size} form="full" size={size}>{label}</Button>)}
      </div>,
    },
    {
      id: "with-icon",
      title: zh ? "带图标" : "With icon",
      description: zh ? "用 leftIcon 或 rightIcon 将图标放在文字前后，间距由 Button 处理。" : "Use leftIcon or rightIcon to place an icon before or after the label. Button handles the spacing.",
      code: rowCode([
        `<Button variant="secondary" leftIcon={<Download size={16} strokeWidth={2} aria-hidden="true" />}>${download}</Button>`,
        `<Button variant="secondary" rightIcon={<ArrowRight size={16} strokeWidth={2} aria-hidden="true" />}>${continueLabel}</Button>`,
      ], `${importButton}\nimport { ArrowRight, Download } from "lucide-react";`),
      preview: <div style={rowStyle}>
        <Button variant="secondary" leftIcon={<Download size={16} strokeWidth={2} aria-hidden="true" />}>{download}</Button>
        <Button variant="secondary" rightIcon={<ArrowRight size={16} strokeWidth={2} aria-hidden="true" />}>{continueLabel}</Button>
      </div>,
    },
    {
      id: "states",
      title: zh ? "禁用与加载" : "Disabled and loading",
      description: zh ? "两种状态都保留键盘焦点和可访问名称，并阻止激活。loading 立即设置 aria-busy；loadingDelay 只延迟加载图标。" : "Both states retain keyboard focus and the accessible name while blocking activation. loading sets aria-busy immediately. loadingDelay delays the spinner only.",
      code: rowCode([`<Button disabled>${unavailable}</Button>`, `<Button loading>${saving}</Button>`]),
      preview: <div style={rowStyle}><Button disabled>{unavailable}</Button><Button loading>{saving}</Button></div>,
    },
    {
      id: "inverse",
      title: zh ? "反色" : "Inverse",
      description: zh ? "用于当前主题中明暗相反的背景。浅色和深色主题均可使用。" : "Use inverse on a surface with the opposite polarity within either theme.",
      code: `${importButton}\n\n<div style={{ display: "grid", placeItems: "center", padding: "var(--space-200)", background: "var(--surface-inverse)" }}>\n  <Button size="lg" inverse>${continueLabel}</Button>\n</div>`,
      previewBackground: "var(--surface-inverse)",
      preview: <div style={rowStyle}><Button size="lg" inverse>{continueLabel}</Button></div>,
    },
    {
      id: "navigation",
      title: zh ? "链接导航" : "Navigation link",
      description: zh ? "导航使用原生文字链接，默认带下划线。Button 用于执行操作。" : "Use a native text link with an underline for navigation. Use Button to perform an action.",
      code: `<a href="#button-api" target="_parent">${linkLabel}</a>`,
      preview: <div style={rowStyle}><a href="#button-api" target="_parent">{linkLabel}</a></div>,
    },
  ];

  return <div id="component-playground">
    <ComponentGuide name="Button" slug="button" locale={locale}
      leadExample={{
        code: rowCode(leadVariants.map(([variant, label]) => `<Button variant="${variant}">${label}</Button>`)),
        preview: <div style={rowStyle}>{leadVariants.map(([variant, label]) => <Button key={variant} variant={variant}>{label}</Button>)}</div>,
      }}
      usageCode={`${importButton}\n\n<Button>${continueLabel}</Button>`}
      usageNote={zh ? "用 Button 提交表单、保存设置或打开弹窗。跳转到其他页面时，使用 ButtonLink 或普通链接。" : "Use Button to submit a form, save settings, or open a dialog. Use ButtonLink or a plain link to navigate to another page."}
      intro={zh ? "用于保存、提交和打开弹层等操作。支持视觉层级、响应式尺寸和加载反馈。" : "Perform actions such as saving, submitting or opening an overlay, with visual variants, responsive sizes and loading feedback."}
      previous={{ name: "Breadcrumb", path: "yami-components-navigation-breadcrumb" }}
      next={{ name: "ButtonGroup", path: "yami-components-actions-button-group" }}
      legacyAnchors={legacyAnchors}
      composition={[
        ["children", zh ? "按钮文字。纯图标按钮在这里传入图标，并通过 aria-label 提供名称。" : "The button label. For an icon-only button, pass the icon here and give the button an aria-label."],
        ["leftIcon", zh ? "可选图标，位于文字之前。" : "Optional icon before the label."],
        ["rightIcon", zh ? "可选图标，位于文字之后。" : "Optional icon after the label."],
      ]}
      practices={zh ? [
        ["do", "文案直接说明动作，例如「保存地址」或「移除商品」。"],
        ["do", "会丢失数据或无法撤销的操作使用 destructive，并通过确认对话框说明后果。"],
        ["avoid", "避免同屏使用多个 emphasis 操作。按任务优先级为其他操作选择层级。"],
      ] : [
        ["do", "Name the action in the label, such as “Save address” or “Remove item”."],
        ["do", "Use destructive for actions that can delete data or cannot be undone. Explain the consequence in a confirmation dialog."],
        ["avoid", "Avoid multiple emphasis actions on one screen. Choose other variants by task priority."],
      ]}
      examples={examples}
      apiNote={zh ? "Button 基于 Base UI，输出原生 button。ButtonLink 输出原生 a。" : "Button uses Base UI and renders a native button. ButtonLink renders a native anchor."}
      api={[
        ["variant", zh ? "emphasis | primary | secondary | tertiary | destructive，默认 primary。" : "emphasis | primary | secondary | tertiary | destructive. Defaults to primary."],
        ["form", zh ? "Button 和 ButtonLink 均支持 inline | full | icon，默认 inline。" : "Both Button and ButtonLink support inline | full | icon. Defaults to inline."],
        ["size", zh ? "sm | md | lg，默认 md。" : "sm | md | lg. Defaults to md."],
        ["inverse", zh ? "使用反色令牌，默认 false。" : "Use opposite-polarity tokens. Defaults to false."],
        ["children, leftIcon, rightIcon", zh ? "文字与前后图标。form=icon 时通过 children 传图标，并提供 aria-label。" : "Label and optional leading or trailing icons. For form=icon, pass the icon as children and supply aria-label."],
        ["disabled, loading", zh ? "阻止激活并保留焦点，两者默认 false。loading 同时设置 aria-busy。" : "Block activation and retain focus. Both default to false. loading also sets aria-busy."],
        ["loadingDelay", zh ? "加载图标的延迟，单位为毫秒，默认 0。" : "Spinner delay in milliseconds. Defaults to 0."],
        ["htmlType, htmlForm", zh ? "htmlType 默认 button，另支持 submit 和 reset。htmlForm 指定所属表单的 id，可用于表单外的按钮。" : "htmlType defaults to button and also accepts submit and reset. htmlForm identifies the owning form, including for buttons outside it."],
        ["iconOnly, fullWidth", zh ? "兼容旧调用，仅在未指定 form 时生效，分别映射到 icon 和 full，iconOnly 优先。" : "Legacy props used when form is omitted. They map to icon and full respectively, with iconOnly taking precedence."],
        ["ref, className, style", zh ? "支持原生按钮属性、事件及 HTMLButtonElement ref。" : "Supports native button attributes, events and an HTMLButtonElement ref."],
        ["ButtonLink href", zh ? "链接目标，必填。支持原生链接属性和 HTMLAnchorElement ref。" : "Required destination. Supports native anchor attributes and an HTMLAnchorElement ref."],
      ]}
      accessibility={zh ? [
        "按钮支持 Tab 聚焦，通过 Enter 或空格激活。链接通过 Enter 打开。",
        "纯图标按钮和链接都需要 aria-label；标签应说明操作或目标。",
        "disabled 和 loading 保留键盘焦点并阻止激活。loading 会立即设置 aria-busy。",
      ] : [
        "Press Tab to focus a button and Enter or Space to activate it. Use Enter to follow a link.",
        "Give icon-only buttons and links an aria-label that names the action or destination.",
        "Disabled and loading buttons remain focusable and block activation. Loading sets aria-busy immediately.",
      ]}
      reference={{ label: "Base UI Button", href: "https://base-ui.com/react/components/button" }} />
  </div>;
}
