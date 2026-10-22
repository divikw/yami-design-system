<!-- locale:zh -->
# Accordion — 使用说明

用于商品规格、营养成分、配料、免责声明及 FAQ 等可展开内容。样式抽取自商品详情页现有 DetailDisclosure：16px 标题、右侧 16px 加号／减号、相邻面板间的细分隔线，无卡片外框或阴影。尚未独立绑定 Figma 组件，成熟度为 experimental。

一个 Accordion 表示一个面板。直接并排渲染多个组件即可独立展开，保留商品详情页原来的行为。不要将始终必读的信息藏在默认折叠区，也不要用它代替 Tabs、菜单或打开对话框的按钮。

```tsx
import { Accordion } from "@yami/design-system";

<div>
  <Accordion label="商品规格" defaultExpanded>
    <p>单盒 200 毫升，每组 6 盒。</p>
  </Accordion>
  <Accordion label="配料">
    <p>完整配料及过敏原信息见包装标签，选购前请仔细核对。</p>
  </Accordion>
</div>
```

`label` 和 `children` 必填。`defaultExpanded` 默认 false，仅设置非受控初值；受控使用 `expanded` 和 `onExpandedChange(next)`，调用方需要更新 expanded 才会改变界面。若需每次只展开一项，由宿主管理当前面板 ID，将各项 expanded 设为 `activeId === id`。`disabled` 默认 false，禁用标题按钮但保留当前展开状态。`headingLevel` 默认 2，可选 2–6，按页面标题层级选择。原生 div 属性、className、style 和 ref 传到根元素；可传唯一 id，未提供时自动生成内部关联 ID。

标题使用原生 button，Enter／Space 展开或收起，Tab 按 DOM 顺序经过标题和已展开内容中的控件。触发器设置 aria-expanded、aria-controls，内容区域以触发器命名；收起内容使用 hidden，保留子组件状态，同时从焦点顺序和无障碍树移除。标题只能放文本或静态内联内容，不嵌套链接、按钮等交互控件。正文可包含表格、链接和表单。多个面板较多时，宿主应合理分组，避免过多命名区域。

标题至少 44px 高，长文本自然换行；这是现有 Web 商品详情页的尺寸，不代表原生 Android 的 48dp 验收。默认／深色主题自动消费语义 token，禁用态不使用 opacity。保留 2px 蓝色键盘焦点及 2px 偏移，外层不要裁切焦点框。展开直接切换，无高度动画或桌面 hover 效果。PC 面板上下留 4px、正文底部留 12px；小于 1024px 时面板上下间距由相邻项提供，正文底部间距为 12px。

组件只负责内联折叠。内容、数据请求、加载／错误展示、单项互斥展开及切换到 Sheet 的响应式业务由宿主负责。商品详情页保留原有 DetailDisclosure 实现，本次仅新增共享组件，不替换现有页面。

<!-- locale:en -->
# Accordion — Usage

An inline disclosure for specifications, nutrition, ingredients, disclaimers and FAQs. Extracted from the existing product-detail DetailDisclosure: a 16px heading, 16px plus/minus icon and fine separators between adjacent panels, with no card outline or shadow. Experimental; no independently verified Figma component binding.

Each Accordion is one panel. Render siblings for independent expansion. Keep essential information visible, and use Tabs, menus or dialog triggers for their respective behaviors.

Provide `label` and `children`. `defaultExpanded` defaults to false and initializes uncontrolled state. For controlled use, provide `expanded` and update it in `onExpandedChange(next)`. For exclusive expansion, the host stores an active ID and passes `expanded={activeId === id}` to each panel. `disabled` disables the trigger without changing the current expansion. `headingLevel` is 2 by default, supporting 2–6. Native div attributes, className, style and ref target the root. An optional unique id supplies the internal ID prefix; otherwise React generates one.

The native button supports Enter, Space and normal Tab order. aria-expanded and aria-controls connect it to a named content region. Collapsed children remain mounted with hidden, preserving state while leaving the focus order and accessibility tree. Labels contain text or static inline elements; put links, forms and other controls in the body. Group large collections thoughtfully to avoid excessive named regions.

The heading retains the PDP's minimum 44px Web target; this is not a claim of native Android 48dp compliance. Long labels wrap without shrinking the icon. Light/Dark use semantic tokens, disabled colors use no opacity, and keyboard focus uses a separate 2px blue outline with 2px offset. Preserve space around that outline. Content switches immediately with no height animation or mouse hover treatment. PC uses 4px panel padding and 12px bottom content padding; below 1024px adjacent panels supply spacing and content uses a 12px bottom margin.

The host owns copy, fetching, loading/errors, exclusive expansion and responsive Sheet behavior. ProductDetailPage retains its existing DetailDisclosure implementation; adding this shared component does not replace existing page code.
