import {
  Anchor,
  AnchorMdx,
  Canvas,
  CodeOrSourceMdx,
  Controls,
  Description,
  DocsContext,
  HeadersMdx,
  Markdown,
  Primary,
  SourceContext,
  Stories,
  Subtitle,
  Title,
  useOf,
  useSourceProps,
} from "@storybook/addon-docs/blocks";
import { isValidElement, useContext, useEffect, useState, type ComponentProps, type ComponentType, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { GLOBALS_UPDATED } from "storybook/internal/core-events";
import type { PreparedStory } from "storybook/internal/types";
import { AlertDocsPage } from "./alert-docs";
import { ToastDocsPage } from "./toast-docs";
import { AlertDialogDocsPage } from "./alert-dialog-docs";
import { NavigationMenuDocsPage } from "./navigation-menu-docs";
import { ProgressDocsPage } from "./progress-docs";
import { SliderDocsPage } from "./slider-docs";
import { EmptyStateDocsPage } from "./empty-state-docs";
import { SkeletonDocsPage } from "./skeleton-docs";
import { SpinnerDocsPage } from "./spinner-docs";
import { TextareaDocsPage } from "./textarea-docs";
import { TooltipDocsPage } from "./tooltip-docs";
import { FieldDocsPage } from "./field-docs";
import { HeaderDocsPage } from "./header-docs";
import { TabBarDocsPage } from "./tab-bar-docs";
import { CollectionCardDocsPage, HorizontalScrollListDocsPage, ProductCardDocsPage, ProductListDocsPage } from "./product-display-docs";
import { DropdownMenuDocsPage } from "./dropdown-menu-docs";
import { DrawerDocsPage } from "./drawer-docs";
import { DividerDocsPage } from "./divider-docs";
import { DialogDocsPage } from "./dialog-docs";
import { AccordionDocsPage } from "./accordion-docs";
import { AspectRatioDocsPage } from "./aspect-ratio-docs";
import { AvatarDocsPage } from "./avatar-docs";
import { BadgeDocsPage } from "./badge-docs";
import { BreadcrumbDocsPage } from "./breadcrumb-docs";
import { ButtonDocsPage } from "./button-docs";
import { ButtonGroupDocsPage } from "./button-group-docs";
import { CardDocsPage } from "./card-docs";
import { CouponDocsPage } from "./coupon-docs";
import { SwitchDocsPage } from "./switch-docs";
import { RadioGroupDocsPage } from "./radio-group-docs";
import { ComboboxDocsPage } from "./combobox-docs";
import { CheckboxDocsPage } from "./checkbox-docs";
import { componentApiRows, usesBaseUI } from "./component-docs-scope";
import { componentDocsName, normalizeComponentName } from "./component-docs-names";
import { CodeBlock, ComponentDocsTemplate, DocsApiTable, DocsExampleCard, type DocsLocale } from "./component-docs-template";
import { ComponentGuide } from "./component-guide";
import { catalogComponentGuides } from "./catalog-component-guides";
import { popoverApi } from "./popover-docs-api";
import { localizeArgTypes, type DescriptionTranslations } from "./arg-descriptions";
import styles from "./component-docs.module.css";
import templateStyles from "./component-docs-template.module.css";

const usageModules = import.meta.glob(
  "../../../packages/design-system/components/*/usage.md",
  {
    import: "default",
    query: "?raw",
  },
) as Record<string, () => Promise<string>>;

type DocsNeighbor = { name: string; path: string };
type DocsNeighbors = { id: string; previous?: DocsNeighbor; next?: DocsNeighbor };
const customDocsPages: Partial<Record<string, ComponentType<{ locale: DocsLocale }>>> = { dropdownmenu: DropdownMenuDocsPage, alert: AlertDocsPage, toast: ToastDocsPage, navigationmenu: NavigationMenuDocsPage, progress: ProgressDocsPage, combobox: ComboboxDocsPage, spinner: SpinnerDocsPage, skeleton: SkeletonDocsPage, emptystate: EmptyStateDocsPage, slider: SliderDocsPage, textarea: TextareaDocsPage, tooltip: TooltipDocsPage, field: FieldDocsPage, header: HeaderDocsPage, tabbar: TabBarDocsPage, drawer: DrawerDocsPage, divider: DividerDocsPage, dialog: DialogDocsPage, alertdialog: AlertDialogDocsPage, accordion: AccordionDocsPage, aspectratio: AspectRatioDocsPage, avatar: AvatarDocsPage, badge: BadgeDocsPage, breadcrumb: BreadcrumbDocsPage, button: ButtonDocsPage, buttongroup: ButtonGroupDocsPage, card: CardDocsPage, checkbox: CheckboxDocsPage, radiogroup: RadioGroupDocsPage, switch: SwitchDocsPage };
customDocsPages.horizontalscrolllist = HorizontalScrollListDocsPage;
customDocsPages.collectioncard = CollectionCardDocsPage;
customDocsPages.coupon = CouponDocsPage;
customDocsPages.productcard = ProductCardDocsPage;
customDocsPages.productlist = ProductListDocsPage;

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
  if (!/^# /.test(markdown)) return markdown;
  // Nest the standalone guide below the page title, preserving code samples.
  let fence = "";
  return markdown.split("\n").map((line) => {
    const marker = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1].startsWith(fence) && !marker[2].trim()) fence = "";
      return line;
    }
    return fence ? line : line.replace(/^(#{1,5}) /, "#$1 ");
  }).join("\n");
}

function UsageCode({ children, locale }: { children: ReactNode; locale: DocsLocale }) {
  if (!isValidElement<{ children?: ReactNode; className?: string }>(children) || typeof children.props.children !== "string") {
    return <pre>{children}</pre>;
  }
  const fence = children.props.className?.replace(/^lang(?:uage)?-/, "");
  const language = fence === "tsx" || fence === "css" || fence === "json" || fence === "bash" ? fence : "text";
  return <CodeBlock code={children.props.children.trimEnd()} locale={locale} language={language} />;
}

function UsageTable(props: ComponentProps<"table">) {
  return <div className={templateStyles.tableScroll}><table {...props} /></div>;
}

export function UsageMarkdown({ children, locale }: { children: string; locale?: DocsLocale }) {
  const ids = new Set<string>();
  return <Markdown options={{
    overrides: {
      ...HeadersMdx,
      a: AnchorMdx,
      code: CodeOrSourceMdx,
      table: UsageTable,
      ...(locale && { pre: (props) => <UsageCode {...props} locale={locale} /> }),
    },
    slugify: (text) => {
      // Preserve Unicode letters while retaining existing ASCII heading URLs.
      const base = text.replace(/[^\p{L}\p{M}\p{N} -]/gu, "").replace(/ /g, "-").toLowerCase() || "section";
      let id = base;
      let suffix = 1;
      while (ids.has(id)) id = `${base}-${suffix++}`;
      ids.add(id);
      return id;
    },
  }}>{formatUsageMarkdown(children)}</Markdown>;
}

const additionalStateExports: Record<string, readonly string[]> = {
  Accordion: ["SingleExpansion", "Controlled", "Disabled", "LongContent"],
  ActivityPageHeader: ["ChineseLocaleUsesEnglishLogo"],
  BrandProductRail: ["Centered", "MobilePlainCoverage", "BlackBottomDivider"],
  Divider: ["Vertical"],
  FilterChip: ["PressedStates", "PopupMenus"],
  Header: ["HallSwitcher", "PromotionBadges", "CategoryRail"],
  HeroBanner: ["ContentVariants", "MobileDividerDisabled"],
  HorizontalScrollList: ["WithBackground", "WithoutBackground", "Disabled", "PCSideNavigation"],
  Input: ["Compact", "WithAction", "ExternalValidation"],
  Pagination: ["Links", "Disabled"],
  ProductCard: ["PresentationMatrix", "LongContent", "Horizontal", "DisabledAddButton"],
  ProductList: ["StandardRailExample", "ThemedRailExample", "WaterfallExample", "LoadingExample"],
  ReviewList: ["MobilePlain", "WithoutProduct"],
  SectionBanner: ["Centered"],
  SocialMediaGallery: ["SingleProduct", "MultipleProducts", "Centered"],
  Tabs: ["DesktopSecondary", "PrimaryStyleA", "PrimaryStyleB", "Secondary", "Tertiary", "Skeleton", "ManualActivation", "BaseUIOptions"],
  ThemeHero: ["WithoutImage", "MobileWithActions"],
  ThemeProductList: ["MobilePlain"],
  TrendingSearches: ["Centered"],
};

function StoryExample({ story, locale, name }: { story: PreparedStory; locale: DocsLocale; name?: string }) {
  const context = useContext(DocsContext);
  const sources = useContext(SourceContext);
  const { code } = useSourceProps({ of: story.moduleExport }, context, sources);
  return <DocsExampleCard code={code} locale={locale} name={name}>
    <div className={styles.storyPreview}><Canvas of={story.moduleExport} sourceState="none" story={{ autoplay: false }} /></div>
  </DocsExampleCard>;
}

function StateExample({ story, locale }: { story: PreparedStory; locale?: DocsLocale }) {
  const [open, setOpen] = useState(false);
  return (
    <details onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary className={styles.stateSummary}><ChevronRight size={16} strokeWidth={2} aria-hidden="true" />{story.name}</summary>
      {open && <>
        <Description of={story.moduleExport} />
        {locale ? <StoryExample story={story} locale={locale} /> : <Canvas of={story.moduleExport} story={{ autoplay: false }} />}
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
  // Docs follow the toolbar even when the first story fixes its demo locale.
  const [locale, setLocale] = useState(context.getStoryContext(primaryStory).userGlobals.locale);
  useEffect(() => {
    const onGlobalsUpdated = ({ userGlobals }: { userGlobals: Record<string, unknown> }) => setLocale(userGlobals.locale);
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
  const stateSections: Record<string, Record<DocsLocale, string>> = preparedMeta.parameters.docs?.stateSections ?? {};
  const documentedStates = Object.entries(stateSections).flatMap(([key, titles]) => {
    const story = componentStories.find(entry => entry.moduleExport === csfFile.moduleExports[key]);
    return story ? [{ story, title: titles[language], id: key.toLowerCase() }] : [];
  });
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

  const name = sourceTitle.trim().split(/\s*\/\s*/).at(-1) ?? sourceTitle;
  const componentKey = normalizeComponentName(name);
  const DocsPage = customDocsPages[componentKey];
  const catalogGuide = catalogComponentGuides[componentKey]?.(language);
  const hasCatalogGuide = Boolean(catalogGuide);
  const [neighbors, setNeighbors] = useState<DocsNeighbors>();
  const docsId = primaryStory.id.split("--")[0] + "--docs";
  const sharedDocs = usesBaseUI(componentKey) && hasDevicePreviews;
  useEffect(() => {
    if ((!sharedDocs && !hasCatalogGuide) || DocsPage || !/^YAMI\/Components\/[^/]+$/i.test(sourceTitle)) return;
    const controller = new AbortController();
    void fetch(new URL("index.json", window.location.href), { signal: controller.signal })
      .then((response) => response.json() as Promise<{ entries: Record<string, { type: string; id: string; title: string; tags?: string[] }> }>)
      .then(({ entries }) => {
        const siblings = Object.values(entries).filter((entry) => (
          entry.type === "docs" && entry.id.endsWith("--docs") && entry.tags?.includes("dev") && /^YAMI\/Components\/[^/]+$/i.test(entry.title)
        ));
        const index = siblings.findIndex((entry) => entry.id === docsId);
        if (index === -1) return;
        const neighbor = (entry: (typeof siblings)[number] | undefined) => entry && ({
          name: entry.title.split("/")[2],
          path: entry.id.replace(/--docs$/, ""),
        });
        setNeighbors({ id: docsId, previous: neighbor(siblings[index - 1]), next: neighbor(siblings[index + 1]) });
      })
      .catch(() => { /* The Docs page still works if the sidebar index cannot be loaded. */ });
    return () => controller.abort();
  }, [DocsPage, docsId, hasCatalogGuide, sharedDocs, sourceTitle]);
  if (DocsPage) return <DocsPage locale={language} />;

  if (catalogGuide) {
    const specifications = showcase && componentStories.find((story) => story.moduleExport === showcase);
    const customExamples = componentKey === "tabs" || componentKey === "popover";
    const storyExamples = !customExamples && <>
      {specifications && !documentedStates.some(({ id }) => id === "specifications") && <section>
        <h3 id={`${componentKey}-specifications`}>{language === "zh" ? "规格与状态对照" : "Specifications and states"}</h3>
        <StoryExample story={specifications} locale={language} name="specifications" />
      </section>}
      {stateExamples.filter(story => !documentedStates.some(entry => entry.story === story)).map(story => <StateExample key={story.id} story={story} locale={language} />)}
      {documentedStates.map(({ story, title, id }) => <section key={story.id}>
        <h3 id={`${componentKey}-${id}`}>{title}</h3>
        <StoryExample story={story} locale={language} name={id} />
      </section>)}
    </>;
    return <DocsContext.Provider value={localizedContext}>
      <ComponentGuide {...catalogGuide} name={name} slug={componentKey} locale={language}
        previous={neighbors?.id === docsId ? neighbors.previous : undefined}
        next={neighbors?.id === docsId ? neighbors.next : undefined}
        storyExamples={storyExamples} usageCode={catalogGuide.usageCode ?? catalogGuide.leadExample.code}
        legacyAnchors={{ examples: ["component-specifications"], api: ["component-playground"] }}
        api={componentKey === "popover" ? popoverApi[language] : componentApiRows(componentKey, sourceTitle, language, translations)}
        apiNote={language === "zh" ? "属性及默认值以公开组件 API 为准。" : "These attributes and defaults come from the public component API."} />
    </DocsContext.Provider>;
  }

  if (sharedDocs) {
    const intro = translation?.description ?? preparedMeta.parameters.docs?.description?.component;
    const api = language === "zh" ? "API 参考" : "API Reference";
    const apiRows = componentApiRows(componentKey, sourceTitle, language, translations);
    const lead = (playground && componentStories.find((story) => story.moduleExport === playground)) ?? primaryStory;
    const specifications = showcase && componentStories.find((story) => story.moduleExport === showcase);
    return <DocsContext.Provider value={localizedContext}>
      <ComponentDocsTemplate name={name} slug={componentKey} intro={intro ? <Markdown>{intro}</Markdown> : <Description of="meta" />}
        locale={language}
        previous={neighbors?.id === docsId ? neighbors.previous : undefined}
        next={neighbors?.id === docsId ? neighbors.next : undefined}>
        <Anchor storyId={`primary--${lead.id}`}>
          <StoryExample story={lead} locale={language} name="lead" />
        </Anchor>
        <section className={templateStyles.usage} data-yami-docs="usage">
          {usage ? <UsageMarkdown locale={language}>{usage}</UsageMarkdown> : usageContent}
        </section>
        {(playground || stateExamples.length > 0) && <section>
          <h2 id="component-specifications">{language === "zh" ? "规格与状态对照" : "Specifications and states"}</h2>
          {specifications && specifications !== lead && <StoryExample story={specifications} locale={language} name="specifications" />}
          {stateExamples.filter(story => !documentedStates.some(entry => entry.story === story)).map((story) => <StateExample key={story.id} story={story} locale={language} />)}
        </section>}
        {documentedStates.map(({ story, title, id }) => <section key={story.id}>
          <h2 id={`${componentKey}-${id}`}>{title}</h2>
          <StoryExample story={story} locale={language} name={id} />
        </section>)}
        <section>
          <h2 id={playground ? "component-playground" : `${componentKey}-api`}>{api}</h2>
          <DocsApiTable locale={language} rows={apiRows} />
        </section>
      </ComponentDocsTemplate>
    </DocsContext.Provider>;
  }

  const title = componentDocsName(name, language);
  const controls = <Controls of={playground} />;
  const controlsBlock = usageLoader ? <div className={styles.controls}>{controls}</div> : controls;
  const content = (
    <>
      <Title>{title === name ? title : <span lang={language}>{title}</span>}</Title>
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
          {controlsBlock}
          <h2 id="component-specifications">{language === "zh" ? "规格与状态对照" : "Specifications and states"}</h2>
          {showcase ? <Canvas of={showcase} story={{ autoplay: false }} /> : <Primary />}
          {stateExamples.map((story) => <StateExample key={story.id} story={story} />)}
        </>
      ) : (
        <><Primary />{controlsBlock}</>
      )}
      {usageContent}
      {hasDevicePreviews || isSingleStory || preparedMeta.parameters.docs?.showStories === false ? null : <Stories />}
    </>
  );
  return (
    <DocsContext.Provider value={localizedContext}>
      {usageLoader ? <div data-component-docs="">{content}</div> : content}
    </DocsContext.Provider>
  );
}
