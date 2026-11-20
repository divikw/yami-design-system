import type { DocsLocale } from "./component-docs-template";

type Localized = readonly [zh: string, en: string];

const guidance: Record<string, { use: Localized; recommend: Localized; avoid: Localized; accessibility: Localized }> = {
  card: {
    use: ["用卡片把一条订单、配送信息等独立内容和它的操作放在一起。", "Group a self-contained item such as an order or delivery update with its actions."],
    recommend: ["通过标题和说明建立层级，正文与操作按需要组合。", "Use a heading and description for hierarchy, then add body content and actions as needed."],
    avoid: ["整张卡片是链接或按钮时，避免再嵌套可点击控件。", "Avoid nested interactive controls when the whole card is a link or button."],
    accessibility: ["可点击卡片使用原生链接或按钮，并给出能说明目的的名称。", "Use a native link or button for an actionable card and give it a name that explains its purpose."],
  },
  checkbox: {
    use: ["用复选框选择独立选项，或在一组项目中选择多项。", "Use a checkbox for an independent choice or to select several items in a group."],
    recommend: ["将标签与控件关联，并用半选状态表示只有部分子项被选中。", "Associate the label with its control and use the mixed state when only some children are selected."],
    avoid: ["互斥选项避免使用复选框，优先使用单选组。", "Use a radio group for mutually exclusive options."],
    accessibility: ["Tab 聚焦复选框，空格切换。半选状态会作为 mixed 通知辅助技术。", "Tab focuses the checkbox and Space toggles it. Assistive technology receives the mixed state."],
  },
  combobox: {
    use: ["候选项较多且需要输入关键词缩小范围时，使用组合框。", "Use a combobox when typing helps narrow a long list of choices."],
    recommend: ["提示用户可以搜索什么，并提供找不到匹配项时的反馈。", "Explain what users can search for and show feedback when nothing matches."],
    avoid: ["选项少且无需搜索时，避免增加额外输入步骤。", "Avoid an extra typing step for a short list that people can scan."],
    accessibility: ["给输入框和图标按钮提供可访问名称。方向键移动高亮，Enter 选择，Escape 收起。", "Name the input and icon buttons. Arrow keys move the highlight, Enter selects, and Escape dismisses."],
  },
  dialog: {
    use: ["用居中对话框承载短表单、编辑和需要集中阅读的信息。", "Use a centered dialog for a short form, editing task, or information that needs focused attention."],
    recommend: ["保留清晰的关闭方式，把关键操作放在固定的底部区域。", "Provide an obvious way to close and keep key actions in the footer."],
    avoid: ["不可撤销的确认操作使用 AlertDialog。长内容可使用 Drawer。", "Use AlertDialog for irreversible confirmations and consider Drawer for longer content."],
    accessibility: ["用 DialogTitle 命名对话框。Escape 关闭后，焦点回到触发按钮。", "Name the dialog with DialogTitle. Escape closes it and returns focus to its trigger."],
  },
  divider: {
    use: ["用分隔线区分相邻内容区，或在同一行内区分短信息。", "Use a divider between adjacent sections or between short pieces of metadata in a row."],
    recommend: ["用默认强度分隔普通列表，在明确的区块边界才加重。", "Use the default strength in lists and reserve emphasis for meaningful section boundaries."],
    avoid: ["避免单靠分隔线表达内容层级，搭配语义标题和合理间距。", "Pair dividers with semantic headings and spacing to convey hierarchy."],
    accessibility: ["水平分隔线具备分隔语义，垂直线用于装饰。同一组内容仍需用合适的列表或区块表达。", "Horizontal dividers expose separator semantics. Vertical dividers are decorative, so group their content with a suitable list or section."],
  },
  drawer: {
    use: ["在保持页面上下文的同时，用抽屉展示筛选、详情或较长的辅助内容。", "Use a drawer for filters, details, or longer supporting content while preserving page context."],
    recommend: ["让正文独立滚动，并把关键操作放在固定底部。", "Let the body scroll independently and keep its key actions in the footer."],
    avoid: ["避免把重要操作只藏在手势里。", "Avoid making essential actions available only through gestures."],
    accessibility: ["提供可读标题和关闭按钮。键盘用户可用 Escape 关闭，并在关闭后回到原入口。", "Provide a readable title and a close button. Escape dismisses the drawer and returns keyboard focus to its opener."],
  },
  "dropdown-menu": {
    use: ["用菜单收纳同一对象的一组操作。", "Use a menu to group actions for the same item."],
    recommend: ["按用途把操作分组，并把有风险的操作放在单独的组里。", "Group related actions and separate high-impact actions."],
    avoid: ["重要的常用操作值得直接显示，避免将它们长期藏在菜单里。", "Keep important, frequent actions visible outside the menu."],
    accessibility: ["使用方向键浏览，Enter 执行，Escape 关闭。给触发按钮清楚的名称。", "Use arrow keys to move, Enter to act, and Escape to dismiss. Give the trigger a clear name."],
  },
  emptystate: {
    use: ["列表无结果、用户尚未创建内容或内容被清空时，展示空状态。", "Show an empty state when a list has no results, no content exists yet, or content has been removed."],
    recommend: ["说明为什么没有内容，并在有明确下一步时提供一次操作。", "Explain why the area is empty and offer one clear action when a next step exists."],
    avoid: ["加载和错误有各自的反馈方式，避免用空状态代替。", "Use dedicated feedback for loading and errors."],
    accessibility: ["用有意义的标题告知用户哪里没有内容，装饰图标可对辅助技术隐藏。", "Give the empty area a meaningful heading and hide decorative icons from assistive technology."],
  },
  field: {
    use: ["用 Field 把控件、标签、说明与校验信息组合起来。", "Compose controls with labels, help, and validation messages using Field."],
    recommend: ["同一组表单的 Input、Select 和 Combobox 使用同一档，尤其是并排时。把错误放在对应字段下，并说明怎么改。", "Use the same density for Input, Select and Combobox in a form group, especially side by side. Place errors beneath their field and explain how to fix them."],
    avoid: ["避免仅靠颜色或占位符解释字段的用途和错误。", "Avoid relying on color or a placeholder to communicate purpose or errors."],
    accessibility: ["用 FieldLabel 提供名称，并使用 FieldDescription 和 FieldError 关联提示。", "Use FieldLabel for the name and FieldDescription and FieldError for supporting text."],
  },
  filterchip: {
    use: ["用筛选标签快速展示和切换列表筛选条件。", "Use filter chips to expose and toggle list filters."],
    recommend: ["用短标签写明筛选结果，例如「仅看有货」。", "Use short labels that describe the filter result, such as In stock only."],
    avoid: ["复杂筛选可用成组菜单或抽屉，避免把多个选择压缩成一个含糊的标签。", "Use grouped menus or a drawer for complex filters."],
    accessibility: ["可切换标签使用按下状态表达选中，图标应有清晰的可访问名称或配套文案。", "Use the pressed state for toggles and pair icons with a clear label or accessible name."],
  },
  input: {
    use: ["用单行输入框收集姓名、地址或搜索词。", "Use Input for single-line values such as a name, address, or search query."],
    recommend: ["有内嵌标题时使用默认规格，只有占位提示时用紧凑规格并提供外部标签。", "Use the default density for an embedded label and compact density with an external label for a placeholder-only field."],
    avoid: ["避免让占位符充当唯一标签，错误也应有明确文字。", "Provide a proper label and describe errors in text."],
    accessibility: ["通过标签或 aria-label 命名输入框，并关联可见的说明和错误。", "Name the field with a label or aria-label and associate visible help and errors."],
  },
  "navigation-menu": {
    use: ["用导航菜单组织目的地，并在需要时展开次级链接。", "Use NavigationMenu to organize destinations and reveal child links when useful."],
    recommend: ["使用真实链接，为每组链接提供准确标题。", "Use real links and give each group an accurate title."],
    avoid: ["普通任务操作使用按钮或操作菜单。", "Use buttons or an action menu for task actions."],
    accessibility: ["给导航区提供名称。键盘用户可用方向键浏览，并用 Escape 关闭展开的内容。", "Name the navigation region. Arrow keys move through entries and Escape dismisses expanded content."],
  },
  pagination: {
    use: ["用于桌面端的分批结果。控件在 1024 px 及以上出现，页面负责加载对应数据。", "Use it for paged results on desktop. Controls appear from 1024 px, and the host loads each page of data."],
    recommend: ["数据就地更新时使用 onPageChange，需要可分享地址时使用 getPageHref。", "Use onPageChange for in-place updates and getPageHref for shareable page URLs."],
    avoid: ["为同一个分页控件选择一种导航方式。", "Choose one navigation mode for each pagination control."],
    accessibility: ["当前页使用 aria-current 标记，禁用状态不能触发导航。", "The current page uses aria-current. Disabled items cannot navigate."],
  },
  popover: {
    use: ["用锚定浮层显示对当前控件有帮助的短说明或少量操作。", "Use an anchored panel for short details or a small set of actions related to its trigger."],
    recommend: ["保持内容简短，并用合适的对齐边方便读者找到浮层来源。", "Keep content brief and align it so the relationship to the trigger is clear."],
    avoid: ["长表单和必须明确确认的任务优先使用对话框。", "Use a dialog for long forms and actions requiring explicit confirmation."],
    accessibility: ["为浮层提供标题，为图标关闭按钮命名，并支持 Escape 返回触发器。", "Title the panel, name icon-only close buttons, and let Escape return focus to the trigger."],
  },
  progress: {
    use: ["用进度条说明任务完成到了哪一步。", "Use a progress bar to show how much of a task is complete."],
    recommend: ["能测量时提供真实数值。无法判断进度时使用不确定状态。", "Use measured values when available and the indeterminate state when progress is unknown."],
    avoid: ["避免用虚构的百分比表示等待。", "Avoid showing a fabricated percentage for an unknown wait."],
    accessibility: ["用 ProgressLabel 命名任务，必要时提供符合业务语境的可读数值。", "Name the task with ProgressLabel and provide contextual value text when needed."],
  },
  radiogroup: {
    use: ["用单选组从互斥选项中选择一个值。", "Use a radio group to choose one of several mutually exclusive options."],
    recommend: ["给选项组和每个选项提供容易区分的标签。", "Give the group and its options clear, distinct labels."],
    avoid: ["支持同时选中多项时，使用复选框组。", "Use checkboxes when multiple choices can remain selected."],
    accessibility: ["Tab 进入选项组，方向键移动和选择。标签应关联对应选项。", "Tab enters the group and arrow keys move and select. Associate each label with its option."],
  },
  select: {
    use: ["用选择器从有限选项中选一个值。", "Use Select to choose a single value from a fixed list."],
    recommend: ["使用容易扫读的标签，并在未选中时提供简短提示。", "Use scannable option labels and a short placeholder before selection."],
    avoid: ["需要输入关键词筛选大量选项时，使用组合框。", "Use a combobox when users need to filter a long list by typing."],
    accessibility: ["为触发器提供可访问名称，并保留方向键、Enter 和 Escape 的交互。", "Name the trigger and preserve arrow, Enter, and Escape interactions."],
  },
  skeleton: {
    use: ["在布局已知但内容仍在加载时展示骨架占位。", "Use a skeleton when the expected layout is known and its content is still loading."],
    recommend: ["让占位轮廓接近真实内容，降低加载完成后的布局变化。", "Match the eventual content shape to reduce layout shift."],
    avoid: ["避免将骨架用于错误状态或持续显示无关装饰。", "Use dedicated error feedback and avoid persistent decorative placeholders."],
    accessibility: ["骨架本身从辅助技术隐藏。可在加载区域使用 aria-busy。", "The skeleton is hidden from assistive technology. Put aria-busy on the loading region when appropriate."],
  },
  slider: {
    use: ["数值范围连续或需要快速试调时，使用滑块。", "Use a slider to adjust a value across a range."],
    recommend: ["提供范围、步长和当前值。需要精确输入时可搭配输入框。", "Show the range, step, and current value. Pair with an input for precise entry."],
    avoid: ["避免用滑块表示少量不连续的类别。", "Avoid sliders for a few discrete categories."],
    accessibility: ["为每个滑块手柄命名。方向键按步长调整，数值需要时可包含单位。", "Name each thumb. Arrow keys adjust by the step, and value text can include units."],
  },
  spinner: {
    use: ["用旋转指示器表示短时、进度未知的加载。", "Use a spinner for a short wait with unknown progress."],
    recommend: ["把指示器放在受影响的操作或内容附近。", "Place it close to the action or content being loaded."],
    avoid: ["进度可量化时优先使用进度条。", "Use a progress bar when the task can be measured."],
    accessibility: ["独立指示器提供可访问名称。已有加载文案时，可以把圆环保留为装饰。", "Name a standalone spinner. With separate loading text, treat the ring as decorative."],
  },
  switch: {
    use: ["用开关处理立即生效的二元设置。", "Use a switch for a binary setting that takes effect immediately."],
    recommend: ["用稳定的标签说明控制的设置，并保持切换前后名称一致。", "Use a stable label that names the setting in both states."],
    avoid: ["批量选择和等候提交的表单选项更适合复选框。", "Prefer checkboxes for batch selection and form choices awaiting submission."],
    accessibility: ["Tab 聚焦开关，空格切换。状态通过开关语义通知辅助技术。", "Tab focuses the switch and Space toggles it. The switch role exposes its state."],
  },
  tabs: {
    use: ["用标签页在一个区域内切换并列内容。", "Use tabs to switch between related views within one region."],
    recommend: ["保持标签简短，并为每个标签配置对应内容面板。", "Keep labels short and give each tab a matching panel."],
    avoid: ["跨页面导航使用链接。", "Use links to navigate between pages."],
    accessibility: ["方向键移动焦点，手动激活模式下按 Enter 或空格切换。", "Arrow keys move focus. In manual mode, use Enter or Space to activate the focused tab."],
  },
  tag: {
    use: ["用静态标签标识简短属性、主题或商品特点。", "Use a static tag for a short attribute, topic, or product feature."],
    recommend: ["选择适合背景的模式，并让文案便于快速扫读。", "Choose a mode that matches the background and keep the label easy to scan."],
    avoid: ["筛选和操作应使用拥有相应交互语义的组件。", "Use components with appropriate interaction semantics for filters and actions."],
    accessibility: ["图片重复文案时使用空 alt。只有文字的标签保持原生阅读顺序。", "Use empty alt text when an image repeats the label. Plain text tags follow reading order."],
  },
  textarea: {
    use: ["用多行文本框记录备注等较长输入。", "Use a textarea for longer input such as notes."],
    recommend: ["用外部标签说明用途，并在需要时提示数量或格式。", "Use an external label and explain constraints when needed."],
    avoid: ["避免用多行输入框收集预期只有一行的值。", "Use a single-line field for short values that do not need line breaks."],
    accessibility: ["关联可见标签、说明和错误，确保键盘可以编辑或浏览内容。", "Associate the visible label, help, and errors, and keep the field usable by keyboard."],
  },
  toast: {
    use: ["用轻提示反馈完成、失败等短时结果，同时让用户继续当前任务。", "Use a toast for brief feedback while people continue their current task."],
    recommend: ["用短标题概括结果，并为有操作的通知预留足够时间。", "Summarize the outcome in a short title and allow enough time for actionable notifications."],
    avoid: ["重要确认或需要持续可见的错误应使用对话框或页面内提示。", "Use a dialog for required confirmation and an inline alert for persistent errors."],
    accessibility: ["为关闭图标和通知区域提供名称。通知出现时保留用户当前焦点。", "Name the dismiss icon and notification region. Keep the user’s current focus when a toast appears."],
  },
  tooltip: {
    use: ["用工具提示补充控件用途或术语含义。", "Use a tooltip to clarify a control or a term."],
    recommend: ["保持提示简短，并让鼠标悬停和键盘聚焦都能触发。", "Keep it short and reveal it on hover and keyboard focus."],
    avoid: ["链接、操作和必须读取的信息应在正文、可操作浮层或可见标签中呈现。", "Place links, actions, and essential information in visible content or an interactive panel."],
    accessibility: ["触发器本身要有可访问名称，工具提示可补充说明。", "Give the trigger its own accessible name. The tooltip adds context."],
  },
};

export function componentGuideNotes(slug: string, locale: DocsLocale) {
  const notes = guidance[slug];
  if (!notes) return undefined;
  const index = locale === "zh" ? 0 : 1;
  return {
    usageNote: notes.use[index],
    practices: [["do", notes.recommend[index]], ["avoid", notes.avoid[index]]] satisfies ["do" | "avoid", string][],
    accessibility: [notes.accessibility[index]],
  };
}
