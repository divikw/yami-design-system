import { ArrowRight } from "lucide-react";
import { Button, type ButtonForm, type ButtonSize, type ButtonVariant } from "@yami/design-system";
import { jsxAttributes, type PropertiesDefinition } from "./component-properties";

const variants = ["emphasis", "primary", "secondary", "tertiary", "destructive"] as const;
const sizes = ["sm", "md", "lg"] as const;
const forms = ["inline", "full", "icon"] as const;
const iconSizes = { sm: 16, md: 20, lg: 24 };
const defaultLabel = (locale: "zh" | "en") => locale === "zh" ? "继续" : "Continue";

export const buttonProperties: PropertiesDefinition<{
  text: string;
  variant: ButtonVariant;
  size: ButtonSize;
  form: ButtonForm;
  disabled: boolean;
  loading: boolean;
}> = {
  slug: "button",
  initialValues: locale => ({ text: defaultLabel(locale), variant: "primary", size: "md", form: "inline", disabled: false, loading: false }),
  fields: ({ form }, locale) => {
    const zh = locale === "zh";
    const iconOnly = form === "icon";
    const label = iconOnly ? (zh ? "无障碍名称" : "Accessible name") : (zh ? "按钮文案" : "Button label");
    return [
      {
        key: "text", kind: "text", name: iconOnly ? "aria-label" : "children", label, placeholder: defaultLabel(locale),
        type: iconOnly ? "string" : "ReactNode",
        group: { key: "name", title: iconOnly ? (zh ? "必填" : "Required") : (zh ? "按钮名称" : "Button name") },
        description: iconOnly
          ? (zh ? "为纯图标按钮提供可访问名称，说明点击后会执行什么操作。" : "Give the icon-only button an accessible name that describes its action.")
          : (zh ? "按钮上显示的文字，也是按钮的可访问名称。" : "The visible button text also provides its accessible name."),
      },
      { key: "variant", kind: "select", label: zh ? "视觉层级（variant）" : "Variant", options: variants },
      { key: "size", kind: "select", label: zh ? "尺寸（size）" : "Size", options: sizes },
      { key: "form", kind: "select", label: zh ? "形态（form）" : "Form", options: forms },
      { key: "disabled", kind: "switch", label: zh ? "禁用（disabled）" : "Disabled" },
      { key: "loading", kind: "switch", label: zh ? "加载（loading）" : "Loading" },
    ];
  },
  example: ({ text, variant, size, form, disabled, loading }, locale) => {
    const label = text.trim() ? text : defaultLabel(locale);
    const iconOnly = form === "icon";
    const iconSize = iconSizes[size];
    const attrs = jsxAttributes({ variant, size, form, disabled: disabled || undefined, loading: loading || undefined, "aria-label": iconOnly ? label : undefined });
    const imports = ['import { Button } from "@yami/design-system";'];
    if (iconOnly) imports.push('import { ArrowRight } from "lucide-react";');
    return {
      preview: <Button variant={variant} size={size} form={form} disabled={disabled} loading={loading} aria-label={iconOnly ? label : undefined}>
        {iconOnly ? <ArrowRight size={iconSize} aria-hidden="true" /> : label}
      </Button>,
      code: `${imports.join("\n")}\n\n<Button${attrs}>\n  ${iconOnly ? `<ArrowRight size={${iconSize}} aria-hidden="true" />` : `{${JSON.stringify(label)}}`}\n</Button>`,
    };
  },
};
