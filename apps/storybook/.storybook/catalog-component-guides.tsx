import type { DocsLocale } from "./component-docs-template";
import type { DocsPreviewMode } from "./component-docs-preview";
import type { GuideExample } from "./component-guide";
import { tagProperties } from "./display-properties";
import { filterChipProperties, inputProperties, selectProperties } from "./form-properties";
import { paginationProperties, tabsProperties } from "./navigation-properties";
import { popoverProperties } from "./overlay-properties";
import { popoverDocsExamples } from "./popover-docs-examples";
import { tabsDocsExamples } from "./tabs-docs-examples";

type LeadExample = Pick<GuideExample, "preview" | "code" | "previewBackground">;
type CatalogGuide = {
  intro: string;
  composition: string;
  leadExample: LeadExample;
  examples: GuideExample[];
  usageCode?: string;
  previewMode?: DocsPreviewMode;
};

export const catalogComponentGuides: Partial<Record<string, (locale: DocsLocale) => CatalogGuide>> = {
  filterchip(locale) {
    const zh = locale === "zh";
    const { initialValues, example } = filterChipProperties;
    const defaults = initialValues(locale);
    return {
      intro: zh ? "在列表上方快速切换筛选条件，或打开相关筛选菜单。" : "Quickly toggle a list filter or open its related filter menu.",
      composition: "FilterChipGroup (optional)\n└── FilterChip → leftIcon / children / rightIcon\n\nFilterChipMenu → FilterChip + filter options",
      leadExample: example(defaults, locale),
      examples: [
        { id: "filled", title: zh ? "填充样式" : "Filled", description: zh ? "用填充表面区分承载区域。点击标签可切换选中状态。" : "Use a filled surface to distinguish the filter area. Click the chip to toggle it.", ...example({ ...defaults, variant: "filled" }, locale) },
        { id: "selected", title: zh ? "初始选中" : "Initially selected", description: zh ? "在首次显示时应用这个筛选条件。" : "Apply the filter on first render.", ...example({ ...defaults, defaultPressed: true }, locale) },
      ],
    };
  },
  input(locale) {
    const zh = locale === "zh";
    const { initialValues, example } = inputProperties;
    const defaults = initialValues(locale);
    return {
      intro: zh ? "单行输入控件。宽松版为 56 px，紧凑版为 40 px，PC 和移动端同高。" : "A single-line field with a 56 px default density and a 40 px compact density on PC and mobile.",
      composition: "Input\n├── label / placeholder\n├── native input + optional leading and trailing content\n└── helperText / error",
      leadExample: example(defaults, locale),
      examples: [
        { id: "default-density", title: zh ? "宽松输入框" : "Input with an embedded label", description: zh ? "控件高 56 px，标签在框内。" : "The control is 56 px high with an embedded label.", ...example({ ...defaults, density: "default" }, locale) },
        { id: "clearable", title: zh ? "清除内容" : "Clearable input", description: zh ? "输入文字后可用清除按钮一次删除。" : "The clear button removes the text after typing.", ...example({ ...defaults, clearable: true }, locale) },
      ],
    };
  },
  pagination(locale) {
    const zh = locale === "zh";
    const { initialValues, example } = paginationProperties;
    const defaults = initialValues(locale);
    return {
      intro: zh ? "桌面端的编号分页，用于在多页结果之间定位和切换。" : "Numbered desktop pagination for moving through several pages of results.",
      composition: "Pagination\n├── nav / list\n├── current page (aria-current)\n└── page links or buttons",
      leadExample: example(defaults, locale),
      examples: [
        { id: "long-results", title: zh ? "多页结果" : "More pages", description: zh ? "超过十页时显示省略号和最后一页。" : "An ellipsis and the final page appear when results span more than ten pages.", ...example({ ...defaults, pageCount: "12" }, locale) },
        { id: "unavailable", title: zh ? "暂时禁用" : "Disabled", description: zh ? "在加载期间暂停翻页，同时保留当前页标记。" : "Pause page changes during loading while retaining the current page marker.", ...example({ ...defaults, disabled: true }, locale) },
      ],
    };
  },
  popover(locale) {
    const zh = locale === "zh";
    return {
      intro: zh ? "锚定到当前触发器的浮层，可容纳一段说明或简短操作。" : "An anchored panel for related details or a short action.",
      composition: "Popover\n├── PopoverTrigger\n└── PopoverContent\n    ├── PopoverTitle / PopoverDescription\n    └── PopoverClose",
      previewMode: "document",
      leadExample: popoverProperties.example(popoverProperties.initialValues(locale), locale),
      examples: popoverDocsExamples(locale),
    };
  },
  select(locale) {
    const zh = locale === "zh";
    const { initialValues, example } = selectProperties;
    const defaults = initialValues(locale);
    return {
      intro: zh ? "从固定选项中选择一个值。宽松版为 56 px，紧凑版为 40 px，PC 和移动端同高。" : "Choose one value from a list. Default is 56 px and compact is 40 px on PC and mobile.",
      composition: "Select\n├── SelectTrigger → SelectValue\n└── SelectContent → SelectItem / SelectGroup",
      previewMode: "document",
      leadExample: example(defaults, locale),
      examples: [
        { id: "default-density", title: zh ? "宽松选择器" : "Select with an embedded label", description: zh ? "控件高 56 px，标签在框内。" : "The control is 56 px high with an embedded label.", ...example({ ...defaults, density: "default" }, locale) },
        { id: "selected", title: zh ? "初始选中" : "Initially selected", description: zh ? "让已知的默认值出现在触发器中。" : "Show the known default value in the trigger.", ...example({ ...defaults, defaultValue: "standard" }, locale) },
        { id: "disabled-preview", title: zh ? "禁用选择" : "Selection unavailable", description: zh ? "暂时无法更改时保留当前值并禁用触发器。" : "Retain the current value and disable the trigger when the choice cannot be changed.", ...example({ ...defaults, defaultValue: "standard", disabled: true }, locale) },
      ],
    };
  },
  tabs(locale) {
    const zh = locale === "zh";
    const samples = tabsDocsExamples(locale);
    return {
      intro: zh ? "在同一个页面区域中切换相关内容，支持多种视觉层级。" : "Switch between related views in one page region using different levels of visual emphasis.",
      composition: "Tabs\n├── TabsList → TabsTrigger\n└── TabsContent (one panel per trigger)",
      leadExample: samples.lead,
      examples: samples.examples.map(sample => ({ ...sample, preview: <div style={{ display: "grid", justifyItems: "center" }}>{sample.preview}</div> })),
      usageCode: tabsProperties.example(tabsProperties.initialValues(locale), locale).code,
    };
  },
  tag(locale) {
    const zh = locale === "zh";
    const { initialValues, example } = tagProperties;
    const defaults = initialValues(locale);
    return {
      intro: zh ? "用静态胶囊标签标记商品属性、类别或主题。" : "A static pill label for an attribute, category, or topic.",
      composition: "Tag\n├── optional image\n└── children",
      leadExample: example(defaults, locale),
      examples: [
        { id: "outline", title: zh ? "描边标签" : "Outlined tag", description: zh ? "用细描边呈现较弱的标签层级。" : "Use a thin outline for less visual emphasis.", ...example({ ...defaults, variant: "outline" }, locale) },
        { id: "dark-overlay", title: zh ? "深色背景标签" : "Tag on a dark background", description: zh ? "在深色图面上选择对应的 overlay 模式。" : "Use the matching overlay mode on a dark surface.", ...example({ ...defaults, context: "overlay", mode: "dark" }, locale) },
      ],
    };
  },
};
