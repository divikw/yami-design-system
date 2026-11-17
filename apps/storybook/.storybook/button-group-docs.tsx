import { Button, ButtonGroup, ButtonLink } from "@yami/design-system";
import { ComponentGuide, type GuideExample } from "./component-guide";
import type { DocsLocale } from "./component-docs-template";
import styles from "./component-guide.module.css";

const importCode = 'import { Button, ButtonGroup } from "@yami/design-system";';
const legacyAnchors = {
  usage: ["buttongroup--按钮组", "buttongroup--usage", "使用场景", "when-to-use"],
  full: ["两种布局", "two-layouts", "容器与焦点边界", "container-and-focus-boundaries"],
  mixed: ["内容与边界", "content-and-boundaries", "交互与无障碍", "interaction-and-accessibility"],
};

export function ButtonGroupDocsPage({ locale }: { locale: DocsLocale }) {
  const zh = locale === "zh";
  const settings = zh ? "设置操作" : "Settings actions";
  const cancel = zh ? "取消" : "Cancel";
  const save = zh ? "保存设置" : "Save settings";
  const cart = zh ? "购物车操作" : "Cart actions";
  const continueShopping = zh ? "继续购物" : "Continue shopping";
  const checkout = zh ? "前往结算" : "Checkout";
  const documentation = zh ? "文档操作" : "Documentation actions";
  const viewApi = zh ? "查看 API" : "View API";
  const copyName = zh ? "复制组件名" : "Copy component name";
  const examples: GuideExample[] = [
    {
      id: "basic",
      title: zh ? "内容宽度" : "Content width",
      description: zh ? "相关按钮按内容宽度排列，间距为 8px。空间不足时，按钮可以换行。" : "Related buttons keep their content width and an 8px gap. The group wraps when space runs out.",
      code: `${importCode}\n\n<ButtonGroup aria-label="${settings}">\n  <Button variant="secondary">${cancel}</Button>\n  <Button>${save}</Button>\n</ButtonGroup>`,
      preview: <div className={styles.row}>
        <ButtonGroup aria-label={settings}><Button variant="secondary">{cancel}</Button><Button>{save}</Button></ButtonGroup>
      </div>,
    },
    {
      id: "full",
      anchor: "component-specifications",
      title: zh ? "等宽布局" : "Equal width",
      description: zh ? "设置 full 后，同组按钮单行等宽，整组填满容器，最大宽度 480px。子项都使用 form=\"full\" 和相同尺寸。" : "Set full for equal-width buttons in one row. The group fills its container up to 480px. Give each child form=\"full\" and the same size.",
      code: `${importCode}\n\n<ButtonGroup full aria-label="${cart}">\n  <Button form="full" size="lg" variant="secondary">${continueShopping}</Button>\n  <Button form="full" size="lg" variant="emphasis">${checkout}</Button>\n</ButtonGroup>`,
      preview: <ButtonGroup full aria-label={cart}>
        <Button form="full" size="lg" variant="secondary">{continueShopping}</Button>
        <Button form="full" size="lg" variant="emphasis">{checkout}</Button>
      </ButtonGroup>,
    },
    {
      id: "mixed",
      title: zh ? "按钮与链接" : "Buttons and links",
      description: zh ? "Button 执行操作，ButtonLink 保留原生链接行为。两者可作为同组的直接子项，Tab 按文档顺序访问。" : "Button performs an action and ButtonLink keeps native link behavior. Both can be direct children of the group, with Tab following document order.",
      code: `import { Button, ButtonGroup, ButtonLink } from "@yami/design-system";\n\n<ButtonGroup aria-label="${documentation}">\n  <ButtonLink href="#buttongroup-api" target="_parent" variant="secondary">${viewApi}</ButtonLink>\n  <Button onClick={() => void navigator.clipboard.writeText("ButtonGroup")}>${copyName}</Button>\n</ButtonGroup>`,
      preview: <div className={styles.row}>
        <ButtonGroup aria-label={documentation}>
          <ButtonLink href="#buttongroup-api" target="_parent" variant="secondary">{viewApi}</ButtonLink>
          <Button onClick={() => void navigator.clipboard.writeText("ButtonGroup")}>{copyName}</Button>
        </ButtonGroup>
      </div>,
    },
    {
      id: "states",
      title: zh ? "禁用与加载" : "Disabled and loading",
      description: zh ? "把 loading 和 disabled 设在相应的 Button 上，由调用方根据业务状态控制各入口。" : "Set loading and disabled on individual Buttons. The caller controls each entry based on application state.",
      code: `${importCode}\n\n<ButtonGroup aria-label="${settings}">\n  <Button variant="secondary" disabled>${cancel}</Button>\n  <Button loading>${save}</Button>\n</ButtonGroup>`,
      preview: <div className={styles.row}>
        <ButtonGroup aria-label={settings}><Button variant="secondary" disabled>{cancel}</Button><Button loading>{save}</Button></ButtonGroup>
      </div>,
    },
  ];

  return <div id="component-playground">
    <ComponentGuide name="ButtonGroup" slug="buttongroup" locale={locale}
      intro={zh ? "将作用于同一对象的按钮和链接成组排列，支持内容宽度和等宽两种布局。" : "Group buttons and links that act on the same item, with content-width and equal-width layouts."}
      previous={{ name: "Button", path: "yami-components-actions-button" }}
      next={{ name: "Card", path: "yami-components-layout-card" }}
      legacyAnchors={legacyAnchors}
      composition={"ButtonGroup\n├── Button | ButtonLink\n└── Button | ButtonLink"}
      examples={examples}
      apiNote={zh ? "ButtonGroup 渲染具名的 role=\"group\"。各子项保留自己的外观、焦点和激活行为。" : "ButtonGroup renders a named role=\"group\". Each child retains its own appearance, focus and activation behavior."}
      api={[
        ["aria-label", zh ? "必填。用简短文字描述整组操作的用途。" : "Required. A short name describing the purpose of the group."],
        ["full", zh ? "boolean，默认 false。设为 true 时使用等宽单行布局，最大宽度 480px。" : "Boolean, defaults to false. Enables an equal-width single row up to 480px."],
        ["children", zh ? "通常为 2–3 个尺寸相同的直接子 Button 或 ButtonLink。" : "Typically two or three direct Button or ButtonLink children of the same size."],
        ["className, style, ref", zh ? "支持原生 div 属性和 HTMLDivElement ref。" : "Supports native div attributes and an HTMLDivElement ref."],
      ]}
      reference={{ label: zh ? "Button 尺寸与状态" : "Button sizes and states", href: "/?path=/docs/yami-components-actions-button--docs" }} />
  </div>;
}
