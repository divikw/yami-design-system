<!-- locale:zh -->
# Toast — 轻提示

将一个 Toaster 挂在应用入口，再由事件处理函数调用 toast.add。支持普通、成功、信息、提醒、错误和加载状态。使用 actionProps 提供撤销等操作，使用 toast.promise 将同一通知从加载更新为成功或失败。需持续参考的信息使用 Alert。

```tsx
import { Button, Toaster, toast } from "@yami/design-system";

<Toaster closeLabel="关闭通知" viewportLabel="通知">
  <Button size="sm" onClick={() => toast.add({ description: "已复制链接。" })}>显示通知</Button>
</Toaster>
```

默认显示 5 秒，最多同时展示 3 条。timeout 为 0 时由用户或宿主关闭。低优先级温和播报，紧急消息可指定 priority="high"。按 F6 聚焦通知区，键盘可执行操作或关闭，触屏支持滑动关闭。默认位置在 1024px 及以上为右下角，更窄的屏幕为底部居中。

通过 `<Toaster position="top-center">` 指定整组通知的位置。可选 `top-left`、`top-center`、`top-right`、`bottom-left`、`bottom-center`、`bottom-right`。顶部通知向下展开，底部通知向上展开，两者都避开相应的安全区。

<!-- locale:en -->
# Toast — Transient notifications

Mount one Toaster at the application root, then call toast.add from an event handler. Built-in types include success, info, warning, error and loading. Add an undo button with actionProps. Use toast.promise to update one notification as a task progresses. Put persistent instructions in an Alert.

```tsx
import { Button, Toaster, toast } from "@yami/design-system";

<Toaster closeLabel="Close notification" viewportLabel="Notifications">
  <Button size="sm" onClick={() => toast.add({ description: "Link copied." })}>Show notification</Button>
</Toaster>
```

Timeout defaults to five seconds and the visible limit to three. Set timeout to zero for manual dismissal. Notifications are announced politely by default. Use high priority for urgent failures. F6 focuses the notification region. Buttons support keyboard input and touch users can swipe to dismiss. The default position is bottom-right at 1024px and above, and bottom-center on narrower screens.

Set `<Toaster position="top-center">` to place the whole stack. Choose `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center` or `bottom-right`. The stack expands away from its edge and respects the corresponding safe area.
