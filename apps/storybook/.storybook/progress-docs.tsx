import { Progress, ProgressLabel, ProgressValue } from "@yami/design-system";
import { TransferProgress } from "../../../packages/design-system/components/Progress/examples";
import controlledCode from "../../../packages/design-system/components/Progress/examples.tsx?raw";
import { ProgressDemo } from "./progress-demo";
import demoCode from "./progress-demo.tsx?raw";
import { ComponentGuide } from "./component-guide";
import type { DocsLocale } from "./component-docs-template";

export function ProgressDocsPage({ locale }: { locale: DocsLocale }) {
  const en = locale === "en";
  const label = en ? "Upload progress" : "上传进度";
  const preparing = en ? "Preparing upload" : "正在准备上传";
  const examples = [
    { id: "label", title: en ? "Label and value" : "标签与数值",
      description: en ? "The visible label names the bar. The value shows the completed percentage." : "标签为进度条提供可访问名称，右侧数值显示已完成的百分比。",
      preview: <Progress value={56} locale={locale}><ProgressLabel>{label}</ProgressLabel><ProgressValue /></Progress>,
      code: `import { Progress, ProgressLabel, ProgressValue } from "@yami/design-system";

<Progress value={56} locale="${locale}">
  <ProgressLabel>${label}</ProgressLabel>
  <ProgressValue />
</Progress>` },
    { id: "controlled", title: en ? "Controlled" : "受控进度",
      description: en ? "Drag the slider or use its arrow keys to change the value from 0 to 100." : "拖动滑块或使用方向键调整进度，可查看 0 到 100 的状态。",
      preview: <TransferProgress en={en} />, code: controlledCode + `\n<TransferProgress en={${en}} />` },
    { id: "indeterminate", title: en ? "Indeterminate" : "进度未知",
      description: en ? "Pass null while the total is unknown. Reduced-motion mode keeps the indicator still." : "总量未知时传入 null。开启减少动态效果后，指示条保持静止。",
      preview: <Progress value={null} aria-valuetext={preparing}><ProgressLabel>{preparing}</ProgressLabel></Progress>,
      code: `import { Progress, ProgressLabel } from "@yami/design-system";

<Progress value={null} aria-valuetext="${preparing}">
  <ProgressLabel>${preparing}</ProgressLabel>
</Progress>` },
  ];
  return <ComponentGuide name="Progress" slug="progress" locale={locale}
    previous={{ name: "Popover", path: "yami-components-layout-popover" }} next={{ name: "Radio Group", path: "yami-components-forms-radio-group" }}
    intro={en ? "Show how much of a task has finished. Pass a new value as work completes." : "显示任务的完成进度，随实际工作进展更新数值。"}
    composition={"Progress\n├── ProgressLabel\n├── ProgressValue\n└── ProgressTrack → ProgressIndicator"}
    leadExample={{ title: en ? "Upload progress" : "上传进度", code: demoCode + `\n<ProgressDemo en={${en}} />`, preview: <ProgressDemo en={en} /> }}
    usageCode={`import { Progress } from "@yami/design-system";\n\n<Progress value={33} aria-label="${label}" />`}
    examples={examples}
    apiNote={en ? "Progress is read-only. Give it a ProgressLabel or an accessible name. The host supplies the task state." : "Progress 只读。用 ProgressLabel 或 aria-label 提供名称，由宿主传入任务进度。"}
    api={[
      ["value / min / max", en ? "Required value: number or null. The range defaults to 0–100. Values outside it are clamped by Base UI." : "value 必填，支持数值或 null。范围默认 0–100，超出时由 Base UI 限制在范围内。"],
      ["ProgressLabel / ProgressValue", en ? "Optional visible name and formatted value. locale, format and getAriaValueText customize the number and its announcement." : "可选的可见名称与格式化数值。locale、format 和 getAriaValueText 可定制数字与读屏文案。"],
      ["ProgressTrack / ProgressIndicator", en ? "Progress includes the track and fill automatically. Use their data-slot attributes for scoped styles." : "Progress 自动包含轨道与填充条，可通过各自的 data-slot 局部调整样式。"],
    ]} reference={{ label: "shadcn/ui Progress", href: "https://ui.shadcn.com/docs/components/base/progress" }} />;
}
