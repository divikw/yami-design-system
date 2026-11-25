import { Coupon, type CouponProps } from "@yami/design-system";
import type { DocsLocale } from "./component-docs-template";
import { jsxAttributes, type PropertiesDefinition } from "./component-properties";

type ClaimStatus = NonNullable<CouponProps["claim"]>["status"];
type CouponValues = {
  mode: "claim" | "selection";
  title: string;
  description: string;
  validity: string;
  disabled: boolean;
  selected: boolean;
  status: ClaimStatus;
  claimLabel: string;
  useHref: string;
  useLabel: string;
};

const claimLabels: Record<DocsLocale, Record<ClaimStatus, string>> = {
  zh: { available: "领取", claiming: "领取中", claimed: "已领取" },
  en: { available: "Claim", claiming: "Claiming…", claimed: "Claimed" },
};
const imports = 'import { useState } from "react";\nimport { Coupon } from "@yami/design-system";';
const previewStyle = { width: "min(100%, 416px)" };

export const couponProperties: PropertiesDefinition<CouponValues> = {
  slug: "coupon",
  initialValues(locale) {
    const zh = locale === "zh";
    return {
      mode: "claim",
      title: zh ? "立享 10% OFF" : "Save 10%",
      description: zh ? "亚米自营商品通用，特殊商品除外" : "Valid on Yami-fulfilled items. Exclusions apply.",
      validity: zh ? "有效期至 01/01/2027 15:59" : "Valid until 01/01/2027 15:59",
      disabled: false,
      selected: false,
      status: "available",
      claimLabel: "",
      useHref: "",
      useLabel: "",
    };
  },
  fields({ mode, status }, locale) {
    const zh = locale === "zh";
    const preview = { key: "preview", title: zh ? "预览设置" : "Preview settings" } as const;
    const required = { key: "required", title: zh ? "必填属性" : "Required" } as const;
    const modeFields: ReturnType<PropertiesDefinition<CouponValues>["fields"]> = mode === "selection"
      ? [{ key: "selected", label: zh ? "已选中" : "Selected", kind: "switch", group: required,
        description: zh ? "切换选券状态，点击预览中的卡片也会同步更新。" : "Toggle selection. Selecting the card in the preview also updates this value." }]
      : [
        { key: "status", name: "claim.status", label: zh ? "领取状态" : "Claim status", kind: "select",
          options: ["available", "claiming", "claimed"], optionLabels: claimLabels[locale], group: required,
          description: zh ? "控制是否可以领取、正在领取或已领取。" : "Controls whether the coupon is available to claim, pending, or already claimed." },
        { key: "claimLabel", name: "claim.label", label: status === "claimed" ? (zh ? "已领取文案" : "Claimed status label") : (zh ? "领取按钮文案" : "Claim button label"), kind: "text", placeholder: claimLabels[locale][status],
          description: zh ? "留空时，预览会按领取状态填入文案。" : "When blank, the preview supplies a label for the current status." },
        ...(status === "claimed" ? [
          { key: "useHref", name: "claim.useLink.href", label: zh ? "去使用链接地址" : "Redemption URL", kind: "text",
            description: zh ? "填写地址后，已领取状态会显示去使用链接。" : "Enter a URL to show a redemption link after the coupon is claimed." },
          { key: "useLabel", name: "claim.useLink.label", label: zh ? "去使用链接文案" : "Redemption link label", kind: "text", placeholder: zh ? "去使用" : "Use now",
            description: zh ? "填写链接地址后，使用这段文字作为链接名称。" : "Text displayed for the redemption link when a URL is set." },
        ] as const : []),
      ];

    return [
      { key: "mode", label: zh ? "优惠券模式" : "Coupon mode", kind: "select", options: ["claim", "selection"],
        optionLabels: { claim: zh ? "领取优惠券" : "Claim coupon", selection: zh ? "结算时选券" : "Select at checkout" }, group: preview,
        description: zh ? "切换领取优惠券或结算时选券的预览。" : "Switch between the claim and checkout selection previews." },
      { key: "title", label: zh ? "优惠券标题" : "Coupon title", kind: "text", required: true, group: required },
      { key: "description", label: zh ? "使用条件" : "Offer conditions", kind: "text", required: true, group: required,
        description: zh ? "展示优惠券的使用条件。优惠券不可用时可说明原因。" : "Shows the offer conditions or explains why the coupon is unavailable." },
      ...modeFields,
      { key: "validity", label: zh ? "有效期" : "Validity", kind: "text" },
      { key: "disabled", label: zh ? "禁用" : "Disabled", kind: "switch" },
    ];
  },
  example(values, locale, _device, update) {
    const { mode, title, description, validity, disabled, selected, status, claimLabel, useHref, useLabel } = values;
    const props = { title, description, validity: validity || undefined, disabled: disabled || undefined };
    const attributes = jsxAttributes(props);

    if (mode === "selection") {
      return {
        preview: <div style={previewStyle}>
          <Coupon {...props} selected={selected} onSelectedChange={next => update?.({ selected: next })} />
        </div>,
        code: `${imports}\n\nfunction SelectableCoupon() {\n  const [selected, setSelected] = useState(${selected});\n\n  return <Coupon${attributes} selected={selected} onSelectedChange={setSelected} />;\n}`,
      };
    }

    const labels = claimLabels[locale];
    const href = useHref.trim();
    const useLink = href ? { href, label: useLabel || (locale === "zh" ? "去使用" : "Use now") } : undefined;
    const labelCode = claimLabel ? JSON.stringify(claimLabel) : `${JSON.stringify(labels)}[status]`;
    const useLinkCode = useLink ? `\n    useLink: ${JSON.stringify(useLink)},` : "";
    return {
      preview: <div style={previewStyle}>
        <Coupon {...props} claim={{ status, label: claimLabel || labels[status], onClaim: () => update?.({ status: "claimed" }), useLink }} />
      </div>,
      code: `${imports}\n\nfunction ClaimableCoupon() {\n  const [status, setStatus] = useState<"available" | "claiming" | "claimed">(${JSON.stringify(status)});\n\n  const claim = {\n    status,\n    label: ${labelCode},\n    onClaim: () => setStatus("claimed"),${useLinkCode}\n  };\n\n  return <Coupon${attributes} claim={claim} />;\n}`,
    };
  },
};
