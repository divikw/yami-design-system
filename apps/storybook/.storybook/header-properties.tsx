import { Header, type HeaderProps } from "@yami/design-system/components/Header";
import { headerStorefront } from "../../../packages/design-system/components/Header/fixtures";
import { jsxExample, type PropertiesDefinition } from "./component-properties";
import type { DocsLocale } from "./component-docs-template";
import styles from "./header-example.module.css";

type HeaderValues = {
  appLayout: "default" | "pdp";
  h5Layout: "h5-home" | "pdp";
  zipcode: string;
  searchPlaceholder: string;
  accountState: "signed-out" | "signed-in";
  categoryMenu: boolean;
};

export function headerExample(locale: DocsLocale, values: HeaderValues, device?: "PC" | "Mobile" | "App" | "H5") {
  const zh = locale === "zh";
  const site = headerStorefront[locale];
  const logo = `./assets/logos/yami-ui-${zh ? "cn" : "en"}-pc-fill`;
  const mobileLogo = "./assets/logos/yami-ui-en-mobile-fill";
  const categories = site.categories.map(({ slug, ...category }) => {
    const image = slug ? { src: `./assets/header-categories/${slug}.png`, alt: category.label } : undefined;
    return { ...category, image };
  });
  const props: HeaderProps = {
    logo: { src: `${logo}.svg`, alt: site.logoAlt },
    darkLogo: { src: `${logo}-inverse.svg`, alt: site.logoAlt },
    mobileLogo: { src: `${mobileLogo}.svg`, alt: "YAMI" },
    darkMobileLogo: { src: `${mobileLogo}-inverse.svg`, alt: "YAMI" },
    categories,
    zipcode: { code: values.zipcode, label: site.zipcode.label },
    locale: { label: site.localeCode, flag: { src: "./assets/icons/area/united-states-flag.svg", alt: site.flagAlt } },
    account: { label: values.accountState === "signed-in" ? (zh ? "我的账户" : "My account") : site.account },
    cart: { label: site.cart },
    searchPlaceholder: values.searchPlaceholder,
    searchLabel: site.searchLabel,
    categoriesLabel: site.categoriesLabel,
    nextCategoriesLabel: site.nextCategoriesLabel,
    previousCategoriesLabel: site.previousCategoriesLabel,
    scanLabel: site.scanLabel,
    ...(site.halls && { halls: [...site.halls], hallsLabel: site.hallsLabel }),
  };
  if (device === "App") {
    props.mobileVariant = values.appLayout;
    props.mobileSearchHref = `./iframe.html?id=yami-pages-search--mobile-discovery&viewMode=story&globals=locale%3A${locale}`;
  }
  if (device === "H5") props.mobileVariant = values.h5Layout;
  if (device !== "H5") props.inbox = { label: site.inbox };
  if (values.categoryMenu && (!device || device === "PC")) {
    props.categoryMenu = {
      triggerId: "categories",
      label: site.categoriesLabel,
      closeLabel: zh ? "关闭分类" : "Close categories",
      items: categories.filter(({ id }) => id !== "categories").map(({ id, label, menuItemId }) => ({
        id: menuItemId ?? id,
        label,
        children: [{ id: `${id}-all`, label: zh ? `全部${label}` : `All ${label.toLowerCase()}`, href: `#${id}` }],
      })),
    };
  }
  const attributes = Object.entries(props).map(([name, value]) =>
    `  ${name}={${JSON.stringify(value, null, 2).replaceAll("\n", "\n  ")}}`,
  );
  const preview = <Header {...props} />;
  return jsxExample("Header", `<Header\n${attributes.join("\n")}\n/>`,
    props.categoryMenu ? <div className={styles.menuPreview}>{preview}</div> : preview);
}

export const headerProperties: PropertiesDefinition<HeaderValues> = {
  slug: "header",
  fullWidth: true,
  initialValues(locale) {
    const site = headerStorefront[locale];
    return {
      appLayout: "default",
      h5Layout: "h5-home",
      zipcode: site.zipcode.code,
      searchPlaceholder: site.searchPlaceholder,
      accountState: "signed-out",
      categoryMenu: false,
    };
  },
  fields(values, locale, device) {
    const zh = locale === "zh";
    const pdp = (device === "App" && values.appLayout === "pdp") || (device === "H5" && values.h5Layout === "pdp");
    return [
      ...(device === "App" ? [{
        key: "appLayout", name: "mobileVariant", label: zh ? "App 版式" : "App layout", kind: "select",
        options: ["default", "pdp"], description: zh ? "切换 App 首页和商品详情页页头。" : "Switch between App Home and Product Detail.",
      } as const] : []),
      ...(device === "H5" ? [{
        key: "h5Layout", name: "mobileVariant", label: zh ? "H5 版式" : "H5 layout", kind: "select",
        options: ["h5-home", "pdp"], description: zh ? "切换 H5 首页和商品详情页页头。" : "Switch between H5 Home and Product Detail.",
      } as const] : []),
      { key: "zipcode", name: "zipcode.code", label: zh ? "配送邮编" : "Delivery ZIP code", kind: "text", description: zh ? "配送入口显示的邮编。" : "Postal code shown in the delivery entry." },
      ...(!pdp ? [{
        key: "searchPlaceholder", label: zh ? "搜索提示" : "Search placeholder", kind: "text",
        description: zh ? "搜索框提示，或 App 搜索入口的显示文案。" : "Hint shown in the search field or the App search entry.",
      } as const] : []),
      ...(device === "PC" ? [
        {
          key: "accountState", name: "account", label: zh ? "登录状态" : "Account state", kind: "select", type: "HeaderAccount",
          options: ["signed-out", "signed-in"],
          optionLabels: { "signed-out": zh ? "未登录" : "Signed out", "signed-in": zh ? "已登录" : "Signed in" },
          description: zh ? "切换 PC 页头的登录状态预览。" : "Preview the PC header in either sign-in state.",
        },
        { key: "categoryMenu", label: zh ? "分类菜单" : "Category menu", kind: "switch", type: "HeaderCategoryMenuData", description: zh ? "传入分类数据，让分类入口展开菜单。" : "Provide category data to turn the Categories entry into a disclosure." },
      ] as const : []),
    ];
  },
  example(values, locale, device) {
    return headerExample(locale, values, device);
  },
};
