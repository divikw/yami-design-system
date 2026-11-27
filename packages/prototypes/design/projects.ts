import { createElement, type ComponentType, type ReactNode } from "react";
import { combineTags, isExportStory, storyNameFromExport, toId, type IncludeExcludeOptions } from "storybook/internal/csf/csf-utils";
import type { EcommerceHomeLocale, EcommerceHomeProps } from "../pages/EcommerceHome";
import { designTitle } from "./title";

export interface DesignPreviewProps {
  locale: EcommerceHomeLocale;
  theme?: "light" | "dark";
  home?: EcommerceHomeProps;
  hrefFor?: (path: string) => string;
}

type DesignRender = (props: DesignPreviewProps, context: {
  globals: Pick<DesignPreviewProps, "locale" | "theme">;
}) => ReactNode;

export interface PrototypeProject {
  id: string;
  name: string;
  description: string;
  variants: {
    id: string;
    name: string;
    storyId: string;
    categoryMenu: "text" | "images";
    description: string;
    Preview: ComponentType<DesignPreviewProps>;
    fixedLocale?: "en" | "zh";
    fixedPreviewMode?: "h5" | "app";
    maxPreviewWidth?: number;
  }[];
  pages: { value: string; label: string }[];
}

type Variant = PrototypeProject["variants"][number];

interface DesignStory {
  tags?: string[];
  name?: string;
  args?: Partial<Pick<Variant, "id" | "categoryMenu" | "description" | "fixedPreviewMode" | "maxPreviewWidth">>;
  parameters?: { __id?: string; project?: Partial<Pick<PrototypeProject, "id" | "description" | "pages">> };
  globals?: { locale?: DesignPreviewProps["locale"] };
  render?: DesignRender;
}

interface DesignMeta extends IncludeExcludeOptions, DesignStory {
  id?: string;
  title?: string;
  component?: ComponentType<DesignPreviewProps>;
}

type DesignModule = { default: DesignMeta } & Record<string, DesignStory | DesignMeta>;

// Report every source of an ambiguous URL. Never resolve it to the first file found.
function conflictingIds(items: { id: string; source: string }[], kind: string, issues: string[]) {
  const sources = new Map<string, string[]>();
  for (const { id, source } of items) {
    const group = sources.get(id) ?? [];
    group.push(source);
    sources.set(id, group);
  }
  const conflicts = new Set<string>();
  for (const [id, group] of sources) {
    if (group.length < 2) continue;
    conflicts.add(id);
    issues.push(`${kind} ID「${id}」重复：${group.join("、")}`);
  }
  return conflicts;
}

export function legacyVariantTarget(projectId: string | undefined, variantId: string) {
  if (projectId === "global-navigation" && (variantId === "current" || variantId === "image-categories")) return "h5-v1";
}

export function buildDesignRegistry(modules: Record<string, DesignModule>) {
  const designIssues: string[] = [];
  const storySources: { id: string; source: string }[] = [];
  const componentIds = new Set<string>();
  const candidates = Object.entries(modules).map(([file, { default: meta, ...stories }]) => {
    const title = designTitle(file, meta.title);
    const project = meta.parameters?.project;
    const name = title.split("/").at(-1)!;
    const projectId = project?.id ?? toId(title.slice("YAMI/design/".length));
    const componentId = toId(meta.id ?? title);
    componentIds.add(componentId);
    const variants = Object.entries(stories).filter(([key]) => isExportStory(key, meta)).flatMap(([key, story]) => {
      const exportName = storyNameFromExport(key);
      const source = `${file}#${key}`;
      const storyId = story.parameters?.__id ?? toId(componentId, exportName);
      storySources.push({ id: storyId, source });
      if (!combineTags("dev", ...(meta.tags ?? []), ...(story.tags ?? [])).includes("dev")) return [];
      const args = { ...meta.args, ...story.args };
      const render = story.render ?? meta.render;
      return [{
        categoryMenu: "text" as const, description: "", ...args,
        source, storyId,
        id: args.id ?? toId(exportName),
        name: story.name ?? exportName,
        fixedLocale: story.globals?.locale ?? meta.globals?.locale,
        Preview: (props: DesignPreviewProps) => {
          const previewProps = { ...args, ...props };
          if (render) return render(previewProps, { globals: { locale: props.locale, theme: props.theme } });
          if (meta.component) return createElement(meta.component, previewProps);
          throw new Error(`Missing component or render for ${title}/${key}`);
        },
      }];
    });
    const conflicts = conflictingIds(variants, "版本", designIssues);
    for (const variant of variants) {
      if (legacyVariantTarget(projectId, variant.id)) {
        conflicts.add(variant.id);
        designIssues.push(`历史链接保留了版本 ID「${variant.id}」：${variant.source}`);
      }
    }
    return {
      source: file,
      id: projectId,
      name, description: project?.description ?? "", pages: project?.pages ?? [{ value: "/", label: name }],
      variants: variants.filter((variant) => !conflicts.has(variant.id)),
      hasVisibleStories: variants.length > 0,
    };
  }).filter((project) => project.hasVisibleStories);

  const conflicts = conflictingIds(candidates, "项目", designIssues);
  const storyConflicts = conflictingIds(storySources, "Story", designIssues);
  const prototypeProjects: PrototypeProject[] = candidates
    .filter((project) => !conflicts.has(project.id))
    .map((project) => ({ ...project, variants: project.variants.filter((variant) => !storyConflicts.has(variant.storyId)) }))
    .filter((project) => project.variants.length > 0)
    // Existing links without a project parameter open Global Navigation.
    .sort((a, b) => Number(b.id === "global-navigation") - Number(a.id === "global-navigation") || a.id.localeCompare(b.id));
  const storyIds = new Set(storySources.map(({ id }) => id));
  function isDesignStoryId(id: string) {
    return id.startsWith("yami-design-") || storyIds.has(id) || componentIds.has(id.split("--")[0]);
  }
  return { prototypeProjects, designIssues, isDesignStoryId };
}

export const { prototypeProjects, designIssues, isDesignStoryId } = buildDesignRegistry(
  import.meta.glob<DesignModule>(["./**/*.stories.ts", "./**/*.stories.tsx"], { eager: true }),
);
