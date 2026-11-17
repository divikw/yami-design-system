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
import { ChevronRight } from "lucide-react";
import { GLOBALS_UPDATED } from "storybook/internal/core-events";
import type { PreparedStory } from "storybook/internal/types";
import { AccordionDocsPage } from "./accordion-docs";
import { AspectRatioDocsPage } from "./aspect-ratio-docs";
import { AvatarDocsPage } from "./avatar-docs";
import { BadgeDocsPage } from "./badge-docs";
import { ButtonDocsPage } from "./button-docs";
import { ButtonGroupDocsPage } from "./button-group-docs";
import { localizeArgTypes, type DescriptionTranslations } from "./arg-descriptions";
import styles from "./component-docs.module.css";

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
  const componentName = segments.at(-1)?.toLowerCase() === "draft"
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

const additionalStateExports: Record<string, readonly string[]> = {
  Accordion: ["SingleExpansion", "Controlled", "Disabled", "LongContent"],
  ActivityPageHeader: ["ChineseLocaleUsesEnglishLogo"],
  BrandProductRail: ["Centered", "MobilePlainCoverage", "BlackBottomDivider"],
  Header: ["HallSwitcher", "PromotionBadges", "CategoryRail"],
  HeroBanner: ["ContentVariants", "MobileDividerDisabled"],
  HorizontalScrollList: ["WithBackground", "WithoutBackground", "Disabled", "PCSideNavigation"],
  ProductCard: ["PresentationMatrix", "LongContent", "Horizontal", "DisabledAddButton"],
  ProductList: ["StandardRailExample", "ThemedRailExample", "WaterfallExample", "LoadingExample"],
  ReviewList: ["MobilePlain", "WithoutProduct"],
  SectionBanner: ["Centered"],
  SocialMediaGallery: ["SingleProduct", "MultipleProducts", "Centered"],
  Tabs: ["DesktopSecondary", "PrimaryStyleA", "PrimaryStyleB", "Secondary", "Tertiary", "Skeleton"],
  ThemeHero: ["MobileWithActions"],
  ThemeProductList: ["MobilePlain"],
  TrendingSearches: ["Centered"],
};

function StateExample({ story }: { story: PreparedStory }) {
  const [open, setOpen] = useState(false);
  return (
    <details onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary className={styles.stateSummary}><ChevronRight size={16} strokeWidth={2} aria-hidden="true" />{story.name}</summary>
      {open && <>
        <Description of={story.moduleExport} />
        <Canvas of={story.moduleExport} story={{ autoplay: false }} />
      </>}
    </details>
  );
}

export function ComponentDocsPage() {
  const context = useContext(DocsContext);
  const { csfFile, preparedMeta } = useOf("meta", ["meta"]);
  const sourceTitle = csfFile.moduleExports.default.title ?? preparedMeta.title;
  const componentStories = context.componentStories();
  const primaryStory = componentStories[0];
  const [locale, setLocale] = useState(context.getStoryContext(primaryStory).globals.locale);
  useEffect(() => {
    const onGlobalsUpdated = ({ globals }: { globals: Record<string, unknown> }) => setLocale(globals.locale);
    context.channel.on(GLOBALS_UPDATED, onGlobalsUpdated);
    return () => context.channel.off(GLOBALS_UPDATED, onGlobalsUpdated);
  }, [context.channel]);
  const language = locale === "en" ? "en" : "zh";
  const translations = preparedMeta.parameters.docs?.translations as DescriptionTranslations | undefined;
  const translation = translations?.[language];
  const localizeStory = (story: PreparedStory): PreparedStory => ({
    ...story,
    argTypes: localizeArgTypes(story.title, story.argTypes, language, story.parameters.docs?.translations ?? translations),
  });
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
  const hasDevicePreviews = componentStories.some((story) => story.tags.includes("component-device"));
  const playgroundExport = preparedMeta.parameters.docs?.playground ?? (hasDevicePreviews ? "Playground" : undefined);
  const playground = playgroundExport ? csfFile.moduleExports[playgroundExport] : undefined;
  const showcase = hasDevicePreviews ? csfFile.moduleExports.Showcase : undefined;
  const titleSegments = sourceTitle.split("/").map(normalizeComponentName);
  const stateComponent = Object.keys(additionalStateExports).find((name) => titleSegments.includes(normalizeComponentName(name)));
  const extraExamples = (stateComponent ? additionalStateExports[stateComponent] : [])
    .map((exportName) => csfFile.moduleExports[exportName]);
  const stateExamples = hasDevicePreviews ? componentStories.filter((story) => (
    !story.usesMount && !story.tags.includes("component-device") &&
    story.moduleExport !== playground && story.moduleExport !== showcase &&
    (extraExamples.includes(story.moduleExport) || (story.tags.includes("dev") && !/^(pc|mobile)$/i.test(story.name)))
  )) : [];
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

  const usageContent = usage ? (
    <section data-yami-docs="usage"><UsageMarkdown>{usage}</UsageMarkdown></section>
  ) : usageLoader ? (
    <p aria-live="polite" data-yami-docs="loading">
      {language === "zh" ? "正在加载使用说明…" : "Loading usage guide…"}
    </p>
  ) : null;

  const customDocsPages = { accordion: AccordionDocsPage, aspectratio: AspectRatioDocsPage, avatar: AvatarDocsPage, badge: BadgeDocsPage, button: ButtonDocsPage, buttongroup: ButtonGroupDocsPage };
  const componentKey = normalizeComponentName(sourceTitle.split("/").at(-1) ?? "");
  const DocsPage = customDocsPages[componentKey as keyof typeof customDocsPages];
  if (DocsPage) return <DocsPage locale={language} />;

  return (
    <DocsContext.Provider value={localizedContext}>
      <Title>{sourceTitle.trim().split(/\s*\/\s*/).at(-1)}</Title>
      <Subtitle />
      {translation?.description ? <Markdown>{translation.description}</Markdown> : <Description of="meta" />}
      {isSingleStory ? <Description of="story" /> : null}
      {playground ? (
        <>
          <h2 id="component-playground">{language === "zh" ? "交互试用" : "Playground"}</h2>
          {!hasDevicePreviews && preparedMeta.parameters.docs?.interactionStory ? (
            <p><a href={`/?path=/story/${preparedMeta.parameters.docs.interactionStory}`} target="_top">{language === "zh" ? "体验保存、加载与完成反馈" : "Try saving, loading, and completion feedback"}</a></p>
          ) : null}
          <Canvas of={playground} story={{ autoplay: false }} />
          <Controls of={playground} />
          <h2 id="component-specifications">{language === "zh" ? "规格与状态对照" : "Specifications and states"}</h2>
          {showcase ? <Canvas of={showcase} story={{ autoplay: false }} /> : <Primary />}
          {stateExamples.map((story) => <StateExample key={story.id} story={story} />)}
        </>
      ) : (
        <><Primary /><Controls /></>
      )}
      {usageContent}
      {hasDevicePreviews || isSingleStory || preparedMeta.parameters.docs?.showStories === false ? null : <Stories />}
    </DocsContext.Provider>
  );
}
