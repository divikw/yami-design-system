import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, Button, useDesktopViewport } from "@yami/design-system";
import { ComponentGuide, type GuideExample } from "./component-guide";
import type { DocsLocale } from "./component-docs-template";
import styles from "./component-guide.module.css";

function AlertDialogPreview({ locale, trigger, title, description, cancel, action, variant }: {
  locale: DocsLocale;
  trigger: string;
  title: string;
  description: string;
  cancel: string;
  action: string;
  variant: "primary" | "emphasis";
}) {
  const actionSize = useDesktopViewport() ? "md" : "sm";
  return <div className={styles.row}>
    <AlertDialog>
      <AlertDialogTrigger render={<Button size={actionSize} variant="secondary" />}>{trigger}</AlertDialogTrigger>
      <AlertDialogContent lang={locale}>
        <AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>{cancel}</AlertDialogCancel><AlertDialogAction variant={variant}>{action}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>;
}

export function AlertDialogDocsPage({ locale }: { locale: DocsLocale }) {
  const actionSize = useDesktopViewport() ? "md" : "sm";
  const zh = locale === "zh";
  const examples: GuideExample[] = [false, true].map((destructive) => {
    const trigger = destructive ? (zh ? "删除地址" : "Delete address") : (zh ? "确认更改" : "Confirm changes");
    const title = destructive ? (zh ? "删除这个地址？" : "Delete this address?") : (zh ? "应用配送设置？" : "Apply delivery settings?");
    const description = destructive ? (zh ? "此操作无法撤销。删除后，你需要重新添加这个配送地址。" : "This action cannot be undone. You will need to add this delivery address again.") : (zh ? "新的设置将在下一次下单时生效，已提交的订单不受影响。" : "Your new settings will apply to your next order. Existing orders will not be changed.");
    const cancel = zh ? "取消" : "Cancel";
    const action = destructive ? (zh ? "删除" : "Delete") : (zh ? "应用设置" : "Apply settings");
    const variant = destructive ? "emphasis" : "primary";
    return {
      id: destructive ? "destructive" : "basic",
      title: destructive ? (zh ? "危险操作" : "Destructive action") : (zh ? "基础用法" : "Basic"),
      description: destructive ? (zh ? "不可撤销的操作使用一个 emphasis 按钮。示例只演示确认交互，不会删除实际地址。" : "Use one emphasis action for irreversible changes. This demo does not delete a real address.") : (zh ? "取消按钮排在确认之前。点击遮罩不会关闭；Escape、取消或确认可以关闭并恢复触发器焦点。" : "Cancel precedes confirmation. Outside presses do not dismiss; Escape, Cancel and confirmation close the dialog and restore trigger focus."),
      code: `import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, Button } from "@yami/design-system";\n\n<AlertDialog>\n  <AlertDialogTrigger render={<Button size="${actionSize}" variant="secondary" />}>${trigger}</AlertDialogTrigger>\n  <AlertDialogContent lang="${locale}">\n    <AlertDialogHeader>\n      <AlertDialogTitle>${title}</AlertDialogTitle>\n      <AlertDialogDescription>${description}</AlertDialogDescription>\n    </AlertDialogHeader>\n    <AlertDialogFooter>\n      <AlertDialogCancel>${cancel}</AlertDialogCancel>\n      <AlertDialogAction variant="${variant}">${action}</AlertDialogAction>\n    </AlertDialogFooter>\n  </AlertDialogContent>\n</AlertDialog>`,
      preview: <AlertDialogPreview {...{ locale, trigger, title, description, cancel, action, variant }} />,
    };
  });
  return <ComponentGuide previewMode="document" name="AlertDialog" slug="alert-dialog" locale={locale}
    intro={zh ? "需要用户明确确认的模态弹窗，适用于重要更改和不可撤销操作。" : "A modal confirmation for important changes and irreversible actions."}
    usageNote={zh ? "当操作需要用户先阅读后果并明确确认时，使用 AlertDialog。" : "Use AlertDialog when people need to review a consequence and explicitly confirm the action."}
    practices={zh ? [["do", "说明确认后会发生什么，使用能描述操作的按钮文案。"], ["avoid", "用确认对话框承载长表单或多步骤任务。"]]
      : [["do", "Explain the consequence and label the confirmation button with the action."], ["avoid", "Put long forms or multi-step tasks inside a confirmation dialog."]]}
    accessibility={zh ? ["通过 AlertDialogTitle 和 AlertDialogDescription 提供名称及说明。", "取消按钮排在确认之前。Escape 会关闭对话框并把焦点还给触发器。"]
      : ["Use AlertDialogTitle and AlertDialogDescription to name and describe the dialog.", "Place Cancel before confirmation. Escape dismisses the dialog and returns focus to the trigger."]}
    previous={{ name: "Alert", path: "yami-components-data-display-alert" }}
    next={{ name: "AspectRatio", path: "yami-components-layout-aspectratio" }}
    composition={"AlertDialog\n├── AlertDialogTrigger\n└── AlertDialogContent\n    ├── AlertDialogHeader\n    │   ├── AlertDialogTitle\n    │   └── AlertDialogDescription\n    └── AlertDialogFooter\n        ├── AlertDialogCancel\n        └── AlertDialogAction"}
    examples={examples}
    apiNote={zh ? "行为使用 Base UI Alert Dialog，视觉使用 YAMI token 与 Button。Action 默认同步关闭；异步业务使用受控 open，并通过 onOpenChange 的事件详情 cancel() 阻止尚未完成的关闭，成功后由宿主更新状态。PC 和 Mobile 都保持居中；PC 标题左对齐、操作靠右，仅保留底部取消和确认操作，Mobile 保持原有紧凑布局。" : "Base UI provides behavior; YAMI tokens and Button provide visuals. Action closes synchronously by default. For async work, control open, cancel premature close requests with the onOpenChange event details cancel(), and let the host close after success. Both remain centered; PC uses a left-aligned heading, right-aligned Cancel and confirmation actions without a corner close control, while Mobile keeps its compact layout."}
    api={[
      ["AlertDialog", "open, defaultOpen, onOpenChange, onOpenChangeComplete"],
      ["AlertDialogTrigger", zh ? "render、disabled；推荐 render={<Button />}。" : "render, disabled; prefer render={<Button />}."],
      ["AlertDialogContent", zh ? "initialFocus、finalFocus、container、keepMounted、lang、className、style；内部包含 Portal / Backdrop / Viewport / Popup。" : "initialFocus, finalFocus, container, keepMounted, lang, className, style. Includes Portal / Backdrop / Viewport / Popup."],
      ["AlertDialogTitle / Description", zh ? "提供弹窗的无障碍名称和说明。" : "Supply the accessible name and description."],
      ["AlertDialogHeader / Footer", zh ? "内容布局；Header 支持溢出滚动，Footer 保留操作。" : "Layout containers; Header scrolls overflowing content while Footer retains actions."],
      ["AlertDialogCancel / Action", zh ? "Base UI Close 属性及 variant、size；默认 secondary / primary；默认尺寸为 md（40px）。支持 disabled、onClick、ref、render。" : "Base UI Close props plus variant and size; defaults secondary / primary; the default size is md (40px). Supports disabled, onClick, ref, render."],
    ]}
    reference={{ label: "Base UI Alert Dialog", href: "https://base-ui.com/react/components/alert-dialog" }} />;
}
