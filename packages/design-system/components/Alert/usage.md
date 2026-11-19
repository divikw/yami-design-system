<!-- locale:zh -->
# Alert — 页面内提示

将提示放在受影响的内容旁，直到用户处理或页面状态发生变化。使用默认样式说明状态，错误使用 destructive。标题、说明、图标和操作均可选。紧急动态消息使用默认的 alert 语义，普通更新可以通过 role="status" 温和播报。使用带文字的操作按钮，由宿主执行修正并更新提示。

```tsx
import { Alert, AlertTitle, AlertDescription } from "@yami/design-system";

<Alert variant="destructive">
  <AlertTitle>付款失败</AlertTitle>
  <AlertDescription>请核对付款方式后重试。</AlertDescription>
</Alert>
```

<!-- locale:en -->
# Alert — Inline feedback

Keep the message beside the affected content until the issue is resolved. Use the default appearance for information and destructive for errors. Add an optional icon, title, description or action. The root defaults to role="alert". Use role="status" for polite updates. The host owns the action and resulting state.

```tsx
import { Alert, AlertTitle, AlertDescription } from "@yami/design-system";

<Alert variant="destructive">
  <AlertTitle>Payment failed</AlertTitle>
  <AlertDescription>Check your payment method and try again.</AlertDescription>
</Alert>
```
