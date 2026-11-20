import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
  Alert, AlertTitle, AlertDescription,
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AspectRatio, Avatar, Badge, Breadcrumb, Button, ButtonGroup,
  type AvatarSize, type BadgeColor, type BadgeEmphasis, type BadgeSize, type BadgeType,
} from "@yami/design-system";
import { jsxAttributes, type PropertiesDefinition } from "./component-properties";

export const accordionProperties: PropertiesDefinition<{ multiple: boolean; disabled: boolean }> = {
  slug: "accordion",
  initialValues: () => ({ multiple: false, disabled: false }),
  fields: (_, locale) => [
    { key: "multiple", kind: "switch", description: locale === "zh" ? "允许同时展开多个面板。" : "Allow multiple panels to remain open." },
    { key: "disabled", kind: "switch", description: locale === "zh" ? "禁用这一组折叠面板。" : "Disable the entire accordion." },
  ],
  example: ({ multiple, disabled }, locale) => {
    const items = locale === "zh" ? [
      { value: "delivery", title: "配送时间", body: "工作日下单后通常在两天内发货。" },
      { value: "returns", title: "退货说明", body: "在订单详情页查看退货选项。" },
    ] : [
      { value: "delivery", title: "Delivery time", body: "Orders usually ship within two business days." },
      { value: "returns", title: "Returns", body: "See return options on the order details page." },
    ];
    const attrs = jsxAttributes({ multiple: multiple || undefined, disabled: disabled || undefined });
    return {
      preview: <div style={{ width: "100%" }}><Accordion defaultValue={["delivery"]} multiple={multiple} disabled={disabled}>
        {items.map(({ value, title, body }) => <AccordionItem value={value} key={value}>
          <AccordionTrigger>{title}</AccordionTrigger><AccordionContent>{body}</AccordionContent>
        </AccordionItem>)}
      </Accordion></div>,
      code: `import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@yami/design-system";\n\n<Accordion defaultValue={["delivery"]}${attrs}>\n${items.map(({ value, title, body }) => `  <AccordionItem value="${value}">\n    <AccordionTrigger>{${JSON.stringify(title)}}</AccordionTrigger>\n    <AccordionContent>{${JSON.stringify(body)}}</AccordionContent>\n  </AccordionItem>`).join("\n")}\n</Accordion>`,
    };
  },
};

export const alertProperties: PropertiesDefinition<{ title: string; description: string; variant: "default" | "destructive"; role: "alert" | "status" }> = {
  slug: "alert",
  initialValues: locale => ({ title: locale === "zh" ? "请核对配送地址" : "Check your delivery address", description: locale === "zh" ? "确认邮编和门牌号后继续。" : "Confirm the ZIP code and street number before continuing.", variant: "default", role: "alert" }),
  fields: (_, locale) => [
    { key: "title", name: "AlertTitle.children", kind: "text", type: "ReactNode", label: locale === "zh" ? "提示标题" : "Alert title", description: locale === "zh" ? "概括提示内容。" : "Summarize the message." },
    { key: "description", name: "AlertDescription.children", kind: "text", type: "ReactNode", label: locale === "zh" ? "提示说明" : "Alert description", description: locale === "zh" ? "补充原因或下一步操作。" : "Explain the reason or next action." },
    { key: "variant", kind: "select", options: ["default", "destructive"], description: locale === "zh" ? "destructive 用于错误或需要立即处理的情况。" : "Use destructive for errors or situations that need immediate attention." },
    { key: "role", kind: "select", options: ["alert", "status"], description: locale === "zh" ? "默认 alert。非紧急动态反馈可用 status。" : "Defaults to alert. Use status for non-urgent updates." },
  ],
  example: ({ title, description, variant, role }) => ({
    preview: <Alert variant={variant} role={role} style={{ width: "100%" }}><AlertTitle>{title}</AlertTitle><AlertDescription>{description}</AlertDescription></Alert>,
    code: `import { Alert, AlertTitle, AlertDescription } from "@yami/design-system";\n\n<Alert${jsxAttributes({ variant, role })}>\n  <AlertTitle>{${JSON.stringify(title)}}</AlertTitle>\n  <AlertDescription>{${JSON.stringify(description)}}</AlertDescription>\n</Alert>`,
  }),
};

type AlertDialogValues = { title: string; description: string; variant: "primary" | "emphasis"; keepMounted: boolean };

export const alertDialogProperties: PropertiesDefinition<AlertDialogValues> = {
  slug: "alert-dialog",
  previewMode: "document",
  initialValues: locale => ({ title: locale === "zh" ? "应用配送设置？" : "Apply delivery settings?", description: locale === "zh" ? "新设置将在下次下单时生效。" : "Your new settings will apply when you next place an order.", variant: "primary", keepMounted: false }),
  fields: ({ keepMounted }, locale) => [
    { key: "title", name: "AlertDialogTitle.children", kind: "text", type: "ReactNode", label: locale === "zh" ? "对话框标题" : "Dialog title", description: locale === "zh" ? "给对话框提供可访问名称。" : "Provides the dialog's accessible name." },
    { key: "description", name: "AlertDialogDescription.children", kind: "text", type: "ReactNode", label: locale === "zh" ? "对话框说明" : "Dialog description", description: locale === "zh" ? "说明确认操作后会发生什么。" : "Explain what happens after confirmation." },
    { key: "variant", name: "AlertDialogAction.variant", kind: "select", options: ["primary", "emphasis"], description: locale === "zh" ? "切换确认按钮的层级。" : "Change the prominence of the confirmation button." },
    { key: "keepMounted", name: "AlertDialogContent.keepMounted", kind: "switch",
      description: locale === "zh"
        ? `${keepMounted ? "已开启。弹窗关闭后隐藏，内容仍保留在 DOM 中。" : "已关闭。弹窗关闭后，内容会从 DOM 中移除。"}点击「确认更改」打开弹窗。`
        : `${keepMounted ? "On. The dialog stays in the DOM while hidden." : "Off. Closing the dialog removes its content from the DOM."} Select “Review changes” to open the dialog.` },
  ],
  example: ({ title, description, variant, keepMounted }, locale) => {
    const [trigger, cancel, confirm] = locale === "zh" ? ["确认更改", "取消", "应用设置"] : ["Review changes", "Cancel", "Apply settings"];
    const contentAttrs = jsxAttributes({ lang: locale, keepMounted: keepMounted || undefined });
    return {
      preview: <AlertDialog>
        <AlertDialogTrigger render={<Button variant="secondary" />}>{trigger}</AlertDialogTrigger>
        <AlertDialogContent lang={locale} keepMounted={keepMounted}>
          <AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{cancel}</AlertDialogCancel><AlertDialogAction variant={variant}>{confirm}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
      code: `import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, Button } from "@yami/design-system";\n\n<AlertDialog>\n  <AlertDialogTrigger render={<Button variant="secondary" />}>{${JSON.stringify(trigger)}}</AlertDialogTrigger>\n  <AlertDialogContent${contentAttrs}>\n    <AlertDialogHeader>\n      <AlertDialogTitle>{${JSON.stringify(title)}}</AlertDialogTitle>\n      <AlertDialogDescription>{${JSON.stringify(description)}}</AlertDialogDescription>\n    </AlertDialogHeader>\n    <AlertDialogFooter>\n      <AlertDialogCancel>{${JSON.stringify(cancel)}}</AlertDialogCancel>\n      <AlertDialogAction variant="${variant}">{${JSON.stringify(confirm)}}</AlertDialogAction>\n    </AlertDialogFooter>\n  </AlertDialogContent>\n</AlertDialog>`,
    };
  },
};

const ratios = { "16:9": 16 / 9, "1:1": 1, "3:4": 3 / 4 };
const ratioOptions = ["16:9", "1:1", "3:4"] as const;
const ratioStyle = { display: "grid", placeItems: "center", width: "min(100%, 240px)", background: "var(--surface-primary)", borderRadius: "var(--radius-surface-default)" };

export const aspectRatioProperties: PropertiesDefinition<{ ratio: keyof typeof ratios }> = {
  slug: "aspectratio",
  initialValues: () => ({ ratio: "16:9" }),
  fields: (_, locale) => [{ key: "ratio", kind: "select", options: ratioOptions, type: "number",
    group: { key: "required", title: locale === "zh" ? "必填" : "Required" },
    description: locale === "zh" ? "宽度除以高度。选择一个常用比例试用。" : "Width divided by height. Select a common ratio to try it." }],
  example: ({ ratio }) => ({
    preview: <AspectRatio ratio={ratios[ratio]} style={ratioStyle}>{ratio}</AspectRatio>,
    code: `import { AspectRatio } from "@yami/design-system";\n\n<AspectRatio ratio={${ratio.replace(":", " / ")}} style={${JSON.stringify(ratioStyle)}}>{${JSON.stringify(ratio)}}</AspectRatio>`,
  }),
};

export const avatarProperties: PropertiesDefinition<{ alt: string; size: AvatarSize; membershipTier: "none" | "ruby-0" | "ruby" | "silver" | "gold" }> = {
  slug: "avatar",
  initialValues: locale => ({ alt: locale === "zh" ? "用户头像" : "User avatar", size: "md", membershipTier: "none" }),
  fields: (_, locale) => [
    { key: "alt", kind: "text", label: locale === "zh" ? "头像无障碍名称" : "Avatar accessible name", group: { key: "required", title: locale === "zh" ? "必填" : "Required" }, description: locale === "zh" ? "通过 alt 提供名称。头像旁已有可见姓名时可传空字符串。" : "Name the image with alt. Use an empty string beside a visible name." },
    { key: "size", kind: "select", options: ["sm", "md", "lg"] },
    { key: "membershipTier", kind: "select", options: ["none", "ruby-0", "ruby", "silver", "gold"], type: '"ruby-0" | "ruby" | "silver" | "gold"', description: locale === "zh" ? "添加会员边框和角标。选择 none 时省略该属性。" : "Add the membership ring and tier mark. Select none to omit this prop." },
  ],
  example: ({ alt, size, membershipTier }, locale) => {
    const tier = membershipTier === "none" ? undefined : membershipTier;
    return {
      preview: <Avatar alt={alt} size={size} membershipTier={tier} lang={locale} />,
      code: `import { Avatar } from "@yami/design-system";\n\n<Avatar${jsxAttributes({ alt, size, membershipTier: tier, lang: locale })} />`,
    };
  },
};

const badgeTypes = ["price", "sale", "low-price", "discount", "new", "hot", "exclusive", "choice", "best-sellers"] as const;
const badgeColors = ["red", "blue", "green", "purple", "yellow", "neutral"] as const;

export const badgeProperties: PropertiesDefinition<{ text: string; type: BadgeType | "none"; size: BadgeSize; color: BadgeColor | "preset"; emphasis: BadgeEmphasis | "preset" }> = {
  slug: "badge",
  initialValues: locale => ({ text: locale === "zh" ? "促销" : "Sale", type: "sale", size: "sm", color: "preset", emphasis: "preset" }),
  fields: (_, locale) => [
    { key: "text", name: "children", type: "ReactNode", kind: "text", label: locale === "zh" ? "徽章文案" : "Badge label" },
    { key: "type", kind: "select", options: ["none", ...badgeTypes], type: "BadgeType", description: locale === "zh" ? "使用业务预设。选择 none 时省略 type。" : "Apply a semantic preset. Select none to omit type." },
    { key: "size", kind: "select", options: ["sm", "md"] },
    { key: "color", kind: "select", options: ["preset", ...badgeColors], type: "BadgeColor", description: locale === "zh" ? "显式颜色优先于预设。选择 preset 时使用组件的预设或默认颜色。" : "An explicit color overrides the preset. Select preset to use the component's preset or default color." },
    { key: "emphasis", kind: "select", options: ["preset", "primary", "secondary"], type: '"primary" | "secondary"', description: locale === "zh" ? "切换实底或浅底。黄色始终使用浅底。" : "Switch between solid and tinted fills. Yellow always uses a tinted fill." },
  ],
  example: ({ text, type, size, color, emphasis }) => {
    const props = { type: type === "none" ? undefined : type, size, color: color === "preset" ? undefined : color, emphasis: emphasis === "preset" ? undefined : emphasis };
    return {
      preview: <Badge {...props}>{text}</Badge>,
      code: `import { Badge } from "@yami/design-system";\n\n<Badge${jsxAttributes(props)}>{${JSON.stringify(text)}}</Badge>`,
    };
  },
};

export const breadcrumbProperties: PropertiesDefinition<{ current: string; size: "sm" | "md"; underline: boolean }> = {
  slug: "breadcrumb",
  initialValues: locale => ({ current: locale === "zh" ? "调味料" : "Seasonings", size: "sm", underline: true }),
  fields: (_, locale) => [
    { key: "current", name: "items", type: "readonly BreadcrumbItem[]", kind: "text", label: locale === "zh" ? "当前页名称" : "Current page label", group: { key: "required", title: locale === "zh" ? "必填" : "Required" }, description: locale === "zh" ? "编辑路径最后一项的名称。当前项用 current 标记。" : "Edit the last item in the trail. The current page uses current." },
    { key: "size", kind: "select", options: ["sm", "md"] },
    { key: "underline", kind: "switch", description: locale === "zh" ? "鼠标悬停时为链接显示下划线。" : "Underline links on mouse hover." },
  ],
  example: ({ current, size, underline }, locale) => {
    const items = [{ label: locale === "zh" ? "首页" : "Home", href: "/" }, { label: current.trim() || (locale === "zh" ? "调味料" : "Seasonings"), current: true }];
    return {
      preview: <Breadcrumb items={items} size={size} underline={underline} locale={locale} />,
      code: `import { Breadcrumb } from "@yami/design-system";\n\n<Breadcrumb${jsxAttributes({ size, underline: underline ? undefined : false, locale })}\n  items={[\n    ${items.map(item => JSON.stringify(item)).join(",\n    ")},\n  ]}\n/>`,
    };
  },
};

export const buttonGroupProperties: PropertiesDefinition<{ label: string; primary: string; secondary: string; full: boolean }> = {
  slug: "buttongroup",
  initialValues: locale => locale === "zh" ? { label: "地址操作", primary: "保存", secondary: "取消", full: false } : { label: "Address actions", primary: "Save", secondary: "Cancel", full: false },
  fields: (_, locale) => [
    { key: "label", name: "aria-label", kind: "text", label: locale === "zh" ? "按钮组名称" : "Button group name", group: { key: "required", title: locale === "zh" ? "必填" : "Required" }, description: locale === "zh" ? "说明这组操作的共同用途。" : "Name the related set of actions." },
    { key: "primary", name: "children", type: "ReactNode", kind: "text", label: locale === "zh" ? "主按钮文案" : "Primary button label", description: locale === "zh" ? "编辑主按钮的文案。" : "Edit the text of the primary button." },
    { key: "secondary", name: "children", type: "ReactNode", kind: "text", label: locale === "zh" ? "次按钮文案" : "Secondary button label", description: locale === "zh" ? "编辑次按钮的文案。" : "Edit the text of the secondary button." },
    { key: "full", kind: "switch", description: locale === "zh" ? "组内按钮等宽。子按钮同时使用 form=full。" : "Give the buttons equal width. The children also use form=full." },
  ],
  example: ({ label, primary, secondary, full }, locale) => {
    const name = label.trim() || (locale === "zh" ? "地址操作" : "Address actions");
    const save = primary.trim() || (locale === "zh" ? "保存" : "Save");
    const cancel = secondary.trim() || (locale === "zh" ? "取消" : "Cancel");
    const form = full ? "full" : undefined;
    return {
      preview: <ButtonGroup aria-label={name} full={full}><Button variant="secondary" form={form}>{cancel}</Button><Button form={form}>{save}</Button></ButtonGroup>,
      code: `import { Button, ButtonGroup } from "@yami/design-system";\n\n<ButtonGroup${jsxAttributes({ "aria-label": name, full: full || undefined })}>\n  <Button${jsxAttributes({ variant: "secondary", form })}>{${JSON.stringify(cancel)}}</Button>\n  <Button${jsxAttributes({ form })}>{${JSON.stringify(save)}}</Button>\n</ButtonGroup>`,
    };
  },
};
