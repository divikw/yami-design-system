import { Button, Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@yami/design-system";
import { DialogExample } from "../../../packages/design-system/components/Dialog/examples";
import { ComponentGuide, type GuideExample } from "./component-guide";
import type { DocsLocale } from "./component-docs-template";
import styles from "./component-guide.module.css";

export function DialogDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const [basic, sticky]: GuideExample[] = [false, true].map((long) => {
    const title = long ? (zh ? "配送说明" : "Delivery details") : (zh ? "编辑昵称" : "Edit nickname");
    const trigger = long ? (zh ? "查看说明" : "View details") : title;
    const content = long
      ? `{Array.from({ length: 24 }, (_, index) => <p key={index}>${zh ? "请在下单前核对配送地址和联系电话。配送进度可在订单详情中查看。" : "Check your delivery address and phone number before ordering. Track delivery in your order details."}</p>)}`
      : `<Input fullWidth label="${zh ? "昵称" : "Nickname"}" name="nickname" defaultValue="YAMI" required />`;
    return {
      id: long ? "sticky-footer" : "basic",
      title: long ? (zh ? "固定底部操作区" : "Sticky footer") : (zh ? "基础用法" : "Basic"),
      description: long ? (zh ? "内容超过安全高度后独立滚动，标题与操作区保持可见。长篇移动端详情优先使用 Drawer。" : "Overflowing content scrolls while the heading and actions stay visible. Prefer Drawer for lengthy mobile detail flows.") : (zh ? "受控弹窗用于短任务和表单。关闭按钮、Escape 和点击遮罩均请求关闭；保存由表单提交处理。示例不保存实际账户数据。" : "A controlled modal for short tasks and forms. Close, Escape and outside presses request dismissal; the form handles Save. This demo does not save account data."),
      preview: <div className={styles.row}><DialogExample locale={locale} long={long} /></div>,
      code: `import { useId, useState } from "react";\nimport { Dialog, Button, ButtonGroup, Input } from "@yami/design-system";\n\nfunction Example() {\n  const [open, setOpen] = useState(false);\n  const formId = useId();\n  return (\n    <div lang="${locale}">\n      <Button variant="secondary" onClick={() => setOpen(true)}>${trigger}</Button>\n      <Dialog open={open} title="${title}" closeLabel="${zh ? "关闭" : "Close"}" lang="${locale}" onClose={() => setOpen(false)}\n        footer={<ButtonGroup full aria-label="${zh ? "编辑操作" : "Editing actions"}">\n          <Button variant="secondary" size="md" onClick={() => setOpen(false)}>${zh ? "取消" : "Cancel"}</Button>\n          <Button size="md" htmlType="submit" htmlForm={formId}>${zh ? "保存" : "Save"}</Button>\n        </ButtonGroup>}>\n        <form id={formId} onSubmit={(event) => { event.preventDefault(); setOpen(false); }}>\n          ${content}\n        </form>\n      </Dialog>\n    </div>\n  );\n}`,
    };
  });
  const close = zh ? "关闭" : "Close";
  const details = zh ? "自提说明" : "Pickup details";
  const instructions = zh ? "取货时请出示订单号。" : "Show your order number at pickup.";
  const done = zh ? "知道了" : "Got it";
  const closeExamples: GuideExample[] = [false, true].map((custom) => {
    const trigger = custom ? (zh ? "查看自提说明" : "View pickup details") : (zh ? "查看取货要求" : "View pickup requirements");
    return {
      id: custom ? "custom-close" : "no-close-button",
      title: custom ? (zh ? "自定义关闭按钮" : "Custom close button") : (zh ? "隐藏关闭按钮" : "No close button"),
      description: custom
        ? (zh ? "通过 DialogClose 将底部按钮接入关闭行为，关闭后焦点回到触发器。" : "Use DialogClose with a footer button. Closing returns focus to the trigger.")
        : (zh ? "隐藏右上角图标，用底部关闭按钮退出。" : "Hide the corner icon and dismiss with the footer close button."),
      preview: <div className={styles.row}>
        <Dialog>
          <DialogTrigger render={<Button variant="secondary" />}>{trigger}</DialogTrigger>
          <DialogContent showCloseButton={false} lang={locale}>
            <DialogHeader><DialogTitle>{details}</DialogTitle><DialogDescription>{instructions}</DialogDescription></DialogHeader>
            {custom ? <DialogFooter><DialogClose render={<Button />}>{done}</DialogClose></DialogFooter> : <DialogFooter showCloseButton closeLabel={close} />}
          </DialogContent>
        </Dialog>
      </div>,
      code: `import { Button, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter${custom ? ", DialogClose" : ""} } from "@yami/design-system";

<Dialog>
  <DialogTrigger render={<Button variant="secondary" />}>${trigger}</DialogTrigger>
  <DialogContent showCloseButton={false} lang="${locale}">
    <DialogHeader>
      <DialogTitle>${details}</DialogTitle>
      <DialogDescription>${instructions}</DialogDescription>
    </DialogHeader>${custom ? `\n    <DialogFooter><DialogClose render={<Button />}>${done}</DialogClose></DialogFooter>` : `\n    <DialogFooter showCloseButton closeLabel="${close}" />`}
  </DialogContent>
</Dialog>`,
    };
  });
  const scroll = zh ? "查看配送条款" : "View delivery terms";
  const terms = zh ? "配送条款" : "Delivery terms";
  const scrolling: GuideExample = {
    id: "scrolling", title: zh ? "正文滚动" : "Scrollable content",
    description: zh ? "长正文在 DialogBody 内滚动，标题和关闭按钮保持可见。" : "Long content scrolls inside DialogBody while the heading and close control stay visible.",
    preview: <div className={styles.row}><Dialog>
      <DialogTrigger render={<Button variant="secondary" />}>{scroll}</DialogTrigger>
      <DialogContent closeLabel={close} lang={locale}>
        <DialogHeader><DialogTitle>{terms}</DialogTitle></DialogHeader>
        <DialogBody>{Array.from({ length: 30 }, (_, i) => <p key={i}>{i + 1}. {instructions}</p>)}</DialogBody>
      </DialogContent>
    </Dialog></div>,
    code: `import { Button, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@yami/design-system";

<Dialog>
  <DialogTrigger render={<Button variant="secondary" />}>${scroll}</DialogTrigger>
  <DialogContent closeLabel="${close}" lang="${locale}">
    <DialogHeader><DialogTitle>${terms}</DialogTitle></DialogHeader>
    <DialogBody>{Array.from({ length: 30 }, (_, i) => <p key={i}>{i + 1}. ${instructions}</p>)}</DialogBody>
  </DialogContent>
</Dialog>`,
  };
  return <ComponentGuide previewMode="document" name="Dialog" slug="dialog" locale={locale}
    usageCode={`import { Button, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@yami/design-system";

<Dialog>
  <DialogTrigger render={<Button />}>${zh ? "查看自提说明" : "View pickup details"}</DialogTrigger>
  <DialogContent closeLabel="${close}">
    <DialogHeader>
      <DialogTitle>${details}</DialogTitle>
      <DialogDescription>${instructions}</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>`}
    intro={zh ? "用于短表单、编辑和一般信息的居中模态弹窗，行为由 Base UI 管理。重要确认使用 AlertDialog。" : "A centered modal for short forms, editing and general information, powered by Base UI. Use AlertDialog for important confirmations."}
    previous={{ name: "Checkbox", path: "yami-components-forms-checkbox" }}
    next={{ name: "Divider", path: "yami-components-layout-divider" }}
    composition={"Dialog\n├── DialogTrigger\n└── DialogContent\n    ├── DialogHeader → DialogTitle / DialogDescription\n    ├── DialogBody\n    └── DialogFooter → DialogClose"}
    examples={[basic, ...closeExamples, sticky, scrolling]}
    apiNote={zh ? "保留 YAMI 受控接口。内部使用 Base UI Root / Portal / Backdrop / Viewport / Popup / Title / Close。弹层通过 Portal 挂到 body，根节点为 div；原生 dialog 的 showModal、close 和 method=dialog 不再适用。焦点、遮罩、Escape 与滚动锁定由 Base UI 管理。" : "Preserves the YAMI controlled interface, backed by Base UI Root / Portal / Backdrop / Viewport / Popup / Title / Close. Content is portalled to body with a div root; native showModal, close and method=dialog no longer apply. Base UI manages focus, outside presses, Escape and scroll locking."}
    api={[
      ["defaultOpen / open / onOpenChange", zh ? "组合用法默认关闭。defaultOpen 指定初始值，也可用 open 与 onOpenChange 受控管理。" : "Composition starts closed. Set defaultOpen for an initial value or use open and onOpenChange to control it."],
      ["DialogContent / showCloseButton", zh ? "默认显示右上角关闭按钮，可设为 false。使用 closeLabel 提供本地化名称。" : "Shows the corner close icon by default. Pass false to hide it and closeLabel to localize its name."],
      ["DialogFooter / showCloseButton", zh ? "默认 false。设为 true 可在底部追加一个关闭按钮，closeLabel 指定文字。" : "Defaults to false. Enable it to append a footer close button with the supplied closeLabel."],
      ["DialogTrigger / DialogClose", zh ? "通过 render 接入触发或关闭按钮。" : "Use render to supply an opening or closing control."],
      ["DialogTitle / DialogDescription", zh ? "自动关联弹窗名称和说明。" : "Automatically associate the accessible name and description."],
      ["initialFocus / finalFocus", zh ? "通过 DialogContent 指定打开和关闭后的焦点。" : "Set focus targets on DialogContent for opening and closing."],
      ["open / onClose", zh ? "简写模式下必填；受控可见性与关闭请求，宿主通过 open=false 完成关闭。" : "Required in the shorthand API. Controlled visibility and close request; the host closes by setting open=false."],
      ["title / closeLabel", zh ? "可见标题与关闭按钮的本地化名称；简写模式显示关闭图标时必填 closeLabel。" : "Visible heading and localized Close name; closeLabel is required for a visible shorthand Close button."],
      ["children / footer", zh ? "可滚动正文 / 固定操作区域；业务提交与异步状态由宿主处理。" : "Scrollable body / fixed actions; the host owns submission and async state."],
      ["variant", zh ? "default；兼容保留 confirmation（居中标题、无关闭按钮）。新确认流程使用 AlertDialog。" : "default; legacy confirmation remains (centered title, no Close). Use AlertDialog for new confirmation flows."],
      ["role", zh ? "默认 dialog；兼容 alertdialog 语义，但仍允许遮罩关闭，不等同于 AlertDialog。" : "Defaults to dialog; legacy alertdialog semantics still allow outside dismissal and are not equivalent to AlertDialog."],
      ["id / className / style / lang", zh ? "传递到弹层 div；保留 data-dialog 与 data-slot 钩子。" : "Passed to the popup div; data-dialog and data-slot hooks remain."],
    ]}
    reference={{ label: "Base UI Dialog", href: "https://base-ui.com/react/components/dialog" }} />;
}
