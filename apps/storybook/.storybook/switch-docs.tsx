import { Switch } from "@yami/design-system";
import type { DocsLocale } from "./component-docs-template";
import { ComponentGuide, type GuideExample } from "./component-guide";
import { Preference } from "./switch-preference-example";
import preferenceSource from "./switch-preference-example.tsx?raw";
import { TermsSwitch } from "../../../packages/design-system/components/Switch/validation/examples";
import invalidSource from "../../../packages/design-system/components/Switch/validation/examples.tsx?raw";
import styles from "./component-guide.module.css";

const imports = 'import { Switch } from "@yami/design-system";';
const row = { display: "flex", alignItems: "center", gap: "var(--space-100)" };
const rowCode = 'style={{ display: "flex", alignItems: "center", gap: "var(--space-100)" }}';

export function SwitchDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const airplane = zh ? "只看有货" : "In-stock items only";
  const usageCode = `${imports}\n\n<label ${rowCode}>\n  <Switch />\n  ${airplane}\n</label>`;
  const sync = { title: zh ? "到货提醒" : "Back-in-stock alerts",
    description: zh ? "收藏的商品补货时通知我。" : "Notify me when an item on my wishlist is back in stock." };
  const notify = { title: zh ? "降价提醒" : "Price drop alerts",
    description: zh ? "收藏的商品降价时通知我。" : "Notify me when the price drops on an item on my wishlist." };
  const preferenceCode = (props: typeof sync) => `title=${JSON.stringify(props.title)} description=${JSON.stringify(props.description)}`;
  const small = zh ? "小号" : "Small";
  const normal = zh ? "默认" : "Default";
  const disabled = zh ? "禁用" : "Disabled";
  const stack = { display: "grid", gap: "var(--space-100)" };
  const examples: GuideExample[] = [
    { id: "description", title: zh ? "带说明" : "Description",
      description: zh ? "用标题命名开关，通过 aria-describedby 关联补充说明。" : "Name the switch with its label and connect supporting text with aria-describedby.",
      preview: <Preference {...sync} />, code: preferenceSource.trim() + `\n\n<Preference ${preferenceCode(sync)} />` },
    { id: "choice-card", title: zh ? "选择卡片" : "Choice Card",
      description: zh ? "点击卡片的任意位置可切换对应设置，两项可独立开启。" : "Click anywhere on a card to toggle its setting. Each card switches independently.",
      preview: <div style={stack}><Preference {...sync} card /><Preference {...notify} card defaultChecked /></div>,
      code: preferenceSource.trim() + `\n\n<div style={{ display: "grid", gap: "var(--space-100)" }}>\n  <Preference ${preferenceCode(sync)} card />\n  <Preference ${preferenceCode(notify)} card defaultChecked />\n</div>` },
    { id: "disabled", title: disabled,
      description: zh ? "disabled 阻止切换和键盘聚焦，表单提交时会跳过这一项。" : "A disabled switch skips keyboard focus and form submission.",
      preview: <div className={styles.row}><Switch disabled>{disabled}</Switch></div>,
      code: `${imports}\n\n<Switch disabled>${disabled}</Switch>` },
    { id: "invalid", title: zh ? "错误状态" : "Invalid",
      description: zh ? "设置 aria-invalid 显示错误描边，并关联错误说明。接受预购条款后，错误提示消失。" : "Use aria-invalid for the error border and associate the error message. Accepting the preorder terms clears the error.",
      preview: <TermsSwitch locale={locale} />, code: invalidSource.trim() + `\n\n<TermsSwitch locale="${locale}" />` },
    { id: "size", title: zh ? "尺寸" : "Size",
      description: zh ? "小号轨道为 28×16px，默认轨道为 36×20px。两种尺寸的可点击高度均至少为 32px。" : "The small track measures 28×16px and the default track 36×20px. Both controls have a minimum clickable height of 32px.",
      preview: <div className={styles.row}><div style={stack}><label style={row}><Switch size="sm" />{small}</label><label style={row}><Switch size="default" />{normal}</label></div></div>,
      code: `${imports}\n\n<div style={{ display: "grid", gap: "var(--space-100)" }}>\n  <label ${rowCode}><Switch size="sm" />${small}</label>\n  <label ${rowCode}><Switch size="default" />${normal}</label>\n</div>` },
  ];
  return <ComponentGuide name="Switch" slug="switch" locale={locale}
    intro={zh ? "用开关筛选有货商品，或设置到货、降价提醒。切换后立即生效。" : "Use a switch to filter for in-stock items or turn shopping alerts on or off. Changes take effect immediately."}
    leadExample={{ code: usageCode, preview: <div className={styles.row}><label style={row}><Switch />{airplane}</label></div> }}
    usageCode={usageCode} composition={"Switch\n├── children\n└── Track → Thumb"} examples={examples}
    previous={{ name: "Spinner", path: "yami-components-data-display-spinner" }} next={{ name: "Tabs", path: "yami-components-navigation-tabs" }}
    legacyAnchors={{ usage: ["switch--usage", "switch--使用说明"], description: ["component-specifications"], api: ["component-playground"] }}
    apiNote={zh ? "使用 Tab 聚焦开关，按空格或 Enter 切换。图标或独立开关需要可访问名称。" : "Tab to focus the switch, then press Space or Enter to toggle. Give standalone switches an accessible name."}
    api={[
      ["size", zh ? "sm 或 default，默认为 default。" : "sm or default. Defaults to default."],
      ["checked / defaultChecked", zh ? "受控状态或非受控初始值，默认关闭。" : "Controlled state or initial uncontrolled value. Off by default."],
      ["onCheckedChange", zh ? "接收下一状态和 Base UI 事件详情，可调用 details.cancel() 取消切换。" : "Receives the next state and Base UI event details. Call details.cancel() to cancel the change."],
      ["disabled / readOnly", zh ? "禁用项跳过聚焦和提交；只读项可聚焦并参与提交。" : "Disabled switches skip focus and submission. Read-only switches can receive focus and submit their value."],
      ["aria-invalid / aria-describedby", zh ? "标记错误状态，并通过元素 ID 关联说明。" : "Mark an invalid state and associate supporting text by ID."],
      ["name / value / required", zh ? "设置表单字段名、选中时的提交值和必填校验。" : "Set the form field name, checked submission value and required constraint."],
      ["children", zh ? "可选的行内标签，整行可点击。" : "Optional inline label within the clickable row."],
    ]} reference={{ label: "shadcn/ui Switch", href: "https://ui.shadcn.com/docs/components/base/switch" }} />;
}
