import { useState } from "react";
import { Button, Toaster, toast, type ToastPosition } from "@yami/design-system";
import { SaveForLater } from "../../../packages/design-system/components/Toast/examples";
import actionSource from "../../../packages/design-system/components/Toast/examples.tsx?raw";
import { ToastTypes } from "./toast-types-example";
import typesSource from "./toast-types-example.tsx?raw";
import { ReceiptExample } from "./toast-promise-example";
import promiseSource from "./toast-promise-example.tsx?raw";
import { ComponentGuide } from "./component-guide";
import type { DocsLocale } from "./component-docs-template";

export function ToastDocsPage({ locale }: { locale: DocsLocale }) {
  const en = locale === "en";
  const closeLabel = en ? "Close notification" : "关闭通知";
  const viewportLabel = en ? "Notifications" : "通知";
  const [position, setPosition] = useState<ToastPosition>();
  const positions = [
    ["top-left", en ? "Top left" : "左上"], ["top-center", en ? "Top center" : "顶部居中"], ["top-right", en ? "Top right" : "右上"],
    ["bottom-left", en ? "Bottom left" : "左下"], ["bottom-center", en ? "Bottom center" : "底部居中"], ["bottom-right", en ? "Bottom right" : "右下"],
  ] as const;
  const positionMessage = en ? "Notification position" : "通知位置";
  const positionLayout = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-100)" };
  const positionPreview = <div style={positionLayout}>
    {positions.map(([value, label]) => <Button key={value} variant="secondary" size="sm" aria-pressed={position === value}
      onClick={() => { setPosition(value); toast.add({ title: positionMessage, description: label }); }}>
      {label}
    </Button>)}
  </div>;
  const positionCode = `import { useState } from "react";
import { Button, Toaster, toast, type ToastPosition } from "@yami/design-system";

const positions = [
${positions.map(([value, label]) => `  ["${value}", "${label}"],`).join("\n")}
] as const;

export function PositionExample() {
  const [position, setPosition] = useState<ToastPosition>();
  return <Toaster position={position} closeLabel="${closeLabel}" viewportLabel="${viewportLabel}">
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-100)" }}>
      {positions.map(([value, label]) => (
        <Button key={value} variant="secondary" size="sm" aria-pressed={position === value}
          onClick={() => {
            setPosition(value);
            toast.add({ title: "${positionMessage}", description: label });
          }}>
          {label}
        </Button>
      ))}
    </div>
  </Toaster>;
}`;
  const savePreview = <div style={{ display: "grid", justifyItems: "center" }}><SaveForLater en={en} /></div>;
  return <Toaster position={position} closeLabel={closeLabel} viewportLabel={viewportLabel}>
    <ComponentGuide name="Toast" slug="toast" locale={locale} previewMode="document"
      previous={{ name: "Textarea", path: "yami-components-forms-textarea" }}
      next={{ name: "Tooltip", path: "yami-components-layout-tooltip" }}
      intro={en ? "Confirm an action briefly while the user continues working." : "用短暂的通知反馈操作结果，用户可以继续当前操作。"}
      composition={"Toaster\n└── ToastProvider → ToastPortal → ToastViewport\n    └── Toast → ToastContent\n        ├── ToastTitle / ToastDescription\n        └── ToastAction / ToastClose"}
      usageCode={`import { Button, Toaster, toast } from "@yami/design-system";

<Toaster closeLabel="${closeLabel}" viewportLabel="${viewportLabel}">
  <Button size="sm" onClick={() => toast.add({ description: "${en ? "Link copied." : "已复制链接。"}" })}>
    ${en ? "Show notification" : "显示通知"}
  </Button>
</Toaster>`}
      leadExample={{ title: en ? "Save an item" : "收藏商品", preview: savePreview,
        code: actionSource + `\n<SaveForLater en={${en}} />` }}
      examples={[
        { id: "types", title: en ? "Types" : "状态类型",
          description: en ? "Try several messages. Hover or focus the stack to expand it and pause its timers." : "连续触发多条通知。悬停或聚焦通知堆叠区可展开列表并暂停计时。",
          preview: <ToastTypes en={en} />, code: typesSource + `\n<ToastTypes en={${en}} />` },
        { id: "position", title: en ? "Position" : "显示位置",
          description: en ? "Choose a position to show a notification there. The whole stack moves with it." : "点击一个位置即可在那里显示通知，已显示的通知也会一起移动。",
          preview: positionPreview, code: positionCode },
        { id: "action", title: en ? "Action" : "操作按钮", description: en ? "Undo restores the original saved state and closes that notification." : "点击撤销会恢复收藏前的状态，并关闭对应通知。",
          preview: savePreview, code: actionSource + `\n<SaveForLater en={${en}} />` },
        { id: "promise", title: en ? "Promise" : "异步任务", description: en ? "One notification follows a simulated request from loading to success or failure." : "一条通知随模拟请求从加载中更新为成功或失败。",
          preview: <ReceiptExample en={en} />, code: promiseSource + `\n<ReceiptExample en={${en}} />` },
      ]}
      apiNote={en ? "Mount Toaster once. F6 focuses the notification region. Keep instructions that users need later in an inline Alert." : "在应用入口挂载一次 Toaster，按 F6 可进入通知区。需要持续查看的信息请放在页面内的 Alert。"}
      api={[
        ["Toaster", en ? "timeout defaults to 5000ms, limit to 3. Pass 0 for a persistent notification. closeLabel and viewportLabel localize controls." : "timeout 默认 5000ms，limit 默认 3。timeout 为 0 时持续显示。closeLabel 和 viewportLabel 用于本地化。"],
        ["Toaster.position", en ? "top-left, top-center, top-right, bottom-left, bottom-center or bottom-right. When omitted, the stack is bottom-right from 1024px and bottom-center below." : "支持 top-left、top-center、top-right、bottom-left、bottom-center、bottom-right。省略时，宽度达到 1024px 默认在右下角，更窄的屏幕默认在底部居中。"],
        ["toast.add / update / close", en ? "add returns an ID. Use it to update or dismiss one notification. priority can be low or high." : "add 返回通知 ID，可用它更新或关闭单条通知。priority 可选 low 或 high。"],
        ["toast.promise", en ? "Accepts a promise and loading, success and error messages." : "接收 Promise 和 loading、success、error 三种反馈文案。"],
        ["createToastManager / useToastManager", en ? "Create an isolated manager for Toaster, or read the nearest provider from a child." : "创建独立管理器并传给 Toaster，或在子组件中读取最近的 Provider。"],
      ]} reference={{ label: "shadcn/ui Toast", href: "https://ui.shadcn.com/docs/components/base/toast" }} />
  </Toaster>;
}
