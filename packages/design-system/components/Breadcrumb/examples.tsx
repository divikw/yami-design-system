import { Breadcrumb } from "./Breadcrumb";

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
