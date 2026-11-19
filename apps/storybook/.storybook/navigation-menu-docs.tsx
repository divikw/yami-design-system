import { BookOpen } from "lucide-react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@yami/design-system";
import { ShopNavigation } from "../../../packages/design-system/components/NavigationMenu/examples";
import source from "../../../packages/design-system/components/NavigationMenu/examples.tsx?raw";
import { ComponentNavigation } from "./navigation-menu-guides-example";
import guidesSource from "./navigation-menu-guides-example.tsx?raw";
import { ComponentGuide } from "./component-guide";
import type { DocsLocale } from "./component-docs-template";

export function NavigationMenuDocsPage({ locale }: { locale: DocsLocale }) {
  const en = locale === "en";
  const label = en ? "Component guides" : "组件指南";
  const current = en ? "Navigation menu" : "导航菜单";
  const progress = en ? "Progress" : "进度条";
  const href = "/?path=/docs/yami-components-navigation-navigation-menu--docs";
  const nextHref = "/?path=/docs/yami-components-data-display-progress--docs";
  const linkCode = `import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@yami/design-system";
import { BookOpen } from "lucide-react";

<NavigationMenu aria-label="${label}">
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuLink active className={navigationMenuTriggerStyle()} render={<a href="${href}" target="_parent" />}>
        <BookOpen size={16} aria-hidden="true" /> ${current}
      </NavigationMenuLink>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink href="${nextHref}" target="_parent">${progress}</NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`;
  return <ComponentGuide name="NavigationMenu" slug="navigation-menu" locale={locale} previewMode="document"
    intro={en ? "Group related destinations in dropdown panels and keep direct links alongside them." : "将相关链接放入下拉面板，也可以在同一行保留直达链接。"}
    previous={{ name: "Input", path: "yami-components-forms-input" }} next={{ name: "Pagination", path: "yami-components-navigation-pagination" }}
    composition={`NavigationMenu
├── NavigationMenuList
│   ├── NavigationMenuItem
│   │   ├── NavigationMenuTrigger
│   │   ├── NavigationMenuIndicator
│   │   └── NavigationMenuContent → NavigationMenuLink
│   └── NavigationMenuItem → NavigationMenuLink
└── NavigationMenuPositioner`}
    leadExample={{ title: en ? "Shop navigation" : "商城导航", code: source + `\n<ShopNavigation en={${en}} />`, preview: <div style={{ display: "grid", justifyItems: "center" }}><ShopNavigation en={en} /></div> }}
    usageCode={`import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from "@yami/design-system";

<NavigationMenu aria-label="${label}">
  <NavigationMenuList>
    <NavigationMenuItem value="guides">
      <NavigationMenuTrigger>${label}</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="${nextHref}" target="_parent">${progress}</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`}
    examples={[{ id: "grouped-links", title: en ? "Grouped links with icons" : "带图标的分组链接",
      description: en ? "The positioner centers the panel on its trigger. Links use two columns when space permits and one on narrow screens." : "面板通过定位部件与触发器居中对齐。链接在空间足够时排为两列，窄屏下排为一列。",
      code: guidesSource + `\n<ComponentNavigation en={${en}} />`, preview: <div style={{ display: "grid", justifyItems: "center" }}><ComponentNavigation en={en} /></div>,
    }, { id: "link", title: en ? "Link component" : "链接组件",
      description: en ? "Pass an anchor or an anchor-rendering router link to render. Use active for the current page. The decorative icon shares the link’s text label." : "通过 render 接入原生链接或渲染为锚点的路由组件。用 active 标记当前页，图标旁保留链接名称。",
      code: linkCode, preview: <div style={{ display: "grid", justifyItems: "center" }}><NavigationMenu aria-label={label}><NavigationMenuList>
        <NavigationMenuItem><NavigationMenuLink active className={navigationMenuTriggerStyle()} render={<a href={href} target="_parent" />}><BookOpen size={16} aria-hidden="true" /> {current}</NavigationMenuLink></NavigationMenuItem>
        <NavigationMenuItem><NavigationMenuLink href={nextHref} target="_parent">{progress}</NavigationMenuLink></NavigationMenuItem>
      </NavigationMenuList></NavigationMenu></div> }]}
    apiNote={en ? "Open a panel by pressing its trigger or hovering with a mouse. Use the arrow keys to navigate and Escape to dismiss." : "点击、轻触或用鼠标悬停可打开面板。方向键可移动焦点，Escape 关闭面板。"}
    api={[
      ["NavigationMenu", en ? "Name the navigation landmark with aria-label. value / defaultValue select the open item, null closes it. onValueChange reports changes." : "用 aria-label 命名导航。value / defaultValue 指定展开项，null 表示关闭。onValueChange 通知状态变化。"],
      ["side / align / sideOffset / alignOffset", en ? "Defaults are bottom, start, an 8px gap and a 0px alignment offset. The positioner adjusts to viewport edges." : "面板默认位于下方、起始边对齐、间隔 8px、对齐偏移 0px，靠近视口边缘时自动避让。"],
      ["NavigationMenuList / Item", en ? "Group entries and assign each disclosure item a unique value." : "组织导航项，为每个可展开项设置唯一 value。"],
      ["NavigationMenuTrigger / Content", en ? "Pair a disclosure button with its panel. Trigger accepts disabled." : "在同一项内组合触发按钮与面板。触发按钮支持 disabled。"],
      ["NavigationMenuIndicator", en ? "Place inside a disclosure item to mark it while its panel is open." : "放在可展开的导航项内，该项展开时显示三角指示器。"],
      ["NavigationMenuPositioner", en ? "The root includes one positioner. Pass a configured element to the positioner prop to replace it." : "根组件自带定位部件。需要自定义定位时，通过 positioner 属性传入配置好的部件。"],
      ["navigationMenuTriggerStyle()", en ? "Use the trigger appearance on a top-level link via className." : "通过 className 让顶层直达链接使用触发器样式。"],
      ["NavigationMenuLink", en ? "href sets the destination. active marks the current page. Set closeOnClick for same-page links that should dismiss the panel." : "href 指定目标，active 标记当前页。页内链接需要收起面板时设置 closeOnClick。"],
    ]} reference={{ label: "shadcn/ui Navigation Menu", href: "https://ui.shadcn.com/docs/components/base/navigation-menu" }} />;
}
