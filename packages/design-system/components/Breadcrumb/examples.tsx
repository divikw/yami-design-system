import { Breadcrumb, BreadcrumbEllipsis } from "./Breadcrumb";

export function ProductBreadcrumb() {
  return <Breadcrumb locale="zh" items={[
    { label: "美妆护肤", href: "https://www.yami.com/us/zh/c/beauty/2" },
    { label: "面膜", href: "https://www.yami.com/us/zh/c/masks/59" },
    { label: "贴片面膜" },
  ]} />;
}

export function CurrentPageBreadcrumb() {
  return <Breadcrumb size="md" underline={false} items={[
    { label: "Documentation", href: "/en/docs/getting-started" },
    { label: "Explore components and pages", current: true },
  ]} />;
}

export function CollapsedBreadcrumb({ locale = "en" }: { locale?: "en" | "zh" }) {
  const zh = locale === "zh";
  return <Breadcrumb locale={locale} items={[
    { label: zh ? "首页" : "Home", href: `https://www.yami.com/us/${locale}` },
    { label: <BreadcrumbEllipsis aria-label={zh ? "已省略中间层级" : "Omitted levels"} /> },
    { label: zh ? "面膜" : "Masks", href: `https://www.yami.com/us/${locale}/c/masks/59` },
    { label: zh ? "贴片面膜" : "Sheet masks", current: true },
  ]} />;
}
