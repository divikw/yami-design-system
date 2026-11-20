import { useState } from "react";
import {
  NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink,
  Pagination, Tabs, TabsList, TabsTrigger, TabsContent, type TabsActivationMode, type TabsOrientation, type TabsVariant,
} from "@yami/design-system";
import { jsxAttributes, jsxExample, type PropertiesDefinition } from "./component-properties";
import type { DocsLocale } from "./component-docs-template";
import styles from "./component-properties.module.css";

export const navigationMenuProperties: PropertiesDefinition<{ orientation: "horizontal" | "vertical"; align: "start" | "center" | "end" }> = {
  slug: "navigation-menu",
  previewMode: "document",
  initialValues: () => ({ orientation: "horizontal", align: "start" }),
  fields: () => [
    { key: "orientation", kind: "select", options: ["horizontal", "vertical"] },
    { key: "align", kind: "select", options: ["start", "center", "end"] },
  ],
  example: (props, locale) => {
    const zh = locale === "zh";
    const name = zh ? "商城导航" : "Shop navigation";
    const [category, beauty, home] = zh ? ["商品分类", "美妆护肤", "首页"] : ["Departments", "Beauty & skincare", "Home"];
    const base = `https://www.yami.com/us/${locale}`;
    const beautyHref = `${base}/c/beauty/2`;
    const menu = { ...props, "aria-label": name, side: props.orientation === "vertical" ? "right" as const : "bottom" as const };
    return jsxExample("NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink",
      `<NavigationMenu${jsxAttributes(menu)}>
  <NavigationMenuList>
    <NavigationMenuItem value="departments">
      <NavigationMenuTrigger>{${JSON.stringify(category)}}</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="${beautyHref}">{${JSON.stringify(beauty)}}</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem><NavigationMenuLink href="${base}">{${JSON.stringify(home)}}</NavigationMenuLink></NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`,
      <NavigationMenu {...menu}><NavigationMenuList>
        <NavigationMenuItem value="departments"><NavigationMenuTrigger>{category}</NavigationMenuTrigger>
          <NavigationMenuContent><NavigationMenuLink href={beautyHref}>{beauty}</NavigationMenuLink></NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem><NavigationMenuLink href={base}>{home}</NavigationMenuLink></NavigationMenuItem>
      </NavigationMenuList></NavigationMenu>);
  },
};

function PaginationPreview({ initialPage, pageCount, disabled, locale }: { initialPage: number; pageCount: number; disabled: boolean; locale: DocsLocale }) {
  const [page, setPage] = useState(initialPage);
  return <Pagination {...{ page, pageCount, disabled, locale }} onPageChange={setPage} />;
}

export const paginationProperties: PropertiesDefinition<{ page: "1" | "2" | "3"; pageCount: "4" | "8" | "12"; disabled: boolean }> = {
  slug: "pagination",
  initialValues: () => ({ page: "1", pageCount: "8", disabled: false }),
  fields: (_, locale) => [
    { key: "page", kind: "select", type: "number", options: ["1", "2", "3"], description: locale === "zh" ? "设置示例的当前页。也可以在预览中切换。" : "Set the current page or change it in the preview." },
    { key: "pageCount", kind: "select", type: "number", options: ["4", "8", "12"] },
    { key: "disabled", kind: "switch" },
  ],
  example: ({ page, pageCount, disabled }, locale, device) => {
    const props = { pageCount: Number(pageCount), disabled, locale };
    const note = locale === "zh"
      ? "分页仅用于 PC 端，窗口宽度达到 1024 px 时显示。"
      : "Pagination is for desktop only. It appears at window widths of 1024 px and above.";
    const desktopLink = locale === "zh" ? "切换到 PC 查看。" : " Select PC to preview it.";
    return {
      preview: <>
        <p className={styles.mobilePreviewNote}>{note}{device === "Mobile" && desktopLink}</p>
        <PaginationPreview key={page} initialPage={Number(page)} {...props} />
      </>,
      code: `import { useState } from "react";
import { Pagination } from "@yami/design-system";

export function ResultsPagination() {
  const [page, setPage] = useState(${page});
  return <Pagination page={page} onPageChange={setPage}${jsxAttributes(props)} />;
}`,
    };
  },
};

export const tabsProperties: PropertiesDefinition<{ variant: TabsVariant; orientation: TabsOrientation; activationMode: TabsActivationMode; disabled: boolean }> = {
  slug: "tabs",
  initialValues: () => ({ variant: "secondary", orientation: "horizontal", activationMode: "automatic", disabled: false }),
  fields: (_, locale) => [
    { key: "variant", name: "TabsList.variant", kind: "select", options: ["primary", "secondary", "tertiary"] },
    { key: "orientation", kind: "select", options: ["horizontal", "vertical"] },
    { key: "activationMode", kind: "select", options: ["automatic", "manual"] },
    { key: "disabled", name: "TabsTrigger.disabled", kind: "switch", description: locale === "zh" ? "禁用第二个标签。" : "Disable the second tab." },
  ],
  example: ({ variant, orientation, activationMode, disabled }, locale) => {
    const [label, details, shipping, overview, delivery] = locale === "zh"
      ? ["商品信息", "详情", "配送", "查看商品规格。", "查看配送时间。"]
      : ["Product information", "Details", "Shipping", "View product specifications.", "View delivery times."];
    const root = { defaultValue: "details", orientation, activationMode };
    const list = { variant, "aria-label": label };
    return jsxExample("Tabs, TabsList, TabsTrigger, TabsContent",
      `<Tabs${jsxAttributes(root)}>
  <TabsList${jsxAttributes(list)}>
    <TabsTrigger value="details">{${JSON.stringify(details)}}</TabsTrigger>
    <TabsTrigger value="shipping"${disabled ? " disabled" : ""}>{${JSON.stringify(shipping)}}</TabsTrigger>
  </TabsList>
  <TabsContent value="details">{${JSON.stringify(overview)}}</TabsContent>
  <TabsContent value="shipping">{${JSON.stringify(delivery)}}</TabsContent>
</Tabs>`,
      <Tabs key={String(disabled)} {...root}>
        <TabsList {...list}><TabsTrigger value="details">{details}</TabsTrigger><TabsTrigger value="shipping" disabled={disabled}>{shipping}</TabsTrigger></TabsList>
        <TabsContent value="details">{overview}</TabsContent><TabsContent value="shipping">{delivery}</TabsContent>
      </Tabs>);
  },
};
