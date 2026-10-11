# MembershipBadge 会员徽标

会员等级展示，严格使用 [Figma 原始组件](https://www.figma.com/design/6oOAy72DBff4P6NzJYc2hi/YAMI-UI-UX-Guidelines?node-id=1632-21283) 的 SVG。支持 `ruby-0`、`ruby`、`silver`、`gold`，默认 `ruby-0`。

固定为 56×20px，移动端与桌面端一致。保留原始颜色、渐变和图形比例，不随主题重新着色。Ruby-0 是 Figma 中的灰色 Ruby 款式，不推断其业务状态。

```tsx
import { MembershipBadge } from "@yami/design-system/components/MembershipBadge";

<MembershipBadge tier="gold" />
```

默认读屏名称为等级名加“会员”。可用 `alt` 提供本地化名称；旁边已有相同等级文字时使用 `alt=""`，避免重复朗读。组件仅展示，不获得焦点，交互由外部共享 Button 或链接负责。
