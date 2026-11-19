import type { ComponentType } from "react";
import { ShoppingListMenu } from "../../../packages/design-system/components/DropdownMenu/examples";
import shoppingSource from "../../../packages/design-system/components/DropdownMenu/examples.tsx?raw";
import { AccountSwitcher } from "./dropdown-menu-examples/account";
import accountSource from "./dropdown-menu-examples/account.tsx?raw";
import { ListPreferences } from "./dropdown-menu-examples/list-preferences";
import preferencesSource from "./dropdown-menu-examples/list-preferences.tsx?raw";
import { ListActions } from "./dropdown-menu-examples/list-actions";
import listSource from "./dropdown-menu-examples/list-actions.tsx?raw";
import { MoveList } from "./dropdown-menu-examples/move-list";
import moveSource from "./dropdown-menu-examples/move-list.tsx?raw";
import { Notifications } from "./dropdown-menu-examples/notifications";
import notificationsSource from "./dropdown-menu-examples/notifications.tsx?raw";
import { SortOrder } from "./dropdown-menu-examples/sort-order";
import sortSource from "./dropdown-menu-examples/sort-order.tsx?raw";
import { RemoveItem } from "./dropdown-menu-examples/remove";
import removeSource from "./dropdown-menu-examples/remove.tsx?raw";
import { PinShortcut } from "./dropdown-menu-examples/shortcut";
import shortcutSource from "./dropdown-menu-examples/shortcut.tsx?raw";
import type { DocsLocale } from "./component-docs-template";
import { ComponentGuide } from "./component-guide";

function demo<P extends object>(name: string, Component: ComponentType<P>, source: string, props: P) {
  const attributes = Object.entries(props).map(([key, value]) => typeof value === "string"
    ? `${key}=${JSON.stringify(value)}` : `${key}={${value}}`).join(" ");
  return {
    preview: <div style={{ display: "grid", justifyItems: "center" }}><Component {...props} /></div>,
    code: `${source.trim()}\n\n<${name} ${attributes} />`,
  };
}

export function DropdownMenuDocsPage({ locale }: { locale: DocsLocale }) {
  const en = locale === "en";
  const t = (english: string, chinese: string) => en ? english : chinese;
  const trigger = t("List actions", "清单操作");
  const pin = t("Pin list", "置顶清单");
  const unpin = t("Unpin list", "取消置顶");
  const list = { trigger, group: t("Shopping list", "购物清单"), pin, unpin, unavailable: t("Print (unavailable)", "打印（暂不可用）") };
  const notifications = { trigger: t("Notifications", "通知方式"), email: t("Email", "电子邮件"), push: t("Push notifications", "推送通知"), sms: t("SMS (unavailable)", "短信（暂不可用）") };
  const sort = { trigger: t("Sort by", "排序方式"), recent: t("Recently added", "最近添加"), name: t("Product name", "商品名称") };
  const lead = demo("ShoppingListMenu", ShoppingListMenu, shoppingSource, { en });
  const basic = demo("ListActions", ListActions, listSource, list);
  return <ComponentGuide name="DropdownMenu" slug="dropdown-menu" locale={locale} previewMode="document"
    previous={{ name: "Drawer", path: "yami-components-layout-drawer" }} next={{ name: "EmptyState", path: "yami-components-data-display-emptystate" }}
    intro={t("Open a menu of actions and settings for the current item.", "用一个按钮展开当前对象的操作和设置。")}
    composition={"DropdownMenu\n├── DropdownMenuTrigger\n└── DropdownMenuContent\n    ├── DropdownMenuGroup → DropdownMenuLabel / DropdownMenuItem\n    ├── DropdownMenuSeparator\n    ├── DropdownMenuCheckboxItem\n    ├── DropdownMenuRadioGroup → DropdownMenuRadioItem\n    └── DropdownMenuSub → DropdownMenuSubTrigger / DropdownMenuSubContent"}
    leadExample={lead}
    usageCode={`"use client";
import { useState } from "react";
import { Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@yami/design-system";

export function ViewOptions() {
  const [showPurchased, setShowPurchased] = useState(true);
  return <DropdownMenu>
    <DropdownMenuTrigger render={<Button variant="secondary" size="sm" />}>${t("View options", "显示选项")}</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuCheckboxItem checked={showPurchased} onCheckedChange={setShowPurchased}>
        ${t("Show purchased items", "显示已购商品")}
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}`}
    examples={[
      { id: "basic", title: t("Basic", "基础菜单"), description: t("Use a group label and separator to organize actions. Reopen the menu to see the updated pin action.", "用组标题和分隔线组织操作。置顶后重新打开菜单，可取消置顶。"), ...basic },
      { id: "submenu", title: t("Submenu", "子菜单"), description: t("Choose a folder from the nested menu. Right Arrow opens the submenu and Left Arrow returns to its trigger.", "在子菜单内选择目标文件夹。右方向键打开子菜单，左方向键返回上一级。"),
        ...demo("MoveList", MoveList, moveSource, { move: t("Move to", "移动到"), personal: t("Personal folder", "个人文件夹"), shared: t("Shared folder", "共享文件夹") }) },
      { id: "shortcuts", title: t("Shortcuts", "键盘快捷键"), description: t("While this menu is open, Shift + P toggles the pin. The host handles the shortcut.", "菜单打开时按 Shift + P 切换置顶状态。快捷键由宿主绑定。"),
        ...demo("PinShortcut", PinShortcut, shortcutSource, { trigger, pin, unpin }) },
      { id: "icons", title: t("Icons", "图标菜单项"), description: t("Pair the action icon with a visible label.", "图标与操作名称一起显示。"), ...demo("ListActions", ListActions, listSource, { ...list, icons: true }) },
      { id: "checkboxes", title: t("Checkboxes", "复选菜单项"), description: t("Select email or push independently. SMS is unavailable.", "可独立开关邮件和推送通知，短信选项为禁用状态。"), ...demo("Notifications", Notifications, notificationsSource, notifications) },
      { id: "checkboxes-icons", title: t("Checkboxes with icons", "带图标的复选项"), description: t("The checkmark shows which channels are enabled.", "勾选标记显示已开启的通知方式。"), ...demo("Notifications", Notifications, notificationsSource, { ...notifications, icons: true }) },
      { id: "radio-group", title: t("Radio group", "单选菜单组"), description: t("Choose one sort order.", "从组内选择一种排序方式。"), ...demo("SortOrder", SortOrder, sortSource, sort) },
      { id: "radio-icons", title: t("Radio items with icons", "带图标的单选项"), description: t("Icons identify the choices and a checkmark shows the current selection.", "用图标区分选项，勾选标记表示当前选择。"), ...demo("SortOrder", SortOrder, sortSource, { ...sort, icons: true }) },
      { id: "destructive", title: t("Destructive action", "危险操作"), description: t("Remove the sample item, then use Undo to restore it.", "移除示例商品后，可以点击撤销恢复。"),
        ...demo("RemoveItem", RemoveItem, removeSource, { trigger: t("Item actions", "商品操作"), remove: t("Remove item", "移除商品"), undo: t("Undo removal", "撤销移除") }) },
      { id: "avatar", title: t("Avatar", "头像触发器"), description: t("Open the account switcher from a named avatar button.", "通过带可访问名称的头像按钮切换账户。"),
        ...demo("AccountSwitcher", AccountSwitcher, accountSource, { label: t("Switch account", "切换账户"), personal: t("Personal account", "个人账户"), family: t("Family account", "家庭账户") }) },
      { id: "complex", title: t("Complex menu", "组合菜单"), description: t("Open Preferences to change sorting, then open Notifications to set delivery channels. Unsubscribe turns off both channels.", "打开偏好设置可更改排序，再进入通知方式可选择渠道。取消全部订阅会关闭两种通知。"),
        ...demo("ListPreferences", ListPreferences, preferencesSource, {
          menu: t("List settings", "清单设置"), purchased: t("Show purchased items", "显示已购商品"), settings: t("Preferences", "偏好设置"),
          order: sort.trigger, recent: sort.recent, name: sort.name, notifications: notifications.trigger,
          email: notifications.email, push: notifications.push, unsubscribe: t("Unsubscribe from all", "取消全部订阅"),
        }) },
    ]}
    apiNote={t("Open with Enter, Space or Arrow Down. Use the arrow keys to move and Escape to return focus to the trigger.", "使用 Enter、空格或下方向键打开菜单，用方向键移动，按 Escape 逐层关闭并返回触发器。")}
    api={[
      ["DropdownMenu", t("open / defaultOpen / onOpenChange control visibility. modal defaults to true.", "open / defaultOpen / onOpenChange 控制开关。modal 默认为 true。")],
      ["DropdownMenuTrigger.render", t("Compose a single accessible button.", "组合为一个带可访问名称的按钮。")],
      ["DropdownMenuContent / DropdownMenuSubContent", t("Portalled panels accept side, align, sideOffset, alignOffset, collisionPadding, container and keepMounted. The main menu opens below, submenus to the right when space permits.", "面板通过 Portal 渲染，支持 side、align、sideOffset、alignOffset、collisionPadding、container 和 keepMounted。空间充足时主菜单向下、子菜单向右打开。")],
      ["DropdownMenuPortal", t("Content and SubContent create a portal by default. Pass container to the content to choose its mount point. An explicit portal can also wrap subcontent.", "Content 和 SubContent 默认创建 Portal。可用面板的 container 指定挂载节点，也可显式用 Portal 包裹子面板。")],
      ["DropdownMenuGroup / DropdownMenuLabel / DropdownMenuSeparator", t("Group related items, name the group and separate sections. Use inset on a label to align it with icon-item text.", "组合相关菜单项并提供标题与分隔线。组标题可用 inset 与带图标菜单项的文字对齐。")],
      ["DropdownMenuItem", t("onClick, disabled, closeOnClick, inset and variant (default or destructive).", "支持 onClick、disabled、closeOnClick、inset 和 variant（default 或 destructive）。")],
      ["DropdownMenuCheckboxItem", t("checked / defaultChecked / onCheckedChange. Stays open on selection by default.", "通过 checked / defaultChecked / onCheckedChange 管理勾选状态，默认选择后保持打开。")],
      ["DropdownMenuRadioGroup / DropdownMenuRadioItem", t("Use value, defaultValue and onValueChange on the group. Give every item a distinct value.", "组上使用 value、defaultValue、onValueChange，每个菜单项提供独立的 value。")],
      ["DropdownMenuSub / DropdownMenuSubTrigger", t("Nest the trigger and subcontent inside the submenu root.", "在子菜单根节点内组合触发器与子面板。")],
      ["DropdownMenuShortcut", t("Displays shortcut text. Set aria-keyshortcuts and bind the command on the host.", "显示快捷键文案。宿主负责设置 aria-keyshortcuts 和绑定按键。")],
    ]} reference={{ label: "shadcn/ui Dropdown Menu", href: "https://ui.shadcn.com/docs/components/base/dropdown-menu" }} />;
}
