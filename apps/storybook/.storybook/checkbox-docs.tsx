import { Checkbox } from "@yami/design-system";
import type { DocsLocale } from "./component-docs-template";
import { ComponentGuide, type GuideExample } from "./component-guide";
import styles from "./component-guide.module.css";
import { CheckboxOverview } from "./checkbox-overview-example";
import overviewSource from "./checkbox-overview-example.tsx?raw";
import { OrderSelection } from "./checkbox-table-example";
import tableSource from "./checkbox-table-example.tsx?raw";
import { ConsentForm } from "./checkbox-validation-example";
import validationSource from "./checkbox-validation-example.tsx?raw";

const imports = 'import { Checkbox } from "@yami/design-system";';
const labelStyle = { display: "inline-flex", alignItems: "center", gap: "var(--space-100)", lineHeight: "var(--line-height-body-md)" };
const labelStyleCode = 'style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-100)", lineHeight: "var(--line-height-body-md)" }}';

export function CheckboxDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const offers = zh ? "接收邮件优惠" : "Email me offers";
  const shipping = zh ? "配送提醒" : "Delivery updates";
  const help = zh ? "订单发货时通过邮件通知我。" : "Email me when my order ships.";
  const sms = zh ? "短信提醒" : "Text messages";
  const groupLabel = zh ? "通知偏好" : "Notification preferences";
  const all = zh ? "选择全部订单" : "Select all orders";
  const orders = ["YM-1024", "YM-1025", "YM-1026"];
  const caption = zh ? "订单编号" : "Order number";
  const overview = {
    offers,
    shipping,
    shippingHelp: help,
    sms,
    restock: zh ? "订阅到货通知" : "Notify me when items are back in stock",
    restockHelp: zh ? "收藏的商品补货时，通过邮件通知我。" : "Get an email when a saved item is available again.",
  };
  const form = {
    label: zh ? "我同意退换货条款" : "I accept the return policy",
    submit: zh ? "确认" : "Confirm",
    error: zh ? "请先勾选退换货条款。" : "Accept the return policy to continue.",
    success: zh ? "已确认条款。" : "Policy accepted.",
  };
  const basic = `<label htmlFor="email-offers" ${labelStyleCode}>
  <Checkbox id="email-offers" name="offers" value="email" />
  ${offers}
</label>`;

  const examples: GuideExample[] = [
    {
      id: "basic", title: zh ? "基础用法" : "Basic",
      description: zh ? "点击方框或标签切换选中状态。使用 Tab 聚焦后，按空格也可以切换。" : "Click the box or its label to toggle it. Use Tab to focus it and Space to toggle it from the keyboard.",
      code: `${imports}\n\n${basic}`,
      preview: <label htmlFor="email-offers" style={labelStyle}><Checkbox id="email-offers" name="offers" value="email" />{offers}</label>,
    },
    {
      id: "description", title: zh ? "说明与默认选中" : "Description and default selection",
      description: zh ? "defaultChecked 设置初始状态。用 aria-describedby 关联补充说明，让读屏软件分别读出名称和说明。" : "Initialize the option with defaultChecked. Connect supporting text with aria-describedby so assistive technology can distinguish the name and description.",
      code: `${imports}

<div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", columnGap: "var(--space-100)", lineHeight: "var(--line-height-body-md)" }}>
  <Checkbox id="shipping" defaultChecked aria-describedby="shipping-note" />
  <label htmlFor="shipping">${shipping}</label>
  <p id="shipping-note" style={{ gridColumn: 2, margin: 0, color: "var(--text-secondary)" }}>${help}</p>
</div>`,
      preview: <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", columnGap: "var(--space-100)", lineHeight: "var(--line-height-body-md)" }}>
        <Checkbox id="shipping" defaultChecked aria-describedby="shipping-note" />
        <label htmlFor="shipping">{shipping}</label>
        <p id="shipping-note" style={{ gridColumn: 2, margin: 0, color: "var(--text-secondary)" }}>{help}</p>
      </div>,
    },
    {
      id: "disabled", title: zh ? "禁用" : "Disabled",
      description: zh ? "禁用选项可以保留已选值。Tab 会跳过这些控件，提交表单时也会跳过它们。" : "A disabled option can retain its checked state. It is skipped during keyboard navigation and form submission.",
      code: `${imports}

<div style={{ display: "grid", rowGap: "var(--space-250)", color: "var(--text-disabled)" }}>
  <label htmlFor="sms-off" ${labelStyleCode}>
    <Checkbox id="sms-off" disabled />${sms}
  </label>
  <label htmlFor="shipping-on" ${labelStyleCode}>
    <Checkbox id="shipping-on" defaultChecked disabled />${shipping}
  </label>
</div>`,
      preview: <div style={{ display: "grid", rowGap: "var(--space-250)", color: "var(--text-disabled)" }}>
        <label htmlFor="sms-off" style={labelStyle}><Checkbox id="sms-off" disabled />{sms}</label>
        <label htmlFor="shipping-on" style={labelStyle}><Checkbox id="shipping-on" defaultChecked disabled />{shipping}</label>
      </div>,
    },
    {
      id: "group", title: zh ? "分组选项" : "Group",
      description: zh ? "用 fieldset 和 legend 为一组独立选项命名。共享 name 并设置不同的 value，提交时用 FormData.getAll 读取所有选中项。" : "Name a group of independent options with fieldset and legend. Give them the same name and different values, then read the selected values with FormData.getAll.",
      code: `${imports}

<fieldset style={{ display: "grid", rowGap: "var(--space-250)", border: 0, padding: 0 }}>
  <legend>${groupLabel}</legend>
  <label htmlFor="notify-email" ${labelStyleCode}>
    <Checkbox id="notify-email" name="notify" value="email" />${offers}
  </label>
  <label htmlFor="notify-sms" ${labelStyleCode}>
    <Checkbox id="notify-sms" name="notify" value="sms" />${sms}
  </label>
</fieldset>`,
      preview: <fieldset style={{ display: "grid", rowGap: "var(--space-250)", border: 0, padding: 0 }}>
        <legend>{groupLabel}</legend>
        <label htmlFor="notify-email" style={labelStyle}><Checkbox id="notify-email" name="notify" value="email" />{offers}</label>
        <label htmlFor="notify-sms" style={labelStyle}><Checkbox id="notify-sms" name="notify" value="sms" />{sms}</label>
      </fieldset>,
    },
    {
      id: "table", title: zh ? "表格全选与半选" : "Table selection and mixed state",
      description: zh ? "表头和每一行都使用紧凑复选框。初始仅选中第一行，表头显示半选。勾选表头可全选，再次点击会清空。逐行更改时，根据已选行数计算 checked 和 indeterminate。" : "The header and each row use compact checkboxes. Only the first row starts selected, so the header shows a mixed state. Toggle the header to select all rows or clear them. Derive checked and indeterminate from the row selection.",
      code: `${tableSource.trim()}\n\n<OrderSelection orders={${JSON.stringify(orders)}} selectAll="${all}" caption="${caption}" />`,
      preview: <OrderSelection orders={orders} selectAll={all} caption={caption} />,
    },
    {
      id: "validation", title: zh ? "必填与错误提示" : "Required field and validation",
      description: zh ? "直接点击确认可以查看错误提示。表单用 aria-invalid 标记必填项，通过 aria-describedby 关联提示，并把焦点移回复选框。" : "Press Confirm with the box unchecked to see the error. The form marks the field with aria-invalid, associates its message with aria-describedby and returns focus to the checkbox.",
      code: `${validationSource.trim()}\n\n<ConsentForm label="${form.label}" submit="${form.submit}" error="${form.error}" success="${form.success}" />`,
      preview: <ConsentForm {...form} />,
    },
  ];

  return <ComponentGuide name="Checkbox" slug="checkbox" locale={locale}
    intro={zh ? "用复选框选择一个或多个独立选项。批量选择时，用半选表示只选中了部分项目。" : "Use checkboxes for independent choices. Use the mixed state when only part of a group is selected."}
    previous={{ name: "Card", path: "yami-components-layout-card" }}
    next={{ name: "Combobox", path: "yami-components-forms-combobox" }}
    leadExample={{
      title: zh ? "状态预览" : "State preview",
      code: `${overviewSource.trim()}\n\n<CheckboxOverview labels={${JSON.stringify(overview, null, 2)}} />`,
      preview: <CheckboxOverview labels={overview} />,
    }}
    usageCode={`${imports}\n\n${basic}`}
    composition={'label (htmlFor)\n└── Checkbox (id)\n    └── '+(zh ? "内置选中与半选指示器" : "Built-in checked and mixed indicators")}
    examples={examples.map(example => ({ ...example, preview: <div className={styles.row}>{example.preview}</div> }))}
    legacyAnchors={{ usage: ["checkbox--usage"], composition: ["anatomy"], basic: ["component-playground", "accessibility"], disabled: ["component-specifications", "states"], table: ["state-changes"] }}
    apiNote={zh ? "布局为 20 × 20px，内部方框为 18 × 18px，PC 点击区域为 32 × 32px，Mobile 为 40 × 40px。Checkbox 自带指示器，标签和说明由调用方提供。" : "An 18 × 18px visible square sits in a 20 × 20px layout, with a 32 × 32px desktop or 40 × 40px mobile target. Checkbox supplies the indicator. Provide the label and any description alongside it."}
    api={[
      ["density", zh ? '默认 "default"。"default" 和 "compact" 尺寸相同，视口宽度达到 1024px 时点击区域为 32 × 32px，更窄时为 40 × 40px。' : 'Defaults to "default". Both values use a 32 × 32px target at viewport widths of 1024px or more and 40 × 40px below.'],
      ["checked / defaultChecked", zh ? "布尔值。checked 由调用方维护，defaultChecked 设置非受控初始值，默认未选中。" : "Boolean. Manage checked in controlled mode or initialize with defaultChecked. Defaults to unchecked."],
      ["onCheckedChange", zh ? "接收下一次的布尔值和事件详情。可调用 details.cancel() 取消更改。" : "Receives the next boolean value and event details. Call details.cancel() to cancel a change."],
      ["indeterminate", zh ? "为 true 时显示半选，并向读屏软件报告 mixed；与 checked 分别设置。" : "Displays the mixed indicator and exposes the mixed state to assistive technology. Set separately from checked."],
      ["disabled / readOnly", zh ? "disabled 跳过交互、聚焦和表单提交。readOnly 保留焦点和提交能力，同时锁定选中状态。" : "disabled skips interaction, focus and submission. readOnly locks the state while allowing focus and submission."],
      ["name / value / form / required", zh ? "name 和 value 指定选中项的表单字段和值，form 指定所属表单，required 启用必填校验。" : "name and value identify the checked form entry. form identifies the owning form. required enables required-field validation."],
      ["id / aria-label / aria-describedby", zh ? "用 id 与 label 的 htmlFor 关联。无可见标签时提供 aria-label，有说明或错误时通过 aria-describedby 关联。" : "Pair id with the label’s htmlFor. Supply aria-label when there is no visible label and use aria-describedby for help or errors."],
    ]}
    reference={{ label: "shadcn/ui Checkbox", href: "https://ui.shadcn.com/docs/components/base/checkbox" }} />;
}
