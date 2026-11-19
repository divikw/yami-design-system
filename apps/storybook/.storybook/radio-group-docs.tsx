import { RadioGroup, RadioGroupItem } from "@yami/design-system";
import type { DocsLocale } from "./component-docs-template";
import { ComponentGuide, type GuideExample } from "./component-guide";
import { DensityDescriptions } from "./radio-description-example";
import descriptionSource from "./radio-description-example.tsx?raw";
import { PlanCards } from "./radio-choice-card-example";
import cardSource from "./radio-choice-card-example.tsx?raw";
import { BillingPeriod } from "./radio-fieldset-example";
import fieldsetSource from "./radio-fieldset-example.tsx?raw";
import { NotificationPreference } from "./radio-invalid-example";
import invalidSource from "./radio-invalid-example.tsx?raw";
import styles from "./component-guide.module.css";

const imports = 'import { RadioGroup, RadioGroupItem } from "@yami/design-system";';
const row = { display: "flex", alignItems: "center", gap: "var(--space-100)", lineHeight: "var(--line-height-body-md)" };
const rowCode = 'style={{ display: "flex", alignItems: "center", gap: "var(--space-100)", lineHeight: "var(--line-height-body-md)" }}';

export function RadioGroupDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const density = zh ? "显示密度" : "Display density";
  const choices = [["default", zh ? "默认" : "Default"], ["comfortable", zh ? "舒适" : "Comfortable"], ["compact", zh ? "紧凑" : "Compact"]];
  function densityDemo(disabled: boolean) {
    const preview = <RadioGroup aria-label={density} defaultValue="comfortable" disabled={disabled}
      style={{ color: disabled ? "var(--text-disabled)" : undefined }}>
      {choices.map(([value, label]) => <label key={value} style={row}><RadioGroupItem value={value} />{label}</label>)}
    </RadioGroup>;
    const disabledProps = disabled ? ' disabled style={{ color: "var(--text-disabled)" }}' : "";
    const code = `${imports}\n\n<RadioGroup aria-label="${density}" defaultValue="comfortable"${disabledProps}>
${choices.map(([value, label]) => `  <label ${rowCode}>\n    <RadioGroupItem value="${value}" />\n    ${label}\n  </label>`).join("\n")}
</RadioGroup>`;
    return { preview: <div className={styles.row}>{preview}</div>, code };
  }
  const lead = densityDemo(false);
  const examples: GuideExample[] = [
    { id: "description", title: zh ? "选项说明" : "Description",
      description: zh ? "圆环与标题首行居中对齐。用 aria-describedby 将下方说明关联到对应选项。" : "Align the radio with the first line of its label. Connect each supporting description with aria-describedby.",
      preview: <div className={styles.row}><DensityDescriptions locale={locale} /></div>,
      code: descriptionSource.trim() + `\n\n<DensityDescriptions locale="${locale}" />` },
    { id: "choice-card", title: zh ? "选择卡片" : "Choice Card",
      description: zh ? "将整张卡片作为标签，点击标题、说明或圆环都能选中该方案。" : "Use the entire card as a label so its title, description and radio all select the plan.",
      preview: <PlanCards locale={locale} />, code: cardSource.trim() + `\n\n<PlanCards locale="${locale}" />` },
    { id: "fieldset", title: zh ? "字段组" : "Fieldset",
      description: zh ? "用 fieldset 和 legend 为一组选项提供可见标题，并关联整组说明。" : "Give the options a visible legend and associate the group with its instructions.",
      preview: <div className={styles.row}><BillingPeriod locale={locale} /></div>, code: fieldsetSource.trim() + `\n\n<BillingPeriod locale="${locale}" />` },
    { id: "disabled", title: zh ? "禁用" : "Disabled",
      description: zh ? "在组上设置 disabled 会禁用全部选项，并保留当前选择。" : "Set disabled on the group to disable every option and preserve the current selection.",
      ...densityDemo(true) },
    { id: "invalid", title: zh ? "错误状态" : "Invalid",
      description: zh ? "必填项校验失败时显示错误说明。选择通知方式后，错误提示和圆环的错误描边一起清除。" : "Show the validation error for a required group. Selecting a preference clears the message and the error borders.",
      preview: <div className={styles.row}><NotificationPreference locale={locale} /></div>, code: invalidSource.trim() + `\n\n<NotificationPreference locale="${locale}" />` },
  ];
  return <ComponentGuide name="Radio Group" slug="radiogroup" locale={locale}
    intro={zh ? "让用户从一组选项中选择一项。用方向键在选项之间切换。" : "Choose one option from a set. Use the arrow keys to move between options."}
    previous={{ name: "Progress", path: "yami-components-data-display-progress" }}
    next={{ name: "Select", path: "yami-components-forms-select" }}
    leadExample={{ title: density, ...lead }} usageCode={lead.code}
    composition={"RadioGroup\n├── RadioGroupItem\n└── RadioGroupItem"} examples={examples}
    legacyAnchors={{ usage: ["radiogroup--usage", "radiogroup--使用说明"], description: ["component-specifications", "anatomy-and-states", "外观与状态"], api: ["component-playground", "accessibility", "键盘与无障碍", "值与表单", "state-changes"] }}
    apiNote={zh ? "每项占 20×20px，18×18px 圆环居中。点击区域为 PC 32×32px、Mobile 40×40px。Tab 进入或离开整组，方向键切换选项。" : "Each item occupies 20×20px with a centered 18px ring. The pointer target is 32px square on desktop and 40px on mobile. Tab enters or leaves the group. Arrow keys change the selection."}
    api={[
      ["RadioGroup.value / defaultValue", zh ? "受控值或非受控初始值。字符串对应选项，null 表示未选择。" : "Controlled or initial selection. Use an option string or null for no selection."],
      ["RadioGroup.onValueChange", zh ? "选择变化时接收选项值和 Base UI 事件详情。" : "Receives the selected value and Base UI event details."],
      ["RadioGroup.name / form / required", zh ? "设置提交字段名、所属表单和原生必填校验。" : "Configure the submitted field name, form owner and required validation."],
      ["RadioGroup.disabled / readOnly", zh ? "禁用整组或将选择设为只读。两者默认均为 false。" : "Disable the group or make the selection read-only. Both default to false."],
      ["RadioGroupItem.value", zh ? "必填。同组内每项使用唯一字符串。" : "Required. Give each item a unique string within the group."],
      ["RadioGroupItem.disabled", zh ? "禁用单个选项，键盘导航会跳过该项。" : "Disable an individual option and skip it during keyboard navigation."],
      ["RadioGroupItem.aria-invalid", zh ? "设为 true 时显示错误描边。用 aria-describedby 关联错误说明。" : "Set to true for an error border. Associate the error message with aria-describedby."],
    ]} reference={{ label: "shadcn/ui Radio Group", href: "https://ui.shadcn.com/docs/components/base/radio-group" }} />;
}
