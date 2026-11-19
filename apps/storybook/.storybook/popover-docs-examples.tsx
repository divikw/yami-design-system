import type { DocsLocale } from "./component-docs-template";
import { EditNickname } from "./popover-nickname-example";
import nicknameSource from "./popover-nickname-example.tsx?raw";
import { PopoverAlignment } from "./popover-alignment-example";
import alignmentSource from "./popover-alignment-example.tsx?raw";
import { KeyboardHelp } from "./popover-close-example";
import closeSource from "./popover-close-example.tsx?raw";

export function popoverDocsExamples(locale: DocsLocale) {
  const zh = locale === "zh";
  return [
    {
      id: "alignment", title: zh ? "对齐方式" : "Alignment",
      description: zh ? "通过 align 将浮层对齐到触发器的起始边、中心或末端。" : "Use align to position the popup at the start, center, or end of the trigger.",
      code: alignmentSource.trim() + `\n\n<PopoverAlignment locale="${locale}" />`,
      preview: <PopoverAlignment locale={locale} />,
    },
    {
      id: "form", title: zh ? "表单" : "With a form",
      description: zh ? "在浮层中编辑昵称。保存后可看到新昵称，再次打开可继续修改。" : "Edit a nickname in the popover. Save to see the updated name, or reopen the form to edit it again.",
      code: nicknameSource.trim() + `\n\n<EditNickname locale="${locale}" />`,
      preview: <EditNickname locale={locale} />,
    },
    {
      id: "close-button", title: zh ? "关闭按钮与内边距" : "Close button and padding",
      description: zh ? "将 PopoverClose 放在标题旁，并为图标按钮提供无障碍名称。浮层四周默认留白 12px，可通过 PopoverContent 的 style 或 className 调整。" : "Place PopoverClose beside the title and give the icon button an accessible name. The panel has 12px of padding on all sides by default. Use style or className on PopoverContent to adjust it.",
      code: closeSource.trim() + `\n\n<KeyboardHelp locale="${locale}" />`,
      preview: <KeyboardHelp locale={locale} />,
    },
  ];
}
