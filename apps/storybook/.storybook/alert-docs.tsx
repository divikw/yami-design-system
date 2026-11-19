import { CircleCheck, CircleAlert, Info, TriangleAlert } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@yami/design-system";
import { StockAlert } from "../../../packages/design-system/components/Alert/examples";
import stockSource from "../../../packages/design-system/components/Alert/examples.tsx?raw";
import { ComponentGuide } from "./component-guide";
import type { DocsLocale } from "./component-docs-template";

export function AlertDocsPage({ locale }: { locale: DocsLocale }) {
  const en = locale === "en";
  const examples = [
    { id: "basic", title: en ? "Basic" : "基础提示", Icon: CircleCheck, iconName: "CircleCheck",
      heading: en ? "Address saved" : "地址已保存",
      body: en ? "Your next order will use this delivery address." : "下次下单时将使用这个配送地址。" },
    { id: "destructive", title: en ? "Destructive" : "错误提示", Icon: CircleAlert, iconName: "CircleAlert",
      heading: en ? "Payment failed" : "付款失败",
      body: en ? "Check your payment method before trying again." : "请核对付款方式后重试。" },
    { id: "colors", title: en ? "Custom colors" : "自定义颜色", Icon: TriangleAlert, iconName: "TriangleAlert",
      heading: en ? "Pickup window ends soon" : "取货时段即将结束",
      body: en ? "Collect your order before the store closes at 8 PM." : "请在门店晚上 8 点关门前取货。" },
  ].map(({ id, title, Icon, iconName, heading, body }) => {
    const props = id === "colors" ? { style: { background: "var(--fill-warning-secondary)" } }
      : id === "destructive" ? { variant: "destructive" as const } : {};
    const attributes = id === "colors" ? ' style={{ background: "var(--fill-warning-secondary)" }}'
      : id === "destructive" ? ' variant="destructive"' : "";
    return { id, title, description: id === "colors" ? (en ? "Use a semantic fill that adapts to the theme." : "使用随主题切换的警告填充 token。")
      : id === "destructive" ? (en ? "Explain the failure and how to recover." : "说明失败原因和恢复方法。")
      : (en ? "Pair the icon with a text label and description." : "用标题和说明表达图标所代表的信息。"),
      preview: <Alert {...props}><Icon aria-hidden="true" /><AlertTitle>{heading}</AlertTitle><AlertDescription>{body}</AlertDescription></Alert>,
      code: `import { Alert, AlertTitle, AlertDescription } from "@yami/design-system";
import { ${iconName} } from "lucide-react";

<Alert${attributes}>
  <${iconName} aria-hidden="true" />
  <AlertTitle>${heading}</AlertTitle>
  <AlertDescription>${body}</AlertDescription>
</Alert>` };
  });
  const title = en ? "Pickup confirmed" : "取货时间已确认";
  const detail = en ? "Your order will be ready after 4 PM." : "订单将在下午 4 点后备好。";
  const reminder = en ? "Bring your order number" : "请携带订单号";
  const directions = en ? "Show it at the pickup counter when you arrive." : "到店后请在取货柜台出示订单号。";
  const leadCode = `import { CircleCheck, Info } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@yami/design-system";

<div style={{ display: "grid", gap: "var(--space-150)" }}>
  <Alert>
    <CircleCheck aria-hidden="true" />
    <AlertTitle>${title}</AlertTitle>
    <AlertDescription>${detail}</AlertDescription>
  </Alert>
  <Alert>
    <Info aria-hidden="true" />
    <AlertTitle>${reminder}</AlertTitle>
    <AlertDescription>${directions}</AlertDescription>
  </Alert>
</div>`;
  return <ComponentGuide name="Alert" slug="alert" locale={locale}
    previous={{ name: "Accordion", path: "yami-components-layout-accordion" }} next={{ name: "AlertDialog", path: "yami-components-layout-alert-dialog" }}
    intro={en ? "Keep a message beside the affected content so users can refer to it while they act." : "把提示放在相关内容旁，方便用户边查看边处理。"}
    composition={"Alert\n├── Icon\n├── AlertTitle\n├── AlertDescription\n└── AlertAction"}
    leadExample={{ title: en ? "Pickup notices" : "取货提示", code: leadCode,
      preview: <div style={{ display: "grid", gap: "var(--space-150)" }}>
        <Alert><CircleCheck aria-hidden="true" /><AlertTitle>{title}</AlertTitle><AlertDescription>{detail}</AlertDescription></Alert>
        <Alert><Info aria-hidden="true" /><AlertTitle>{reminder}</AlertTitle><AlertDescription>{directions}</AlertDescription></Alert>
      </div> }} usageCode={examples[0].code}
    examples={[examples[0], examples[1], { id: "action", title: en ? "Action" : "操作按钮",
      description: en ? "Adjust the quantity to resolve the stock issue. On narrow screens the action sits below the message." : "调整数量即可处理库存不足。窄屏上操作按钮排在说明下方。",
      preview: <StockAlert en={en} />, code: stockSource + `\n<StockAlert en={${en}} />` }, examples[2]]}
    apiNote={en ? "The notice stays in the page. Use role=\"status\" for a less urgent update." : "提示随页面内容持续展示。非紧急动态反馈可使用 role=\"status\" 温和播报。"}
    api={[
      ["Alert.variant", en ? "default or destructive. The root accepts native div attributes and defaults to role=alert." : "支持 default 和 destructive。根节点接受原生 div 属性，默认 role=alert。"],
      ["AlertTitle / AlertDescription", en ? "Optional title and supporting content. A direct SVG child supplies an optional icon." : "可选的标题和说明。直接传入 SVG 子元素即可添加图标。"],
      ["AlertAction", en ? "Holds a link or button. Its action and subsequent state belong to the host." : "放置链接或按钮，操作及后续状态由宿主处理。"],
    ]} reference={{ label: "shadcn/ui Alert", href: "https://ui.shadcn.com/docs/components/base/alert" }} />;
}
