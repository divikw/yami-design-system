export interface PrototypeProject {
  id: string;
  name: string;
  description: string;
  variants: { id: string; name: string; categoryMenu: "text" | "images"; description: string }[];
  pages: { value: string; label: string }[];
}

// Versioned with the pages: shared links never depend on an author's local drafts.
export const prototypeProjects: PrototypeProject[] = [{
  id: "global-navigation",
  name: "全局导航",
  description: "导航流程演示 · 使用示例商品，不产生真实订单",
  variants: [
    { id: "current", name: "当前版 · 文字分类", categoryMenu: "text", description: "现有文字分类导航，作为比较基准。" },
    { id: "image-categories", name: "方案 A · 图片分类", categoryMenu: "images", description: "沿用现有图片分类导航，验证跨页方案一致性。" },
  ],
  pages: [
    { value: "/", label: "Ecommerce Home" },
    { value: "/categories/beauty", label: "分类商品" },
    { value: "/search/matcha", label: "搜索结果" },
    { value: "/products/demo-product", label: "商品详情" },
    { value: "/cart", label: "购物车" },
    { value: "/brands/anua", label: "Anua Topic Landing" },
  ],
}];

export function prototypeHref(params: URLSearchParams, path: string, variant?: string) {
  const query = new URLSearchParams();
  for (const key of ["project", "variant", "locale", "theme", "viewport"]) {
    const value = params.get(key);
    if (value) query.set(key, value);
  }
  query.set("project", params.get("project") ?? prototypeProjects[0].id);
  query.set("variant", variant ?? params.get("variant") ?? "current");
  query.set("path", path);
  return `/prototype?${query}`;
}

export function prototypePageLabel(path: string, project: PrototypeProject) {
  return project.pages.find((page) => page.value === path)?.label
    ?? (path.startsWith("/products/") ? "商品详情" : path.startsWith("/search/") ? "搜索结果" : path.startsWith("/categories/") ? "分类商品" : path);
}
