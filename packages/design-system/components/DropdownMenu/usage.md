<!-- locale:zh -->
# DropdownMenu — 操作菜单

在商品、账户或清单旁提供一组操作。用 DropdownMenuTrigger 的 render 组合一个 YAMI Button，DropdownMenuContent 默认在触发器下方起始边对齐。面板圆角为 8px，内边距和菜单项圆角均为 4px。触屏菜单项至少高 44px。

```tsx
"use client";
import { useState } from "react";
import { Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@yami/design-system";

export function ViewOptions() {
  const [showPurchased, setShowPurchased] = useState(true);
  return <DropdownMenu>
    <DropdownMenuTrigger render={<Button variant="secondary" size="sm" />}>显示选项</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuCheckboxItem checked={showPurchased} onCheckedChange={setShowPurchased}>
        显示已购商品
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}
```

用 Item 执行动作，CheckboxItem 切换独立设置，RadioGroup 和 RadioItem 管理互斥选项。Sub、SubTrigger、SubContent 可逐层组合子菜单。面板默认通过 Portal 渲染，传入 container 可指定挂载节点。需要关闭后保留设置时，在宿主保存选中值。危险操作使用 destructive 样式，由宿主处理确认或撤销。Shortcut 展示按键提示，实际快捷键由宿主绑定。方向键移动焦点，Escape 返回上一级，关闭主菜单后焦点回到触发器。

<!-- locale:en -->
# DropdownMenu — Action menu

Offer actions for an item, account or list. Compose a YAMI Button with the trigger's render prop. The popup aligns to the start edge below the trigger, with an 8px radius, 4px panel padding, and 4px item radii. Items are at least 44px tall on touch devices.

```tsx
"use client";
import { useState } from "react";
import { Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@yami/design-system";

export function ViewOptions() {
  const [showPurchased, setShowPurchased] = useState(true);
  return <DropdownMenu>
    <DropdownMenuTrigger render={<Button variant="secondary" size="sm" />}>View options</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuCheckboxItem checked={showPurchased} onCheckedChange={setShowPurchased}>
        Show purchased items
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}
```

Use Item for commands, CheckboxItem for independent settings and RadioGroup with RadioItem for exclusive choices. Nest SubTrigger and SubContent inside Sub for secondary actions, including further submenus. Panels create a portal automatically. Pass container to choose where the panel mounts. Store selected values in the host when settings should survive closing the menu. Use the destructive variant for removal and handle confirmation or undo in the host. Shortcut displays a hint for a host-owned command. Arrow keys move focus and Escape closes one level and restores focus to its trigger.
