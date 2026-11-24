import { ComponentGuide } from "./component-guide";
import type { DocsLocale } from "./component-docs-template";
import { tabBarExample, tabBarProperties } from "./tab-bar-properties";

export function TabBarDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const defaults = tabBarProperties.initialValues(locale);
  const lead = tabBarExample(locale, defaults);
  return <ComponentGuide name="Tab Bar" slug="tabbar" locale={locale}
    previous={{ name: "Footer", path: "yami-components-navigation-footer" }}
    intro={zh ? "App 和 H5 的底部导航，用于访问主要目的地。" : "Bottom navigation for primary destinations in App and H5."}
    leadExample={lead}
    usageNote={zh
      ? "传入导航项目和当前目的地。用 href 连接路由，或用 onClick 将选择交给宿主处理。示例的 icons 由调用方提供。"
      : "Provide the destinations and the current value. Use href for routes or onClick to handle selection in the host. Supply your own icons to the example."}
    usageCode={lead.code}
    composition={zh ? [
      ["导航容器", "带可访问名称的导航区域，底部包含设备安全区。"],
      ["导航项目", "由 24px 装饰图标和简短标签组成，当前项以强调色显示。"],
      ["数量角标", "显示在图标右上角，例如购物车商品数量。"],
    ] : [
      ["Navigation region", "A named landmark that accounts for the bottom safe area."],
      ["Destination", "A 24px decorative icon and a short label. The current destination uses the emphasis color."],
      ["Count badge", "Shows a quantity over the icon, such as the cart item count."],
    ]}
    practices={zh ? [
      ["do", "使用 3–5 个主要目的地。需要固定在底部时，由页面定位并预留内容空间。"],
      ["avoid", "在导航栏里加入系统 Home Indicator。"],
    ] : [
      ["do", "Use 3–5 primary destinations. When fixing the bar to the bottom, position it and reserve space in the host page."],
      ["avoid", "Adding the system home indicator to the navigation bar."],
    ]}
    examples={[{
      id: "count-overflow",
      title: zh ? "数量超过 99" : "Counts above 99",
      description: zh ? "购物车数量为 123 时，角标显示 99+，读屏保留完整数量。" : "A count of 123 displays as 99+ while the accessible name retains the full count.",
      ...tabBarExample(locale, { ...defaults, cartCount: "123" }),
    }]}
    legacyAnchors={{ usage: ["tabbar--usage", "tabbar--使用说明"], examples: ["component-playground", "component-specifications"] }}
    apiNote={zh ? "TabBarProps 也接受原生 nav 属性和 ref。" : "TabBarProps also accepts native nav attributes and a ref."}
    api={[
      ["items", zh ? "必填。每项包含唯一 value、label、icon，以及 href 或 onClick。" : "Required. Each item provides a unique value, label, icon, and either href or onClick."],
      ["value", zh ? "必填。由宿主控制的当前目的地。" : "Required. The current destination, controlled by the host."],
      ["aria-label", zh ? "必填。导航区域的可访问名称。" : "Required. Accessible name of the navigation region."],
      ["items[].badgeCount", zh ? "可选。省略时隐藏，传入 0 时显示 0。" : "Optional. Omit to hide the badge. A count of 0 stays visible."],
    ]}
    accessibility={zh ? [
      "当前项目使用 aria-current=\"page\"。导航区和每个目的地都应有清晰的名称。",
      "用 Tab 访问各目的地。链接支持 Enter，按钮支持 Enter 和空格。",
    ] : [
      "The current destination uses aria-current=\"page\". Name the navigation region and each destination.",
      "Use Tab to reach each destination. Enter activates links. Enter or Space activates buttons.",
    ]} />;
}
