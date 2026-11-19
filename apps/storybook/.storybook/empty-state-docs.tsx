import { Avatar, AvatarGroup, EmptyState, EmptyStateDescription, EmptyStateHeader, EmptyStateMedia, EmptyStateTitle } from "@yami/design-system";
import { SavedLists } from "../../../packages/design-system/components/EmptyState/examples";
import exampleSource from "../../../packages/design-system/components/EmptyState/examples.tsx?raw";
import { SearchAgain } from "./empty-state-examples/search";
import searchSource from "./empty-state-examples/search.tsx?raw";
import type { DocsLocale } from "./component-docs-template";
import { ComponentGuide, type GuideExample } from "./component-guide";

export function EmptyStateDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const usageCode = `import { EmptyState, EmptyStateDescription, EmptyStateHeader, EmptyStateTitle } from "@yami/design-system";

<EmptyState>
  <EmptyStateHeader>
    <EmptyStateTitle>${zh ? "暂无商品" : "No products"}</EmptyStateTitle>
    <EmptyStateDescription>${zh ? "试试其他筛选条件。" : "Try different filters."}</EmptyStateDescription>
  </EmptyStateHeader>
</EmptyState>`;
  const examples: GuideExample[] = [
    {
      id: "outline", title: zh ? "描边" : "Outline",
      description: zh ? "虚线边框适合在列表中划出空状态区域。" : "Use a dashed border to define an empty area within a list.",
      preview: (
        <EmptyState style={{ border: "var(--stroke-default) dashed var(--border-default)" }}>
          <EmptyStateHeader>
            <EmptyStateTitle>{zh ? "暂无收藏" : "No saved items"}</EmptyStateTitle>
            <EmptyStateDescription>{zh ? "收藏的商品会显示在这里。" : "Saved products will appear here."}</EmptyStateDescription>
          </EmptyStateHeader>
        </EmptyState>
      ),
      code: `import { EmptyState, EmptyStateHeader, EmptyStateTitle, EmptyStateDescription } from "@yami/design-system";

<EmptyState style={{ border: "var(--stroke-default) dashed var(--border-default)" }}>
  <EmptyStateHeader>
    <EmptyStateTitle>${zh ? "暂无收藏" : "No saved items"}</EmptyStateTitle>
    <EmptyStateDescription>${zh ? "收藏的商品会显示在这里。" : "Saved products will appear here."}</EmptyStateDescription>
  </EmptyStateHeader>
</EmptyState>`,
    },
    {
      id: "background", title: zh ? "背景" : "Background",
      description: zh ? "次级表面区分消息区域。" : "A secondary surface separates this message from surrounding content.",
      preview: (
        <EmptyState style={{ background: "var(--surface-secondary)" }}>
          <EmptyStateHeader>
            <EmptyStateTitle>{zh ? "暂无通知" : "No notifications"}</EmptyStateTitle>
            <EmptyStateDescription>{zh ? "新的配送通知会显示在这里。" : "New delivery updates will appear here."}</EmptyStateDescription>
          </EmptyStateHeader>
        </EmptyState>
      ),
      code: `import { EmptyState, EmptyStateHeader, EmptyStateTitle, EmptyStateDescription } from "@yami/design-system";

<EmptyState style={{ background: "var(--surface-secondary)" }}>
  <EmptyStateHeader>
    <EmptyStateTitle>${zh ? "暂无通知" : "No notifications"}</EmptyStateTitle>
    <EmptyStateDescription>${zh ? "新的配送通知会显示在这里。" : "New delivery updates will appear here."}</EmptyStateDescription>
  </EmptyStateHeader>
</EmptyState>`,
    },
    {
      id: "avatar", title: zh ? "头像" : "Avatar",
      description: zh ? "用头像表示空状态所属的账户。" : "Use an avatar to identify the account this state belongs to.",
      preview: (
        <EmptyState>
          <EmptyStateHeader>
            <EmptyStateMedia><Avatar alt="" /></EmptyStateMedia>
            <EmptyStateTitle>{zh ? "暂无评价" : "No reviews yet"}</EmptyStateTitle>
            <EmptyStateDescription>{zh ? "你的商品评价会显示在这里。" : "Your product reviews will appear here."}</EmptyStateDescription>
          </EmptyStateHeader>
        </EmptyState>
      ),
      code: `import { EmptyState, EmptyStateHeader, EmptyStateTitle, EmptyStateDescription, EmptyStateMedia, Avatar } from "@yami/design-system";

<EmptyState>
  <EmptyStateHeader>
    <EmptyStateMedia><Avatar alt="" /></EmptyStateMedia>
    <EmptyStateTitle>${zh ? "暂无评价" : "No reviews yet"}</EmptyStateTitle>
    <EmptyStateDescription>${zh ? "你的商品评价会显示在这里。" : "Your product reviews will appear here."}</EmptyStateDescription>
  </EmptyStateHeader>
</EmptyState>`,
    },
    {
      id: "avatar-group", title: zh ? "头像组" : "Avatar group",
      description: zh ? "多个头像可表示共享清单的成员。" : "Show the members of a shared list together.",
      preview: (
        <EmptyState>
          <EmptyStateHeader>
            <EmptyStateMedia><AvatarGroup aria-label={zh ? "清单成员" : "List members"}><Avatar alt="Alex" /><Avatar alt="Sam" /></AvatarGroup></EmptyStateMedia>
            <EmptyStateTitle>{zh ? "共享清单为空" : "Shared list is empty"}</EmptyStateTitle>
            <EmptyStateDescription>{zh ? "成员添加的商品会显示在这里。" : "Items added by members will appear here."}</EmptyStateDescription>
          </EmptyStateHeader>
        </EmptyState>
      ),
      code: `import { EmptyState, EmptyStateHeader, EmptyStateTitle, EmptyStateDescription, EmptyStateMedia, Avatar, AvatarGroup } from "@yami/design-system";

<EmptyState>
  <EmptyStateHeader>
    <EmptyStateMedia><AvatarGroup aria-label="${zh ? "清单成员" : "List members"}"><Avatar alt="Alex" /><Avatar alt="Sam" /></AvatarGroup></EmptyStateMedia>
    <EmptyStateTitle>${zh ? "共享清单为空" : "Shared list is empty"}</EmptyStateTitle>
    <EmptyStateDescription>${zh ? "成员添加的商品会显示在这里。" : "Items added by members will appear here."}</EmptyStateDescription>
  </EmptyStateHeader>
</EmptyState>`,
    },
    {
      id: "search", title: zh ? "搜索" : "Search",
      description: zh ? "在输入框内更改关键词或清空搜索，即可看到匹配的茶饮。" : "Edit or clear the search to reveal matching teas.",
      preview: (
        <SearchAgain en={!zh} />
      ),
      code: searchSource,
    },
  ];
  return <ComponentGuide name="EmptyState" slug="emptystate" locale={locale}
    intro={zh ? "在列表或搜索没有结果时，说明当前状态并提供下一步操作。" : "Explain an empty collection or search result and offer a next step."}
    previous={{ name: "DropdownMenu", path: "yami-components-layout-dropdown-menu" }} next={{ name: "Field", path: "yami-components-forms-field" }}
    composition={"EmptyState\n├── EmptyStateHeader\n│   ├── EmptyStateMedia (optional)\n│   ├── EmptyStateTitle\n│   └── EmptyStateDescription\n└── EmptyStateContent (optional)"} usageCode={usageCode} examples={examples}
    leadExample={{ title: zh ? "基础示例" : "Example", code: exampleSource, preview: <SavedLists en={!zh} /> }}
    apiNote={zh ? "在列表或搜索没有结果时，说明当前状态并提供下一步操作。" : "Explain an empty collection or search result and offer a next step."}
    api={[
      ["EmptyState / EmptyStateHeader", zh ? "根容器和居中的说明区，可传入 className 与 style。" : "The root and centered header accept className and style."],
      ["EmptyStateMedia.variant", zh ? "默认 default。icon 为小图标添加底色与圆角。" : "Defaults to default. Use icon for a small icon with a tinted background."],
      ["EmptyStateTitle / EmptyStateDescription", zh ? "分别渲染二级标题和说明段落。" : "Render a level-two heading and a descriptive paragraph."],
      ["EmptyStateContent", zh ? "放置操作按钮、链接或输入控件。数据和事件由宿主管理。" : "Place actions, links or inputs here. The host owns the data and events."],
    ]}
    reference={{ label: "shadcn/ui Empty", href: "https://ui.shadcn.com/docs/components/base/empty" }} />;
}
