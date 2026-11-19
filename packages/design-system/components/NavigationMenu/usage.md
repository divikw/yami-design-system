<!-- locale:zh -->
# NavigationMenu — 导航菜单

用于站点或栏目导航。NavigationMenuList 中的每个 NavigationMenuItem 可包含一个直达链接，或配对的 NavigationMenuTrigger 和 NavigationMenuContent。链接使用真实 href；宿主可通过 render 接入会渲染锚点的路由组件。active 标记当前页，closeOnClick 适用于需要收起的页内跳转。

用 aria-label 命名导航。给展开项提供唯一 value；根组件的 value / defaultValue 对应展开项，null 表示收起。通过 onValueChange 处理受控更新。键盘用 Tab 进入、方向键移动、Escape 关闭；触屏轻触打开。面板通过 Portal 渲染，side 和 align 控制首选方向和对齐方式，sideOffset 和 alignOffset 分别控制与触发器的间距和沿对齐轴的偏移。需要定制定位时，可在根组件的 positioner 属性传入 NavigationMenuPositioner。将 NavigationMenuIndicator 放在可展开的导航项内，可标记当前展开项。顶层直达链接可通过 className 使用 navigationMenuTriggerStyle()。

<!-- locale:en -->
# NavigationMenu — Site navigation

Place direct links and disclosure groups in NavigationMenuList. Each NavigationMenuItem contains either a NavigationMenuLink or a NavigationMenuTrigger paired with NavigationMenuContent. Use real destinations. The render prop accepts a router link that renders an anchor. Use active for the current page and closeOnClick to dismiss after same-page navigation.

Name the navigation landmark. Assign each disclosure a unique item value. Root value or defaultValue selects the open item; null closes it. For controlled use, update value in onValueChange. Tab into the list, use arrows to navigate, and press Escape to dismiss. Touch users can tap triggers. The portalled panel supports side, align, sideOffset and alignOffset. To customize positioning, pass a NavigationMenuPositioner to the root’s positioner prop. Place NavigationMenuIndicator inside a disclosure item to mark it when open. Use navigationMenuTriggerStyle() as the className for a top-level link.
