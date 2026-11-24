<!-- locale:zh -->
# Accordion — 使用说明

用于商品规格、营养成分、配料、免责声明及 FAQ 等可展开内容。样式抽取自商品详情页现有 DetailDisclosure。标题在 Mobile 为 14px，1024px 起为 16px，行高均为 20px。右侧加号／减号为 16px，相邻面板间使用细分隔线，无卡片外框或阴影。尚未独立绑定 Figma 组件，成熟度为 experimental。

## 多面板组合

多个面板共用 `Accordion`。`multiple` 默认是 `false`，点击另一项时会收起已展开项。设置 `multiple` 可同时展开多项。为每个 `AccordionItem` 指定唯一的 `value`，用 `defaultValue` 设置初始展开项，或用 `value` 和 `onValueChange` 受控。Root 和各部分沿用 Base UI 属性。需要在收起时保留子组件状态，可设置 `keepMounted`。

```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@yami/design-system";

<Accordion multiple defaultValue={["specifications"]}>
  <AccordionItem value="specifications">
    <AccordionTrigger>商品规格</AccordionTrigger>
    <AccordionContent>单盒 200 毫升，每组 6 盒。</AccordionContent>
  </AccordionItem>
  <AccordionItem value="ingredients">
    <AccordionTrigger>配料</AccordionTrigger>
    <AccordionContent>完整配料及过敏原信息见包装标签。</AccordionContent>
  </AccordionItem>
</Accordion>
```

## 部件与状态

调用结构与 shadcn/ui 一致：`Accordion` → `AccordionItem` → `AccordionTrigger` + `AccordionContent`。Trigger 内部包含 Base UI Header，默认渲染 h3，无需额外写 Header。即使只有一项，也使用相同结构。各部件透传对应 Base UI 的属性、`render` 和 `ref`；组件样式由 YAMI 管理。

禁用整个分组使用 `Accordion disabled`；仅禁用一项使用 `AccordionItem disabled`。禁用态背景透明，文字和图标使用 `--text-disabled`。

标题使用原生按钮，Enter／Space 展开或收起，Tab 按页面顺序经过可见控件。标题可以放文本或静态内联内容，正文可以放表格、链接和表单。将必读信息放在折叠区外。

标题至少 44px 高，长文本自然换行；这是现有 Web 商品详情页的尺寸，不代表原生 Android 的 48dp 验收。默认／深色主题自动消费语义 token，禁用态不使用 opacity。保留 2px 蓝色键盘焦点及 2px 偏移，外层不要裁切焦点框。展开直接切换，无高度动画或桌面 hover 效果。PC 面板上下留 4px、正文底部留 12px；小于 1024px 时面板上下间距由相邻项提供，正文底部间距为 12px。

<!-- locale:en -->
# Accordion — Usage

An inline disclosure for specifications, nutrition, ingredients, disclaimers and FAQs. Extracted from the existing product-detail DetailDisclosure. Headings use 14px on mobile and 16px from 1024px, with a 20px line height at both sizes. The 16px plus/minus icon and fine separators between adjacent panels remain, without a card outline or shadow. Experimental, with no independently verified Figma component binding.

## Grouped panels

Place multiple items inside one `Accordion`. `multiple` defaults to `false`: opening another item closes the open item. Set `multiple` to allow several open items. Give each item a unique `value`. Use `defaultValue` for initial expansion or `value` and `onValueChange` for controlled expansion. The parts accept the corresponding Base UI props. Set `keepMounted` to preserve child state while a panel is closed.

```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@yami/design-system";

<Accordion multiple defaultValue={["specifications"]}>
  <AccordionItem value="specifications">
    <AccordionTrigger>Specifications</AccordionTrigger>
    <AccordionContent>6 cartons per pack, 200 ml each.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="ingredients">
    <AccordionTrigger>Ingredients</AccordionTrigger>
    <AccordionContent>See the packaging for ingredients and allergens.</AccordionContent>
  </AccordionItem>
</Accordion>
```

## Parts and state

The call structure follows shadcn/ui: `Accordion` → `AccordionItem` → `AccordionTrigger` + `AccordionContent`. Trigger includes Base UI Header internally, rendering h3 by default. Use the same structure for a single item. Each part forwards its corresponding Base UI props, `render` and `ref`; YAMI owns the styles.

Set `disabled` on Accordion to disable the group or on AccordionItem to disable one item. Disabled triggers retain a transparent background and use `--text-disabled` for text and icons.

The native button supports Enter, Space, and normal Tab order. Labels contain text or static inline elements. Links, forms, and other controls belong in the panel body. Keep essential information visible outside collapsed panels.

Long labels wrap without shrinking the icon. The trigger has a 44px minimum height and a 2px blue keyboard focus outline with a 2px offset. PC uses 4px panel padding and 12px bottom content padding. Below 1024px, adjacent panels supply spacing and content uses a 12px bottom margin.
