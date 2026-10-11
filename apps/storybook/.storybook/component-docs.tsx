import {
  Canvas,
  Controls,
  Description,
  DocsContext,
  Markdown,
  Primary,
  Stories,
  Subtitle,
  Title,
  useOf,
} from "@storybook/addon-docs/blocks";
import { useContext, useEffect, useState } from "react";
import { GLOBALS_UPDATED } from "storybook/internal/core-events";
import type { PreparedStory } from "storybook/internal/types";

const usageModules = import.meta.glob(
  "../../../packages/design-system/components/*/usage.md",
  {
    import: "default",
    query: "?raw",
  },
) as Record<string, () => Promise<string>>;

function normalizeComponentName(value: string) {
  return value.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function componentNameFromUsagePath(filePath: string) {
  return filePath.match(/\/components\/([^/]+)\/usage\.md$/)?.[1];
}

const usageByComponent = new Map(
  Object.entries(usageModules).flatMap(([filePath, loadUsage]) => {
    const componentName = componentNameFromUsagePath(filePath);
    return componentName
      ? [[normalizeComponentName(componentName), loadUsage] as const]
      : [];
  }),
);

function getUsageLoaderForTitle(title: string) {
  const segments = title.split("/");
  const componentName = segments.at(-1) === "Draft"
    ? segments.at(-2) ?? title
    : segments.at(-1) ?? title;
  const normalizedName = normalizeComponentName(componentName);
  return usageByComponent.get(normalizedName === "floatingbars" ? "billboard" : normalizedName);
}

export async function loadUsageForTitle(title: string, locale = "zh") {
  const markdown = await getUsageLoaderForTitle(title)?.();
  if (!markdown?.includes("<!-- locale:")) return markdown;
  return markdown.split(`<!-- locale:${locale === "en" ? "en" : "zh"} -->`)[1]?.split("<!-- locale:")[0].trim();
}

export function formatUsageMarkdown(markdown: string) {
  return markdown.replace(/^#\s+(.+)\n+/, "## $1\n\n");
}

export function UsageMarkdown({ children }: { children: string }) {
  const ids = new Set<string>();
  return <Markdown options={{ slugify: (text) => {
    // Preserve Unicode letters while retaining existing ASCII heading URLs.
    const base = text.replace(/[^\p{L}\p{M}\p{N} -]/gu, "").replace(/ /g, "-").toLowerCase() || "section";
    let id = base;
    let suffix = 1;
    while (ids.has(id)) id = `${base}-${suffix++}`;
    ids.add(id);
    return id;
  } }}>{formatUsageMarkdown(children)}</Markdown>;
}

export function ComponentDocsPage() {
  const context = useContext(DocsContext);
  const { csfFile, preparedMeta } = useOf("meta", ["meta"]);
  const primaryStory = context.componentStories()[0];
  const [locale, setLocale] = useState(context.getStoryContext(primaryStory).globals.locale);
  useEffect(() => {
    const onGlobalsUpdated = ({ globals }: { globals: Record<string, unknown> }) => setLocale(globals.locale);
    context.channel.on(GLOBALS_UPDATED, onGlobalsUpdated);
    return () => context.channel.off(GLOBALS_UPDATED, onGlobalsUpdated);
  }, [context.channel]);
  const language = locale === "en" ? "en" : "zh";
  const translation = preparedMeta.parameters.docs?.translations?.[language] as {
    description: string;
    argDescriptions: Record<string, string>;
  } | undefined;
  const localizeStory = (story: PreparedStory): PreparedStory => translation ? {
    ...story,
    argTypes: Object.fromEntries(Object.entries(story.argTypes).map(([name, argType]) => [
      name, { ...argType, description: translation.argDescriptions[name] ?? argType.description },
    ])),
  } : story;
  const localizedContext = {
    ...context,
    // Storybook exposes project annotations through a getter, not an own property.
    projectAnnotations: context.projectAnnotations,
    componentStories: () => context.componentStories().map(localizeStory),
    resolveOf: ((...args) => {
      const resolved = context.resolveOf(...args);
      return resolved.type === "story" ? { ...resolved, story: localizeStory(resolved.story) } : resolved;
    }) as typeof context.resolveOf,
  };
  const usageLoader = getUsageLoaderForTitle(preparedMeta.title);
  const [usage, setUsage] = useState<string>();
  const playgroundExport = preparedMeta.parameters.docs?.playground;
  const playground = playgroundExport ? csfFile.moduleExports[playgroundExport] : undefined;
  const isSingleStory = Object.keys(csfFile.stories).length === 1;

  useEffect(() => {
    let isCurrent = true;
    setUsage(undefined);

    void loadUsageForTitle(preparedMeta.title, language).then((markdown) => {
      if (isCurrent) setUsage(markdown);
    });

    return () => {
      isCurrent = false;
    };
  }, [preparedMeta.title, language]);

  return (
    <DocsContext.Provider value={translation ? localizedContext : context}>
      <Title />
      <Subtitle />
      {translation ? <Markdown>{translation.description}</Markdown> : <Description of="meta" />}
      {isSingleStory ? <Description of="story" /> : null}
      {playground ? (
        <>
          <h2 id="component-playground">{language === "zh" ? "交互试用" : "Playground"}</h2>
          {preparedMeta.parameters.docs?.interactionStory ? (
            <p><a href={`/?path=/story/${preparedMeta.parameters.docs.interactionStory}`} target="_top">{language === "zh" ? "体验保存、加载与完成反馈" : "Try saving, loading, and completion feedback"}</a></p>
          ) : null}
          <Canvas of={playground} />
          <Controls of={playground} />
          <h2 id="component-specifications">{language === "zh" ? "规格与状态对照" : "Specifications and states"}</h2>
          <Primary />
        </>
      ) : (
        <><Primary /><Controls /></>
      )}
      {usage ? (
        <section data-yami-docs="usage">
          <UsageMarkdown>{usage}</UsageMarkdown>
        </section>
      ) : usageLoader ? (
        <p aria-live="polite" data-yami-docs="loading">
          {language === "zh" ? "正在加载使用说明…" : "Loading usage guide…"}
        </p>
      ) : null}
      {isSingleStory || preparedMeta.parameters.docs?.showStories === false ? null : <Stories />}
    </DocsContext.Provider>
  );
}
