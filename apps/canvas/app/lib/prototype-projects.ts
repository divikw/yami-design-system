export interface PrototypeProject {
  id: string;
  name: string;
  description: string;
  variants: {
    id: string;
    name: string;
    categoryMenu: "text" | "images";
    description: string;
    homeHeader?: "v1" | "v2";
    fixedLocale?: "en" | "zh";
    fixedPreviewMode?: "h5" | "app";
    maxPreviewWidth?: number;
  }[];
  pages: { value: string; label: string }[];
}

// Versioned with the pages: shared links never depend on an author's local drafts.
export const prototypeProjects: PrototypeProject[] = [{
  id: "global-navigation",
  name: "全局导航",
  description: "导航流程演示 · 使用示例商品，不产生真实订单",
  variants: [
    { id: "h5-v1", name: "H5 V1 · 侧边导航", categoryMenu: "text", description: "移动首页使用 V1 左侧抽屉导航。", homeHeader: "v1", fixedPreviewMode: "h5", maxPreviewWidth: 1023 },
    { id: "h5-v2", name: "H5 V2 · 商城切换", categoryMenu: "text", description: "移动首页使用 V2 商城切换入口。", homeHeader: "v2", fixedLocale: "en", fixedPreviewMode: "h5" },
  ],
  pages: [
    { value: "/", label: "Ecommerce Home" },
  ],
}];

export function resolvePrototypeVariant(project: PrototypeProject | undefined, id: string | null) {
  if (!id || (project?.id === "global-navigation" && (id === "current" || id === "image-categories"))) {
    return project?.variants[0];
  }
  return project?.variants.find((variant) => variant.id === id);
}

export function prototypeHref(params: URLSearchParams, path: string, variant?: string) {
  const query = new URLSearchParams();
  for (const key of ["locale", "theme", "viewport", "previewMode"]) {
    const value = params.get(key);
    if (value) query.set(key, value);
  }
  const projectId = params.get("project") ?? prototypeProjects[0].id;
  const project = prototypeProjects.find((item) => item.id === projectId);
  const requestedVariant = variant ?? params.get("variant");
  const selectedVariant = resolvePrototypeVariant(project, requestedVariant);
  query.set("project", projectId);
  query.set("variant", selectedVariant?.id ?? requestedVariant ?? prototypeProjects[0].variants[0].id);
  if (selectedVariant?.fixedLocale) query.set("locale", selectedVariant.fixedLocale);
  if (selectedVariant?.fixedPreviewMode) query.set("previewMode", selectedVariant.fixedPreviewMode);
  query.set("path", path);
  return `/prototype?${query}`;
}

export function prototypePageLabel(path: string, project: PrototypeProject) {
  const page = project.pages.find((item) => item.value === path);
  if (page) return page.label;
  if (path === "/cart") return "购物车";
  if (path === "/brands/anua" || path === "/brands/11712") return "Anua Topic Landing";
  return path.startsWith("/products/") ? "商品详情" : path.startsWith("/search/") ? "搜索结果" : path.startsWith("/categories/") ? "分类商品" : path;
}
