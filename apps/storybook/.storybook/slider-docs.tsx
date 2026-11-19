import { Slider } from "@yami/design-system";
import { BudgetSlider } from "../../../packages/design-system/components/Slider/examples";
import exampleSource from "../../../packages/design-system/components/Slider/examples.tsx?raw";
import type { DocsLocale } from "./component-docs-template";
import { ComponentGuide, type GuideExample } from "./component-guide";

export function SliderDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const usageCode = `import { Slider } from "@yami/design-system";

<Slider aria-label="${zh ? "音量" : "Volume"}" defaultValue={50} />`;
  const examples: GuideExample[] = [
    {
      id: "range", title: zh ? "区间" : "Range",
      description: zh ? "用两个滑块选择最低价和最高价。Tab 可分别聚焦，方向键按步长调节。" : "Tab between the minimum and maximum thumbs and adjust either one with the arrow keys.",
      preview: (
        <Slider defaultValue={[25, 75]} step={5} aria-label={zh ? "价格区间" : "Price range"}
          getAriaLabel={index => [(zh ? "最低价格" : "Minimum price"), (zh ? "最高价格" : "Maximum price")][index]} />
      ),
      code: `import { Slider } from "@yami/design-system";

<Slider defaultValue={[25, 75]} step={5} aria-label="${zh ? "价格区间" : "Price range"}"
  getAriaLabel={index => ["${zh ? "最低价格" : "Minimum price"}", "${zh ? "最高价格" : "Maximum price"}"][index]} />`,
    },
    {
      id: "multiple", title: zh ? "多个滑块" : "Multiple thumbs",
      description: zh ? "数组长度决定滑块数量，每个滑块有独立名称。" : "Supply one value and accessible name per threshold.",
      preview: (
        <Slider defaultValue={[10, 30, 70]} step={10}
          getAriaLabel={index => [(zh ? "低阈值" : "Low threshold"), (zh ? "中阈值" : "Middle threshold"), (zh ? "高阈值" : "High threshold")][index]} />
      ),
      code: `import { Slider } from "@yami/design-system";

<Slider defaultValue={[10, 30, 70]} step={10}
  getAriaLabel={index => ["${zh ? "低阈值" : "Low threshold"}", "${zh ? "中阈值" : "Middle threshold"}", "${zh ? "高阈值" : "High threshold"}"][index]} />`,
    },
    {
      id: "vertical", title: zh ? "纵向" : "Vertical",
      description: zh ? "纵向滑块从下往上递增。" : "Values increase from bottom to top.",
      preview: (
        <Slider orientation="vertical" defaultValue={50} aria-label={zh ? "音量" : "Volume"} style={{ marginInline: "auto" }} />
      ),
      code: `import { Slider } from "@yami/design-system";

<Slider orientation="vertical" defaultValue={50} aria-label="${zh ? "音量" : "Volume"}" style={{ marginInline: "auto" }} />`,
    },
    {
      id: "controlled", title: zh ? "受控区间" : "Controlled range",
      description: zh ? "宿主保存预算并同步显示当前上下限。" : "The host stores the budget and displays both values as they change.",
      preview: (
        <BudgetSlider en={!zh} />
      ),
      code: exampleSource,
    },
    {
      id: "disabled", title: zh ? "禁用" : "Disabled",
      description: zh ? "禁用时保留当前值。" : "The value remains visible when disabled.",
      preview: (
        <Slider disabled defaultValue={50} aria-label={zh ? "音量" : "Volume"} />
      ),
      code: `import { Slider } from "@yami/design-system";

<Slider disabled defaultValue={50} aria-label="${zh ? "音量" : "Volume"}" />`,
    },
  ];
  return <ComponentGuide name="Slider" slug="slider" locale={locale}
    intro={zh ? "在给定范围内选择一个值或一组值。" : "Select a value or a range on a scale."}
    previous={{ name: "Skeleton", path: "yami-components-data-display-skeleton" }} next={{ name: "Spinner", path: "yami-components-data-display-spinner" }}
    composition={"Slider\n└── Control → Track → Indicator + Thumb(s)"} usageCode={usageCode} examples={examples}
    leadExample={{ code: usageCode, preview: <Slider aria-label={zh ? "音量" : "Volume"} defaultValue={50} /> }}
    apiNote={zh ? "在给定范围内选择一个值或一组值。" : "Select a value or a range on a scale."}
    api={[
      ["value / defaultValue", zh ? "受控值或初始值。数组中每个数字对应一个滑块。" : "A controlled or initial value. Each number in an array creates one thumb."],
      ["min / max / step", zh ? "默认 0、100 和 1。支持小数步长。" : "Defaults to 0, 100 and 1. Decimal steps are supported."],
      ["orientation / disabled", zh ? "默认水平。纵向高度可用 style 或 className 调整。disabled 会禁用所有滑块。" : "Horizontal by default. Set the vertical height with style or className. Disabling the slider disables every thumb."],
      ["getAriaLabel / getAriaValueText", zh ? "按索引提供滑块名称，按值提供带单位的朗读文本。" : "Name thumbs by index and format their spoken values with units."],
      ["name / onValueChange / onValueCommitted", zh ? "name 用于表单提交。两个回调分别报告实时变化和已提交的值。" : "Supply a form name. Listen for live changes or committed values."],
    ]}
    reference={{ label: "shadcn/ui Slider", href: "https://ui.shadcn.com/docs/components/base/slider" }} />;
}
