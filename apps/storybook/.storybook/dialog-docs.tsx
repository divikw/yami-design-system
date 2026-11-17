import { DialogExample } from "../../../packages/design-system/components/Dialog/examples";
import { ComponentGuide, type GuideExample } from "./component-guide";
import type { DocsLocale } from "./component-docs-template";
import styles from "./component-guide.module.css";

export function DialogDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const examples: GuideExample[] = [false, true].map((long) => {
    const title = long ? (zh ? "配送说明" : "Delivery details") : (zh ? "编辑昵称" : "Edit nickname");
    const trigger = long ? (zh ? "查看说明" : "View details") : title;
    const content = long
      ? `{Array.from({ length: 24 }, (_, index) => <p key={index}>${zh ? "请在下单前核对配送地址和联系电话。配送进度可在订单详情中查看。" : "Check your delivery address and phone number before ordering. Track delivery in your order details."}</p>)}`
      : `<Input fullWidth label="${zh ? "昵称" : "Nickname"}" name="nickname" defaultValue="YAMI" required />`;
    return {
      id: long ? "scrolling" : "basic",
      title: long ? (zh ? "内容滚动" : "Scrolling content") : (zh ? "基础用法" : "Basic"),
      description: long ? (zh ? "内容超过安全高度后独立滚动，标题与操作区保持可见。长篇移动端详情优先使用 Sheet。" : "Overflowing content scrolls while the heading and actions stay visible. Prefer Sheet for lengthy mobile detail flows.") : (zh ? "受控弹窗用于短任务和表单。关闭按钮、Escape 和点击遮罩均请求关闭；保存由表单提交处理。示例不保存实际账户数据。" : "A controlled modal for short tasks and forms. Close, Escape and outside presses request dismissal; the form handles Save. This demo does not save account data."),
      preview: <div className={styles.row}><DialogExample locale={locale} long={long} /></div>,
      code: `import { useId, useState } from "react";\nimport { Dialog, Button, ButtonGroup, Input } from "@yami/design-system";\n\nfunction Example() {\n  const [open, setOpen] = useState(false);\n  const formId = useId();\n  return (\n    <div lang="${locale}">\n      <Button variant="secondary" onClick={() => setOpen(true)}>${trigger}</Button>\n      <Dialog open={open} title="${title}" closeLabel="${zh ? "关闭" : "Close"}" lang="${locale}" onClose={() => setOpen(false)}\n        footer={<ButtonGroup full aria-label="${zh ? "编辑操作" : "Editing actions"}">\n          <Button variant="secondary" size="md" onClick={() => setOpen(false)}>${zh ? "取消" : "Cancel"}</Button>\n          <Button size="md" htmlType="submit" htmlForm={formId}>${zh ? "保存" : "Save"}</Button>\n        </ButtonGroup>}>\n        <form id={formId} onSubmit={(event) => { event.preventDefault(); setOpen(false); }}>\n          ${content}\n        </form>\n      </Dialog>\n    </div>\n  );\n}`,
    };
  });
  return <ComponentGuide previewMode="document" name="Dialog" slug="dialog" locale={locale}
    intro={zh ? "用于短表单、编辑和一般信息的居中模态弹窗，行为由 Base UI 管理。重要确认使用 AlertDialog。" : "A centered modal for short forms, editing and general information, powered by Base UI. Use AlertDialog for important confirmations."}
    previous={{ name: "Coupon", path: "yami-components-commerce-coupon" }}
    next={{ name: "Divider", path: "yami-components-layout-divider" }}
    composition={"Dialog (open / title / onClose)\n├── Header + Close (internal)\n├── children (scrolling content)\n└── footer (caller-owned actions)"}
    examples={examples}
    apiNote={zh ? "保留 YAMI 受控接口。内部使用 Base UI Root / Portal / Backdrop / Viewport / Popup / Title / Close。弹层通过 Portal 挂到 body，根节点为 div；原生 dialog 的 showModal、close 和 method=dialog 不再适用。焦点、遮罩、Escape 与滚动锁定由 Base UI 管理。" : "Preserves the YAMI controlled interface, backed by Base UI Root / Portal / Backdrop / Viewport / Popup / Title / Close. Content is portalled to body with a div root; native showModal, close and method=dialog no longer apply. Base UI manages focus, outside presses, Escape and scroll locking."}
    api={[
      ["open / onClose", zh ? "必填；受控可见性与关闭请求，宿主通过 open=false 完成关闭。" : "Required controlled visibility and close request; the host closes by setting open=false."],
      ["title / closeLabel", zh ? "可见标题与关闭按钮的本地化名称；默认变体必填 closeLabel。" : "Visible heading and localized Close name; closeLabel is required for the default variant."],
      ["children / footer", zh ? "可滚动正文 / 固定操作区域；业务提交与异步状态由宿主处理。" : "Scrollable body / fixed actions; the host owns submission and async state."],
      ["variant", zh ? "default；兼容保留 confirmation（居中标题、无关闭按钮）。新确认流程使用 AlertDialog。" : "default; legacy confirmation remains (centered title, no Close). Use AlertDialog for new confirmation flows."],
      ["role", zh ? "默认 dialog；兼容 alertdialog 语义，但仍允许遮罩关闭，不等同于 AlertDialog。" : "Defaults to dialog; legacy alertdialog semantics still allow outside dismissal and are not equivalent to AlertDialog."],
      ["id / className / style / lang", zh ? "传递到弹层 div；保留 data-dialog 与 data-slot 钩子。" : "Passed to the popup div; data-dialog and data-slot hooks remain."],
    ]}
    reference={{ label: "Base UI Dialog", href: "https://base-ui.com/react/components/dialog" }} />;
}
