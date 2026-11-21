import { useState } from "react";
import { TabBar } from "@yami/design-system/components/TabBar";
import { selectableTabBarItems, tabBarExampleItems } from "../../../packages/design-system/components/TabBar/examples";
import type { DocsLocale } from "./component-docs-template";
import type { PropertiesDefinition } from "./component-properties";

type TabBarValues = {
  value: string;
  cartCount: "hidden" | "0" | "6" | "123";
};

function TabBarPreview({ value, locale, label, badgeCount, onSelect }: {
  value: string;
  locale: DocsLocale;
  label: string;
  badgeCount?: number;
  onSelect?: (value: string) => void;
}) {
  const [selection, setSelection] = useState(value);
  const items = selectableTabBarItems(locale, onSelect ?? setSelection).map(item =>
    item.value === "cart" ? { ...item, badgeCount } : item,
  );
  return <TabBar lang={locale} aria-label={label} value={onSelect ? value : selection} items={items}
    style={{ width: "100%", maxWidth: 375 }} />;
}

export function tabBarExample(locale: DocsLocale, values: TabBarValues, platform: "App" | "H5" = "App", onSelect?: (value: string) => void) {
  const label = locale === "zh" ? `${platform} 导航` : `${platform} navigation`;
  const badgeCount = values.cartCount === "hidden" ? undefined : Number(values.cartCount);
  const items = tabBarExampleItems(locale).map(item => {
    const badge = item.value === "cart" && badgeCount !== undefined ? `, badgeCount: ${badgeCount}` : "";
    return `    { value: "${item.value}", label: ${JSON.stringify(item.label)}, icon: icons.${item.value}${badge}, onClick: () => setValue("${item.value}") },`;
  });
  const code = `import { useState, type ReactNode } from "react";
import { TabBar } from "@yami/design-system";

export function StoreNavigation({ icons }: { icons: Record<string, ReactNode> }) {
  const [value, setValue] = useState("${values.value}");
  const items = [
${items.join("\n")}
  ];
  return <TabBar lang="${locale}" aria-label="${label}" value={value} items={items} />;
}`;
  return { code, preview: <TabBarPreview locale={locale} label={label} value={values.value} badgeCount={badgeCount} onSelect={onSelect} /> };
}

export const tabBarProperties: PropertiesDefinition<TabBarValues> = {
  slug: "tabbar",
  fullWidth: true,
  initialValues: () => ({ value: "cart", cartCount: "6" }),
  fields(_values, locale) {
    const zh = locale === "zh";
    const items = tabBarExampleItems(locale);
    return [
      {
        key: "value", label: zh ? "当前目的地" : "Current destination", kind: "select", type: "string",
        options: items.map(item => item.value), optionLabels: Object.fromEntries(items.map(item => [item.value, item.label])),
        description: zh ? "设置预览中的当前导航项。" : "Set the current destination in the preview.",
        group: { key: "required", title: zh ? "必填属性" : "Required" },
      },
      {
        key: "cartCount", name: "items[].badgeCount", label: zh ? "购物车角标" : "Cart badge", kind: "select", type: "number",
        options: ["hidden", "0", "6", "123"], optionLabels: { hidden: zh ? "隐藏" : "Hidden", "0": "0", "6": "6", "123": "99+ (123)" },
        description: zh ? "设置购物车项目的数量。超过 99 时显示 99+。" : "Set the cart item count. Values above 99 display as 99+.",
      },
    ];
  },
  example(values, locale, device, update) {
    return tabBarExample(locale, values, device === "H5" ? "H5" : "App", update && (value => update({ value })));
  },
};
