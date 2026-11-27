import { legacyVariantTarget, prototypeProjects, type PrototypeProject } from "@yami/prototypes/design";

export { prototypeProjects, type PrototypeProject };
export { designIssues, isDesignStoryId } from "@yami/prototypes/design";

export function resolvePrototypeVariant(project: PrototypeProject | undefined, id: string | null) {
  if (!id) return project?.variants[0];
  const target = legacyVariantTarget(project?.id, id) ?? id;
  return project?.variants.find((variant) => variant.id === target);
}

export function prototypeHref(params: URLSearchParams, path: string, variant?: string) {
  const query = new URLSearchParams();
  for (const key of ["locale", "theme", "viewport", "previewMode"]) {
    const value = params.get(key);
    if (value) query.set(key, value);
  }
  const projectId = params.get("project") ?? prototypeProjects[0]?.id;
  const project = prototypeProjects.find((item) => item.id === projectId);
  const requestedVariant = variant ?? params.get("variant");
  const selectedVariant = resolvePrototypeVariant(project, requestedVariant);
  if (projectId) query.set("project", projectId);
  const variantId = selectedVariant?.id ?? requestedVariant;
  if (variantId) query.set("variant", variantId);
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
